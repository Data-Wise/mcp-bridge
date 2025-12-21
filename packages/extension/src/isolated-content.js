const extensionAPI = globalThis.chrome || globalThis.browser;

async function getAndSendStorage() {
  try {
    const data = await extensionAPI.storage.local.get();
    
    window.postMessage({
      type: 'mcp-ext-storage-updated',
      source: 'isolated-content',
      data: data
    }, '*');
    
    let servers = Object.values(data.mcpServers || {});
    
    // If no servers in storage, try to fetch from bridge config
    if (servers.length === 0) {
      try {
        const resp = await fetch('http://localhost:3000/api/config');
        if (resp.ok) {
          const config = await resp.json();
          servers = (config.servers || []).map(s => ({
            name: s.name,
            url: `http://localhost:3000/sse/global/${s.name}`,
            command: '',
            args: []
          }));
          
          const serversObj = {};
          servers.forEach(s => serversObj[s.name] = s);
          await extensionAPI.storage.local.set({ mcpServers: serversObj });
        }
      } catch (e) {
        // Bridge not available
      }
    }
    
    window.postMessage({
      type: 'mcp-servers-updated',
      source: 'isolated-content',
      data: { servers }
    }, '*');
  } catch (error) {
    // Storage access failed
  }
}

// Listen for requests from MAIN world
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  
  const data = event.data;
  if (!data || data.source === 'isolated-content') return;

  if (data.type === 'mcp-save-servers' && data.servers) {
    try {
      const serversObj = {};
      data.servers.forEach(s => {
        if (s.name) serversObj[s.name] = s;
      });
      
      await extensionAPI.storage.local.set({ mcpServers: serversObj });
      getAndSendStorage();
    } catch (error) {
      // Save failed
    }
  }
});

extensionAPI.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    getAndSendStorage();
  }
  for (let key in changes) {
    if (key === 'mcpServers') {
      window.postMessage({
        type: 'mcp-servers-updated',
        source: 'isolated-content',
        data: {
          servers: Object.values(changes[key].newValue || {})
        }
      }, '*');
    }
  }
});

window.addEventListener('message', async (event) => {
  if (event.source !== window || !event.data || event.data.source === 'isolated-content') return;
  
  if (event.data.type === 'mcp-health-update') {
    try {
      await extensionAPI.runtime.sendMessage({
        type: 'mcp-health-update',
        health: event.data.health
      });
    } catch (e) {
      // Silently ignore "Extension context invalidated" errors
      // This happens when extension is reloaded while page is still open
    }
  }
});

// Initialize
getAndSendStorage();

// Wake up background script on load
extensionAPI.runtime.sendMessage({
  type: 'mcp-health-update',
  health: { online: false, sessionIds: [], diagnostics: {} }
}).catch(() => {});
