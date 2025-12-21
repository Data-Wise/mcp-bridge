// Content script running in world: MAIN on claude.ai
// This means we're running in the page's JavaScript context, not the extension context
// We can access Claude's React components but NOT extension APIs

// import 'bippy';
import { MCPConnection } from './mcp-connection';
import { log, setStorage } from './utils';

let mcpServers = [];
// Track active connections so we can disconnect them when servers are updated
const activeConnections = new Map();

// Disconnect all active connections
function disconnectAllConnections() {
  log(`[MCP Client] Disconnecting ${activeConnections.size} active connections`);
  for (const [name, connection] of activeConnections) {
    try {
      connection.disconnect();
      log(`[MCP Client] Disconnected ${name}`);
    } catch (e) {
      console.warn(`[MCP Client] Error disconnecting ${name}:`, e);
    }
  }
  activeConnections.clear();
}

// Set up a connection to a server
function createServerConnection(server, handler) {
  log(`[MCP Client] Creating connection to ${server.name}`);
  
  try {
    // Create configuration for the MCPConnection
    const connectionConfig = {
      connectionType: 'sse',
      transportType: 'stdio',
      url: server.url,
      command: server.command,
      args: server.args,
      env: server.env
    };
    
    // Create the MCPConnection
    const connection = new MCPConnection(server.name, connectionConfig);
    
    // Start connecting in the background
    connection.connect(handler)
      .then(result => {
        log(`[MCP Client] Successfully connected to ${server.name}:`, result);
        // Trigger an update of the injected clients to refresh with the new connection
        // updateInjectedClients();
      })
      .catch(error => {
        console.error(`[MCP Client] Failed to connect to ${server.name}:`, error);
      });
    
    return connection;
  } catch (e) {
    console.error(`[MCP Client] Error creating connection to ${server.name}:`, e);
    return null;
  }
}

// Diagnostics check
async function runDiagnostics() {
  const results = {};
  for (const [name, connection] of activeConnections) {
    if (connection.sessionId) {
      try {
        const resp = await fetch(`http://localhost:3000/api/diagnostic/${connection.sessionId}`);
        const data = await resp.json();
        results[name] = data.success ? 'healthy' : 'error';
      } catch (e) {
        results[name] = 'unreachable';
      }
    } else {
      results[name] = 'connecting';
    }
  }
  return results;
}

// Poll bridge health
async function pollHealth() {
  try {
    const resp = await fetch('http://localhost:3000/health');
    const health = await resp.json();
    
    // Run process diagnostics periodically
    const diagnostics = await runDiagnostics();
    const healthData = { ...health, online: true, diagnostics };
    
    // 1. Notify the isolated world (to relay to background & sync storage)
    window.postMessage({
      source: 'main-content',
      type: 'mcp-health-update',
      health: healthData
    }, '*');
  } catch (e) {
    const offlineData = { online: false };
    window.postMessage({
      source: 'main-content',
      type: 'mcp-health-update',
      health: offlineData
    }, '*');
  }
}

setInterval(pollHealth, 5000);
pollHealth();

// Listen for messages from other scripts
window.addEventListener('message', (event) => {
  // Log messages for debugging
  log('[MCP Client] Received window message:', event.data);

  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }
  
  // Special case: filter out our own messages
  if (event.data && event.data.source === 'main-content') {
    return;
  }
  
  // Process messages by type
  if (event.data && event.data.type) {    
    switch (event.data.type) {
      case 'mcp-ext-storage-updated':
        log('[MCP Client] Received storage from extension:', event.data.data);
        setStorage(event.data.data);
        break;
      
      case 'mcp-servers-updated':
        if (Array.isArray(event.data?.data?.servers)) {
          log('[MCP Client] Received servers from extension:', event.data.data.servers);
          
          // Disconnect all existing connections before creating new ones
          disconnectAllConnections();
          
          mcpServers = event.data.data.servers;
          for(let server of mcpServers) {
            const channel = new MessageChannel();
            const port1 = channel.port1;
            const port2 = channel.port2;
            port1.onmessage = (event) => {
              log('[MCP Client] Received message from port1:', event);
              window.postMessage({ source: 'main-content', type: 'mcp-activity-pulse' }, '*');
              connection.sendRequest(event.data);
            };
            const handler = (message) => {
              log('[MCP Client] Received message from server:', message);
              window.postMessage({ source: 'main-content', type: 'mcp-activity-pulse' }, '*');
              port1.postMessage(message);
            };  
            port1.start();
            const connection = createServerConnection(server, handler);
            
            // Track the connection so we can disconnect it later
            if (connection) {
              activeConnections.set(server.name, connection);
            }
            
            log(server, connection)
            setTimeout(() => {  
              window.postMessage({
                source: 'main-content',
                type: 'mcp-server-connected',
                serverName: server.name
              }, '*', [port2]);
            }, 1000);
          }
        
        } else {
          console.warn('[MCP Client] Received malformed servers data:', event.data);
        }
        break;
    }
  }
});