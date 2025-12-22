<script>
  import browser from 'webextension-polyfill';

  // Simple state management
  let servers = $state([]);
  let currentServer = $state({
    name: '',
    url: '',
    env: {},
    command: '',
    args: []
  });
  let isEditing = $state(false);
  let editIndex = $state(-1);
  let showEnvEditor = $state(false);
  let envKey = $state('');
  let envValue = $state('');
  let argInput = $state('');
  let status = $state('');
  let debugLog = $state(false);
  let darkMode = $state(false);

  // Health check state
  let bridgeStatus = $state('checking');
  let bridgeHealth = $state(null);
  let diagnostics = $state({});
  let lastChecked = $state(null);
  let bridgeLatency = $state(null);
  let errorDetails = $state(null);

  // Run diagnostics for active sessions with latency
  async function runDiagnostics(sessionIds) {
    const results = {};
    for (const id of sessionIds || []) {
      const name = id.split('-').pop();
      try {
        const startTime = performance.now();
        const resp = await fetch(`http://localhost:3000/api/diagnostic/${id}`);
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        const data = await resp.json();
        results[name] = {
          status: data.success ? 'healthy' : 'error',
          latency: latency,
          lastCheck: new Date()
        };
      } catch (e) {
        results[name] = {
          status: 'unreachable',
          error: e.message,
          lastCheck: new Date()
        };
      }
    }
    diagnostics = results;
  }

  // Set theme on document body
  function updateTheme() {
    document.body.setAttribute('data-theme', 'claude');
    document.body.setAttribute('data-mode', darkMode ? 'dark' : 'light');
  }

  // Check bridge health with latency and error details
  async function checkBridgeHealth() {
    try {
      bridgeStatus = 'checking';
      errorDetails = null;
      
      const startTime = performance.now();
      const response = await fetch('http://localhost:3000/health', {
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      const endTime = performance.now();
      bridgeLatency = Math.round(endTime - startTime);

      if (response.ok) {
        bridgeHealth = await response.json();
        bridgeStatus = 'connected';
        lastChecked = new Date();
        
        // Run diagnostics if connected
        runDiagnostics(bridgeHealth.sessionIds);
      } else {
        bridgeStatus = 'error';
        bridgeHealth = null;
        diagnostics = {};
        errorDetails = {
          type: 'http_error',
          code: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`,
          action: 'Check server logs for details'
        };
      }
    } catch (e) {
      bridgeStatus = 'disconnected';
      bridgeHealth = null;
      diagnostics = {};
      bridgeLatency = null;
      
      // Determine error type and provide actionable message
      if (e.name === 'AbortError' || e.name === 'TimeoutError') {
        errorDetails = {
          type: 'timeout',
          message: 'Server not responding after 3 seconds',
          action: 'Check if server is running: brew services info mcp-bridge'
        };
      } else if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        errorDetails = {
          type: 'offline',
          message: 'Bridge server is offline',
          action: 'Start bridge: brew services start mcp-bridge'
        };
      } else {
        errorDetails = {
          type: 'unknown',
          message: e.message,
          action: 'Check browser console for details'
        };
      }
    }
  }

  // Load data on startup
  $effect(() => {
    loadData();
    checkBridgeHealth();

    // Check bridge health every 10 seconds
    const healthInterval = setInterval(checkBridgeHealth, 10000);

    return () => clearInterval(healthInterval);
  });

  // Load all data from storage
  async function loadData() {
    try {
      const result = await browser.storage.local.get();

      // Convert object to array if needed (one simple line)
      let localServers = result.mcpServers ? Object.values(result.mcpServers) : [];
      
      // Fetch bridge config and merge
      try {
        const bridgeResp = await fetch('http://localhost:3000/api/config');
        if (bridgeResp.ok) {
          const bridgeConfig = await bridgeResp.json();
          const bridgeServers = (bridgeConfig.servers || []).map(s => ({
            name: s.name,
            url: `http://localhost:3000/sse/global/${s.name}`, // Use global endpoint
            command: '', // No command needed for global servers
            args: []
          }));
          
          // Merge: bridge servers take precedence
          const serverMap = {};
          localServers.forEach(s => serverMap[s.name] = s);
          bridgeServers.forEach(s => serverMap[s.name] = s);
          
          servers = Object.values(serverMap);
          
          // Save merged servers back to storage
          const serversObj = {};
          servers.forEach(s => serversObj[s.name] = s);
          await browser.storage.local.set({ mcpServers: serversObj });
        }
      } catch (e) {
        // Bridge not available, use local only
        servers = localServers;
      }

      debugLog = Boolean(result.mcpDebugLog);
      darkMode = result.mcpDarkMode !== undefined ?
                Boolean(result.mcpDarkMode) :
                window.matchMedia('(prefers-color-scheme: dark)').matches;

      status = `Loaded ${servers.length} server${servers.length !== 1 ? 's' : ''}`;

      // Apply theme
      updateTheme();

      // Add listener for dark mode changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (result.mcpDarkMode === undefined) {
          darkMode = e.matches;
          updateTheme();
        }
      });
    } catch (e) {
      console.error('Error loading data:', e);
      status = `Error loading: ${e.message}`;
    }
  }


  // Save a server
  function saveServer() {
    if (!currentServer.name || !currentServer.url) {
      status = 'Name and URL are required';
      return;
    }

    try {
      if (isEditing && editIndex >= 0) {
        // Update existing server
        const newServers = Array.isArray(servers) ? Array.from(servers) : [];
        newServers[editIndex] = {...currentServer};
        servers = newServers;
        status = `✅ Updated server: ${currentServer.name}`;
      } else {
        // Add new server
        const currentServers = Array.isArray(servers) ? Array.from(servers) : [];
        const newServer = {...currentServer};
        currentServers.push(newServer);
        servers = currentServers;
        status = `✅ Added server: ${currentServer.name}`;
      }

      // Save to storage
      saveToStorage('mcpServers', servers);

      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error in saveServer:', err);
      status = `❌ Error: ${err.message}`;
    }
  }

  // Delete a server
  function deleteServer(index) {
    if (confirm(`Delete server ${servers[index].name}?`)) {
      try {
        const currentServers = Array.isArray(servers) ? Array.from(servers) : [];
        const updatedServers = [];

        for (let i = 0; i < currentServers.length; i++) {
          if (i !== index) {
            updatedServers.push(currentServers[i]);
          }
        }

        servers = updatedServers;
        saveToStorage('mcpServers', servers);
        status = '✅ Server deleted';
      } catch (err) {
        console.error('Error in deleteServer:', err);
        status = `❌ Error: ${err.message}`;
      }
    }
  }

  // Edit server
  function editServer(index) {
    currentServer = { ...servers[index] };
    isEditing = true;
    editIndex = index;
  }

  // Reset form
  function resetForm() {
    currentServer = {
      name: '',
      url: '',
      env: {},
      command: '',
      args: []
    };
    isEditing = false;
    editIndex = -1;
    showEnvEditor = false;
    envKey = '';
    envValue = '';
    argInput = '';
  }

  // Add environment variable
  function addEnvVar() {
    if (!envKey) return;
    currentServer = {
      ...currentServer,
      env: {
        ...currentServer.env,
        [envKey]: envValue
      }
    };
    envKey = '';
    envValue = '';
  }

  // Delete environment variable
  function deleteEnvVar(key) {
    const newEnv = {...currentServer.env};
    delete newEnv[key];
    currentServer = {
      ...currentServer,
      env: newEnv
    };
  }

  // Add argument
  function addArg() {
    if (!argInput) return;
    currentServer = {
      ...currentServer,
      args: [...currentServer.args, argInput]
    };
    argInput = '';
  }

  // Delete argument
  function deleteArg(index) {
    currentServer = {
      ...currentServer,
      args: currentServer.args.filter((_, i) => i !== index)
    };
  }

  // Toggle dark mode
  function toggleDarkMode() {
    darkMode = !darkMode;
    updateTheme();
    saveToStorage('mcpDarkMode', darkMode);
  }

  // Helper function to save to storage with notification
  async function saveToStorage(key, value) {
    try {
      const plainValue = JSON.parse(JSON.stringify(value));
      await browser.storage.local.set({ [key]: plainValue });
    } catch (e) {
      status = `Error saving: ${e.message}`;
      console.error(`Error saving ${key}:`, e);
    }
  }

  // Get status color class
  function getStatusClass() {
    switch(bridgeStatus) {
      case 'connected': return 'status-connected';
      case 'checking': return 'status-checking';
      case 'disconnected': return 'status-disconnected';
      case 'error': return 'status-error';
      default: return 'status-checking';
    }
  }

  // Get status text
  function getStatusText() {
    switch(bridgeStatus) {
      case 'connected': return 'Connected';
      case 'checking': return 'Checking...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  }

  // Get status icon
  function getStatusIcon() {
    switch(bridgeStatus) {
      case 'connected': return '●';
      case 'checking': return '⏳';
      case 'disconnected': return '⚠️';
      case 'error': return '❌';
      default: return '○';
    }
  }

  // Server templates for quick setup
  const templates = {
    filesystem: {
      name: 'filesystem',
      url: 'http://localhost:3000/sse',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/dt'],
      env: {}
    },
    shell: {
      name: 'shell',
      url: 'http://localhost:3000/sse',
      command: '/Users/dt/projects/dev-tools/shell-mcp-server/build/index.js',
      args: [],
      env: {}
    },
    git: {
      name: 'git',
      url: 'http://localhost:3000/sse',
      command: 'uvx',
      args: ['mcp-server-git', '--repository', '/Users/dt/projects'],
      env: {}
    }
  };

  // Use a template to populate the form
  function useTemplate(templateName) {
    const template = templates[templateName];
    if (!template) return;

    currentServer = { ...template };
    isEditing = false;
    editIndex = -1;
    status = `📋 Using ${templateName} template - adjust paths as needed`;

  // Scroll to form smoothly
    setTimeout(() => {
      document.querySelector('.server-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Launch Claude with pre-flight check
  async function launchClaude() {
    status = '🚀 Launching Claude Research Session...';
    try {
      // Pre-flight bridge check
      await checkBridgeHealth();
      if (bridgeStatus !== 'connected') {
        status = '❌ Bridge is offline! Start it before launching.';
        return;
      }

      // Open Claude in a new tab
      window.open('https://claude.ai/new', '_blank');
      status = '✅ Claude opened! Check the health overlay in the bottom right.';
    } catch (e) {
      status = `❌ Error launching: ${e.message}`;
    }
  }
</script>

<div class="bridge-popup">
  <!-- Header with Bridge Icon -->
  <div class="bridge-header">
    <div class="bridge-title">
      <span class="bridge-icon">🌉</span>
      <h1>MCP Bridge</h1>
    </div>
    <button
      onclick={toggleDarkMode}
      class="theme-toggle"
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  </div>

  <!-- Health Check Indicator -->
  <div class="health-check {getStatusClass()}">
    <div class="health-main">
      <span class="health-icon">{getStatusIcon()}</span>
      <div class="health-info">
        <div class="health-status">
          {getStatusText()}
          {#if bridgeStatus === 'connected' && bridgeLatency !== null}
            <span class="latency-badge">{bridgeLatency}ms</span>
          {/if}
        </div>
        <div class="health-url">http://localhost:3000/sse</div>
      </div>
      <button onclick={checkBridgeHealth} class="health-refresh" title="Refresh Status">↻</button>
    </div>
    {#if bridgeStatus === 'connected' && bridgeHealth}
      <div class="health-details">
        {servers.length} server{servers.length !== 1 ? 's' : ''} configured
        {#if bridgeHealth.activeSessions !== undefined}
          · {bridgeHealth.activeSessions} active session{bridgeHealth.activeSessions !== 1 ? 's' : ''}
        {/if}
        {#if lastChecked}
          · Last checked {new Date(lastChecked).toLocaleTimeString()}
        {/if}
      </div>
      
      <!-- Active Server Diagnostics with Latency -->
      {#if Object.keys(diagnostics).length > 0}
        <div class="server-health-list">
          {#each Object.entries(diagnostics) as [name, diag]}
            <div class="server-health-item">
              <span class="status-dot {diag.status}"></span>
              <span class="server-name-label">{name}</span>
              {#if diag.latency}
                <span class="server-latency">{diag.latency}ms</span>
              {/if}
              <span class="status-label">{diag.status}</span>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
    {#if (bridgeStatus === 'disconnected' || bridgeStatus === 'error') && errorDetails}
      <div class="error-details">
        <div class="error-message">⚠️ {errorDetails.message}</div>
        <div class="error-action">
          <strong>Action:</strong> <code>{errorDetails.action}</code>
        </div>
      </div>
    {:else if bridgeStatus === 'disconnected'}
      <div class="health-hint">
        Start bridge: <code>brew services start mcp-bridge</code>
      </div>
    {/if}
  </div>

  <!-- Summary Panel: ADHD-Friendly Stats + Quick Templates -->
  <div class="summary-panel">
    <!-- Big Launch Button -->
    <div class="launch-section">
      <button onclick={launchClaude} class="btn-launch-large">
        <span class="launch-icon">🚀</span>
        <div class="launch-text">
          <div class="launch-title">Start Research Session</div>
          <div class="launch-subtitle">Open Claude.ai & Auto-Connect MCP</div>
        </div>
      </button>
    </div>

    <!-- Visual Status Cards -->
    <div class="status-cards">
      <div class="stat-card {getStatusClass()}">
        <div class="stat-icon">{getStatusIcon()}</div>
        <div class="stat-content">
          <div class="stat-label">Bridge</div>
          <div class="stat-value">{getStatusText()}</div>
        </div>
      </div>

      <div class="stat-card stat-neutral">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">Servers</div>
          <div class="stat-value">{servers.length}</div>
        </div>
      </div>

      <div class="stat-card stat-neutral">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-label">Sessions</div>
          <div class="stat-value">{bridgeHealth?.activeSessions ?? 0}</div>
        </div>
      </div>
    </div>

    <!-- Quick Template Buttons -->
    <div class="quick-actions">
      <span class="quick-label">Quick Add:</span>
      <button onclick={() => useTemplate('filesystem')} class="quick-btn" title="Add Filesystem Server">
        📁 Filesystem
      </button>
      <button onclick={() => useTemplate('shell')} class="quick-btn" title="Add Shell Server">
        🐚 Shell
      </button>
      <button onclick={() => useTemplate('git')} class="quick-btn" title="Add Git Server">
        📊 Git
      </button>
    </div>
  </div>

  <!-- Status Message -->
  {#if status}
    <div class="status-message">
      {status}
    </div>
  {/if}

  <!-- Server Form -->
  <div class="server-form bridge-card">
    <h2 class="card-title">{isEditing ? '✏️ Edit Server' : '➕ Add Server'}</h2>

    <div class="form-grid">
      <div class="form-field">
        <label for="name">Name</label>
        <input
          id="name"
          bind:value={currentServer.name}
          placeholder="filesystem"
          class="input-field"
        />
      </div>

      <div class="form-field">
        <label for="url">SSE Bridge URL</label>
        <input
          id="url"
          bind:value={currentServer.url}
          placeholder="http://localhost:3000/sse"
          class="input-field"
        />
      </div>

      <div class="form-field">
        <label for="command">Command</label>
        <input
          id="command"
          bind:value={currentServer.command}
          placeholder="npx"
          class="input-field"
        />
      </div>
    </div>

    <div class="form-sections">
      <!-- Arguments -->
      <div class="form-section">
        <h3>Arguments</h3>

        <div class="input-group">
          <input
            bind:value={argInput}
            placeholder="Add argument"
            class="input-field-small"
            onkeypress={(e) => e.key === 'Enter' && addArg()}
          />
          <button onclick={addArg} class="btn-add">+</button>
        </div>

        <div class="args-list">
          {#each currentServer.args || [] as arg, i}
            <div class="arg-item">
              <span class="arg-text">{arg}</span>
              <button onclick={() => deleteArg(i)} class="btn-remove">×</button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Environment Variables -->
      <div class="form-section">
        <div class="section-header">
          <h3>Environment</h3>
          <button
            onclick={() => showEnvEditor = !showEnvEditor}
            class="btn-toggle"
          >
            {showEnvEditor ? 'Hide' : 'Show'}
          </button>
        </div>

        {#if showEnvEditor}
          <div class="input-group">
            <input
              bind:value={envKey}
              placeholder="Key"
              class="input-field-small"
            />
            <input
              bind:value={envValue}
              placeholder="Value"
              class="input-field-small"
            />
            <button onclick={addEnvVar} class="btn-add">+</button>
          </div>

          <div class="env-list">
            {#each Object.entries(currentServer.env || {}) as [key, value]}
              <div class="env-item">
                <span class="env-key">{key}:</span>
                <span class="env-value">{value}</span>
                <button onclick={() => deleteEnvVar(key)} class="btn-remove">×</button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="form-actions">
      <button onclick={saveServer} class="btn-primary">
        {isEditing ? 'Update Server' : 'Add Server'}
      </button>
      {#if isEditing}
        <button onclick={resetForm} class="btn-secondary">Cancel</button>
      {/if}
    </div>
  </div>

  <!-- Server List -->
  <div class="servers-section">
    <h2 class="section-title">
      Servers
      <span class="server-count">({Array.isArray(servers) ? servers.length : 0})</span>
    </h2>

    {#if !Array.isArray(servers) || servers.length === 0}
      <div class="empty-state bridge-card">
        <div class="empty-icon">📭</div>
        <div class="empty-text">No servers configured</div>
        <div class="empty-hint">Add your first MCP server above</div>
      </div>
    {:else}
      <div class="server-grid">
        {#each servers as server, i}
          <div class="server-card bridge-card">
            <div class="server-header">
              <div class="server-name">{server.name}</div>
              <div class="server-actions">
                <button onclick={() => editServer(i)} class="btn-edit">Edit</button>
                <button onclick={() => deleteServer(i)} class="btn-delete">×</button>
              </div>
            </div>
            <div class="server-url">{server.url}</div>
            <div class="server-command">
              <code>{server.command} {(server.args || []).join(' ')}</code>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <div class="bridge-footer">
    <label class="debug-toggle">
      <input
        type="checkbox"
        bind:checked={debugLog}
        onchange={() => saveToStorage('mcpDebugLog', debugLog)}
      />
      <span>Debug Logging</span>
    </label>

    <div class="footer-version">v2.0.0</div>
  </div>
</div>

<style>
  /* MCP Bridge Theme Variables */
  :global(:root) {
    --bridge-primary: #4F46E5;
    --bridge-primary-light: #818CF8;
    --bridge-accent: #14B8A6;
    --bridge-success: #22C55E;
    --bridge-warning: #F59E0B;
    --bridge-error: #EF4444;
    --bridge-gradient: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%);
    --bridge-radius: 12px;
    --bridge-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    --bridge-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bridge-popup {
    width: 600px;
    min-height: 400px;
    max-height: 600px;
    padding: 16px;
    background: hsl(var(--bg-000));
    color: hsl(var(--text-100));
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Header */
  .bridge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid transparent;
    border-image: var(--bridge-gradient) 1;
  }

  .bridge-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bridge-icon {
    font-size: 24px;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .bridge-title h1 {
    font-size: 20px;
    font-weight: 800;
    margin: 0;
    background: var(--bridge-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Launch Button */
  .launch-section {
    margin-bottom: 20px;
  }

  .btn-launch-large {
    width: 100%;
    padding: 16px;
    background: var(--bridge-gradient);
    border: none;
    border-radius: var(--bridge-radius);
    color: white;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: var(--bridge-transition);
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
  }

  .btn-launch-large:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    filter: brightness(1.1);
  }

  .btn-launch-large:active {
    transform: translateY(0);
  }

  .launch-icon {
    font-size: 32px;
  }

  .launch-text {
    text-align: left;
  }

  .launch-title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  }

  .launch-subtitle {
    font-size: 12px;
    opacity: 0.9;
    font-weight: 400;
  }

  .theme-toggle {
    width: 32px;
    height: 32px;
    border: none;
    background: hsl(var(--bg-200));
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: var(--bridge-transition);
  }

  .theme-toggle:hover {
    background: hsl(var(--bg-300));
    transform: translateY(-2px);
  }

  /* Health Check */
  .health-check {
    padding: 12px;
    border-radius: var(--bridge-radius);
    margin-bottom: 16px;
    transition: var(--bridge-transition);
    border-left: 4px solid;
  }

  .health-main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .health-icon {
    font-size: 20px;
  }

  .health-info {
    flex: 1;
  }

  .health-status {
    font-weight: 600;
    font-size: 14px;
  }

  .status-connected .health-status {
    color: var(--bridge-success);
  }

  .status-checking .health-status {
    color: var(--bridge-warning);
  }

  .status-disconnected .health-status,
  .status-error .health-status {
    color: var(--bridge-error);
  }

  .health-url {
    font-size: 11px;
    opacity: 0.7;
    font-family: 'JetBrains Mono', monospace;
  }

  .health-refresh {
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: var(--bridge-transition);
  }

  .health-refresh:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(180deg);
  }

  .health-details {
    margin-top: 8px;
    font-size: 12px;
    opacity: 0.8;
  }

  .health-hint code {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Diagnostics */
  .server-health-list {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .server-health-item {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.2);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-dot.healthy { background-color: var(--bridge-success); box-shadow: 0 0 6px var(--bridge-success); }
  .status-dot.error { background-color: var(--bridge-error); }
  .status-dot.unreachable { background-color: var(--bridge-warning); }

  .server-name-label {
    font-weight: 600;
  }

  .status-label {
    opacity: 0.5;
    text-transform: uppercase;
    font-size: 9px;
  }

  /* Latency indicators */
  .latency-badge {
    display: inline-block;
    background: rgba(34, 197, 94, 0.2);
    color: var(--bridge-success);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    margin-left: 8px;
    font-family: 'JetBrains Mono', monospace;
  }

  .server-latency {
    font-size: 10px;
    opacity: 0.6;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Error details */
  .error-details {
    margin-top: 12px;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
    border-left: 3px solid var(--bridge-error);
  }

  .error-message {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--bridge-error);
  }

  .error-action {
    font-size: 11px;
    opacity: 0.9;
  }

  .error-action code {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
  }

  /* Status Colors */
  .status-connected {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%);
    border-left-color: var(--bridge-success);
  }

  .status-checking {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
    border-left-color: var(--bridge-warning);
  }

  .status-checking .health-icon {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .status-disconnected, .status-error {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
    border-left-color: var(--bridge-error);
  }

  /* Status Message */
  .status-message {
    padding: 8px 12px;
    background: hsl(var(--bg-200));
    border-radius: 8px;
    font-size: 12px;
    margin-bottom: 16px;
    opacity: 0.9;
  }

  /* Bridge Card */
  .bridge-card {
    background: linear-gradient(180deg, hsl(var(--bg-200)) 0%, rgba(79, 70, 229, 0.02) 100%);
    border: 1px solid rgba(79, 70, 229, 0.15);
    border-radius: var(--bridge-radius);
    padding: 16px;
    transition: var(--bridge-transition);
    position: relative;
    overflow: hidden;
  }

  .bridge-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--bridge-gradient);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .bridge-card:hover::before {
    opacity: 1;
  }

  .bridge-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--bridge-shadow);
  }

  /* Form */
  .server-form {
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: hsl(var(--text-000));
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .form-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 6px;
    color: hsl(var(--text-300));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .input-field {
    width: 100%;
    padding: 8px 12px;
    background: hsl(var(--bg-100));
    border: 1px solid rgba(79, 70, 229, 0.2);
    border-radius: 8px;
    color: hsl(var(--text-100));
    font-size: 13px;
    transition: var(--bridge-transition);
  }

  .input-field:focus {
    outline: none;
    border-color: var(--bridge-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .form-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .form-section {
    background: hsl(var(--bg-100));
    border: 1px solid hsl(var(--border-100));
    border-radius: 8px;
    padding: 12px;
  }

  .form-section h3 {
    font-size: 12px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: hsl(var(--text-300));
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .btn-toggle {
    padding: 4px 8px;
    font-size: 11px;
    background: hsl(var(--bg-200));
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: var(--bridge-transition);
  }

  .btn-toggle:hover {
    background: hsl(var(--bg-300));
  }

  .input-group {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .input-field-small {
    flex: 1;
    padding: 6px 8px;
    background: hsl(var(--bg-000));
    border: 1px solid hsl(var(--border-100));
    border-radius: 6px;
    color: hsl(var(--text-200));
    font-size: 12px;
  }

  .input-field-small:focus {
    outline: none;
    border-color: var(--bridge-primary);
  }

  .btn-add {
    width: 32px;
    height: 32px;
    background: var(--bridge-gradient);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: var(--bridge-transition);
  }

  .btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  .args-list, .env-list {
    max-height: 120px;
    overflow-y: auto;
  }

  .arg-item, .env-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: hsl(var(--bg-000));
    border-radius: 4px;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .arg-text, .env-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .env-key {
    font-weight: 600;
    color: hsl(var(--text-300));
  }

  .btn-remove {
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    color: var(--bridge-error);
    font-size: 18px;
    cursor: pointer;
    border-radius: 4px;
    transition: var(--bridge-transition);
  }

  .btn-remove:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .form-actions {
    display: flex;
    gap: 8px;
  }

  .btn-primary {
    flex: 1;
    padding: 10px 20px;
    background: var(--bridge-gradient);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: var(--bridge-transition);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
  }

  .btn-secondary {
    padding: 10px 20px;
    background: hsl(var(--bg-300));
    border: none;
    border-radius: 8px;
    color: hsl(var(--text-200));
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: var(--bridge-transition);
  }

  .btn-secondary:hover {
    background: hsl(var(--bg-400));
  }

  /* Servers Section */
  .servers-section {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: hsl(var(--text-000));
  }

  .server-count {
    font-weight: 400;
    opacity: 0.6;
  }

  .empty-state {
    text-align: center;
    padding: 32px 16px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .empty-hint {
    font-size: 12px;
    opacity: 0.6;
  }

  .server-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .server-card {
    padding: 12px;
  }

  .server-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .server-name {
    font-size: 14px;
    font-weight: 700;
    color: hsl(var(--text-000));
  }

  .server-actions {
    display: flex;
    gap: 4px;
  }

  .btn-edit {
    padding: 4px 8px;
    font-size: 11px;
    background: hsl(var(--bg-300));
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: var(--bridge-transition);
  }

  .btn-edit:hover {
    background: var(--bridge-primary);
    color: white;
  }

  .btn-delete {
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    color: var(--bridge-error);
    font-size: 18px;
    cursor: pointer;
    border-radius: 4px;
    transition: var(--bridge-transition);
  }

  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .server-url {
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: hsl(var(--text-300));
    margin-bottom: 8px;
  }

  .server-command {
    background: hsl(var(--bg-100));
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 11px;
  }

  .server-command code {
    font-family: 'JetBrains Mono', monospace;
    color: var(--bridge-accent);
  }

  /* Footer */
  .bridge-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid hsl(var(--border-100));
    font-size: 12px;
  }

  .debug-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .debug-toggle input[type="checkbox"] {
    cursor: pointer;
  }

  .footer-version {
    opacity: 0.5;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Summary Panel: ADHD-Friendly Stats + Quick Templates */
  .summary-panel {
    margin-bottom: 16px;
  }

  /* Status Cards Grid */
  .status-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: var(--bridge-radius);
    border: 2px solid;
    transition: var(--bridge-transition);
    cursor: default;
  }

  .stat-card .stat-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
    min-width: 0;
  }

  .stat-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.7;
    margin-bottom: 2px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Status-specific stat card colors */
  .stat-card.status-connected {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(20, 184, 166, 0.1) 100%);
    border-color: var(--bridge-success);
  }

  .stat-card.status-checking {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
    border-color: var(--bridge-warning);
  }

  .stat-card.status-disconnected,
  .stat-card.status-error {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
    border-color: var(--bridge-error);
  }

  .stat-card.stat-neutral {
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%);
    border-color: rgba(79, 70, 229, 0.3);
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(79, 70, 229, 0.15);
  }

  /* Quick Actions */
  .quick-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(6, 182, 212, 0.03) 100%);
    border: 1px solid rgba(79, 70, 229, 0.2);
    border-radius: var(--bridge-radius);
  }

  .quick-label {
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--text-300));
    flex-shrink: 0;
  }

  .quick-btn {
    flex: 1;
    padding: 8px 12px;
    background: var(--bridge-gradient);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--bridge-transition);
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
  }

  .quick-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
  }

  .quick-btn:active {
    transform: translateY(0);
  }
</style>
