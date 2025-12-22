#!/usr/bin/env node

import express from 'express';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, 'server.log');
// Config file location - check Homebrew location first, then local
const HOMEBREW_CONFIG = '/opt/homebrew/etc/mcp-bridge/config.json';
const LOCAL_CONFIG = path.join(__dirname, 'config.json');
const CONFIG_FILE = fs.existsSync(HOMEBREW_CONFIG) ? HOMEBREW_CONFIG : LOCAL_CONFIG;

// Default config if none exists
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ servers: [] }, null, 2));
}

const app = express();
const PORT = 3000;

// Store active sessions
const sessions = new Map();

// Store logs for the dashboard
const MAX_LOGS = 100;
const logs = [];

// Load logs from file on startup
try {
  if (fs.existsSync(LOG_FILE)) {
    const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = fileContent.trim().split('\n');
    lines.slice(-MAX_LOGS).forEach(line => {
      try {
        logs.push(JSON.parse(line));
      } catch (e) {
        // Ignore malformed lines
      }
    });
  }
} catch (e) {
  console.error('Failed to load logs:', e);
}

function addLog(level, message, sessionId = 'system') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    sessionId
  };
  logs.push(logEntry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }
  
  // Persist to file
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
  } catch (e) {
    console.error('Failed to persist log:', e);
  }
  
  const consoleMethod = level === 'error' ? 'error' : (level === 'warn' ? 'warn' : 'log');
  console[consoleMethod](`[${sessionId}] ${message}`);
}

// Function to spawn an MCP server
function spawnMCPServer(sessionId, config) {
  const { command, args, env } = config;
  
  // Parse args
  let argArray = [];
  if (Array.isArray(args)) {
    argArray = args;
  } else if (typeof args === 'string') {
    if (args.includes(',')) {
      argArray = args.split(',').map(arg => arg.trim()).filter(arg => arg);
    } else {
      argArray = args.split(' ').filter(arg => arg.trim());
    }
  }

  // Parse env
  let envObj = {};
  if (env) {
    if (typeof env === 'object') {
      envObj = env;
    } else {
      try {
        envObj = JSON.parse(decodeURIComponent(env));
      } catch (e) {
        addLog('error', `Failed to parse env: ${e.message}`, sessionId);
      }
    }
  }

  addLog('info', `Spawning command: ${command} with args: ${JSON.stringify(argArray)}`, sessionId);

  const proc = spawn(command, argArray, {
    env: { ...process.env, ...envObj },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  proc.stdin.on('error', (error) => {
    if (error.code !== 'EPIPE') {
      addLog('error', `stdin error: ${error.message}`, sessionId);
    }
  });

  proc.on('error', (error) => {
    addLog('error', `Spawn error: ${error.message}`, sessionId);
  });

  proc.stderr.on('data', (data) => {
    addLog('warn', `Server stderr: ${data.toString()}`, sessionId);
  });

  return proc;
}

// Global server sessions
const globalSessions = new Map();

// Load and spawn global servers
async function initGlobalServers() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    for (const server of config.servers || []) {
      const sessionId = `global-${server.name}`;
      const proc = spawnMCPServer(sessionId, server);
      
      globalSessions.set(sessionId, {
        process: proc,
        name: server.name,
        config: server
      });

      proc.on('exit', (code, signal) => {
        addLog('warn', `Global server ${server.name} exited with code ${code}`, sessionId);
        globalSessions.delete(sessionId);
      });
      
      addLog('info', `Global server ${server.name} initialized`, sessionId);
    }
  } catch (e) {
    addLog('error', `Failed to initialize global servers: ${e.message}`);
  }
}

initGlobalServers();

app.use(express.json());

// Enable CORS for browser extension
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from 'public' directory
app.use(express.static('public'));

// SSE endpoint for global servers - connects to already-running process
app.get('/sse/global/:name', (req, res) => {
  const serverName = req.params.name;
  const sessionId = `global-${serverName}`;
  
  addLog('info', `SSE connection to global server: ${serverName}`);
  
  const session = globalSessions.get(sessionId);
  if (!session) {
    addLog('error', `Global server ${serverName} not found`);
    res.status(404).send(`Global server ${serverName} not found`);
    return;
  }
  
  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  
  // Send endpoint event
  res.write(`event: endpoint\n`);
  res.write(`data: http://localhost:${PORT}/message?session_id=${sessionId}\n\n`);
  
  addLog('info', `Client connected to global server ${serverName}`, sessionId);
  
  // Forward stdout from MCP server as SSE messages
  const dataHandler = (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        JSON.parse(line);
        res.write(`event: message\n`);
        res.write(`data: ${line}\n\n`);
      } catch (e) {
        addLog('info', `Server log: ${line}`, sessionId);
      }
    }
  };
  
  session.process.stdout.on('data', dataHandler);
  
  // Cleanup on client disconnect
  req.on('close', () => {
    addLog('info', `Client disconnected from global server ${serverName}`, sessionId);
    session.process.stdout.off('data', dataHandler);
    res.end();
  });
});

// SSE endpoint - establishes connection and spawns MCP server
app.get('/sse', (req, res) => {
  addLog('info', `New SSE connection request: ${JSON.stringify(req.query)}`);

  // Use provided session_id or generate a new one
  const sessionId = req.query.session_id || randomUUID();
  const { command, args, env, transportType = 'stdio' } = req.query;

  // Validate command is provided
  if (!command || !command.trim()) {
    addLog('error', 'Error: command parameter is required');
    res.status(400).send('Error: command parameter is required');
    return;
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Parse args if it's a string - handle both comma and space separators
    let argArray = [];
    if (args) {
      // Extension may send comma-separated or space-separated args
      if (args.includes(',')) {
        argArray = args.split(',').map(arg => arg.trim()).filter(arg => arg);
      } else {
        argArray = args.split(' ').filter(arg => arg.trim());
      }
    }

    // Parse env if it's a string
    let envObj = {};
    if (env) {
      try {
        envObj = JSON.parse(decodeURIComponent(env));
      } catch (e) {
        console.error('[SSE Bridge] Failed to parse env:', e);
      }
    }

    addLog('info', `Spawning command: ${command} with args: ${JSON.stringify(argArray)}`, sessionId);

    // Spawn the MCP server process
    const proc = spawn(command, argArray, {
      env: { ...process.env, ...envObj },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle stdin errors (EPIPE when process exits)
    proc.stdin.on('error', (error) => {
      if (error.code !== 'EPIPE') {
        addLog('error', `stdin error: ${error.message}`, sessionId);
      } else {
        addLog('info', `stdin closed (process exited)`, sessionId);
      }
      // Don't delete session here anymore, let proc.on('exit') handle it
    });

    // Handle spawn errors
    proc.on('error', (error) => {
      addLog('error', `Spawn error: ${error.message}`, sessionId);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: `Failed to spawn command: ${error.message}` })}\n\n`);
      sessions.delete(sessionId);
      res.end();
    });

    // Store session
    sessions.set(sessionId, {
      process: proc,
      messageEndpoint: `/message?session_id=${sessionId}`
    });

    // Send endpoint event
    res.write(`event: endpoint\n`);
    res.write(`data: http://localhost:${PORT}/message?session_id=${sessionId}\n\n`);

    addLog('info', `Session ${sessionId} created`, sessionId);

    // Forward stdout from MCP server as SSE messages
    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          // Validate it's JSON
          JSON.parse(line);
          res.write(`event: message\n`);
          res.write(`data: ${line}\n\n`);
          addLog('debug', `→ Browser: ${line.substring(0, 100)}...`, sessionId);
        } catch (e) {
          // Not JSON, probably debug output
          addLog('info', `Server log: ${line}`, sessionId);
        }
      }
    });

    proc.stderr.on('data', (data) => {
      addLog('warn', `Server stderr: ${data.toString()}`, sessionId);
    });

    proc.on('exit', (code, signal) => {
      addLog('info', `Process exited with code ${code} and signal ${signal}`, sessionId);
      // Keep session for a short bit so client can see the exit in logs if they POST
      setTimeout(() => {
        sessions.delete(sessionId);
      }, 5000);
      res.end();
    });

    // Cleanup on client disconnect
    req.on('close', () => {
      addLog('info', `Client disconnected`, sessionId);
      const session = sessions.get(sessionId);
      if (session) {
        session.process.kill();
        sessions.delete(sessionId);
      }
      res.end();
    });

  } catch (error) {
    addLog('error', `Error spawning server: ${error.message}`);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// API endpoint for config
// API endpoint for diagnostic
app.get('/api/diagnostic/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;
  const session = sessions.get(sessionId) || globalSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // MCP Initialize request
  const diagRequest = {
    jsonrpc: "2.0",
    id: 999,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "BridgeDiagnostic", version: "1.0.0" }
    }
  };

  try {
    // Send to process
    session.process.stdin.write(JSON.stringify(diagRequest) + '\n');
    addLog('info', 'Sent diagnostic initialize request', sessionId);
    
    // In a real implementation we'd wait for the response, 
    // but for now we'll just check if the pipe is open
    res.json({ 
      success: true, 
      status: 'Process alive, initialize request sent',
      sessionId: sessionId
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/config', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    res.json(config);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/config/servers', (req, res) => {
  try {
    const server = req.body;
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    config.servers.push(server);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    addLog('info', `Added global server: ${server.name}`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/config/servers/:name', (req, res) => {
  try {
    const name = req.params.name;
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    config.servers = config.servers.filter(s => s.name !== name);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    addLog('info', `Removed global server: ${name}`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Redirect /dashboard to /dashboard/
app.get('/dashboard', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});

// API endpoint for logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Terminate a session
app.delete('/api/sessions/:id', (req, res) => {
  const sessionId = req.params.id;
  const session = sessions.get(sessionId);
  if (session) {
    addLog('info', `Terminating session via API`, sessionId);
    session.process.kill();
    sessions.delete(sessionId);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Message endpoint - receives messages from browser, forwards to MCP server
app.post('/message', express.json(), (req, res) => {
  const { session_id } = req.query;
  const message = req.body;

  addLog('debug', `Browser → Server (Request: ${message.method || 'unknown'}): ${JSON.stringify(message).substring(0, 500)}`, session_id);

  const session = sessions.get(session_id);
  if (!session) {
    addLog('warn', `Session not found for message: ${message.method}`, session_id);
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    // Check if process is still alive before writing
    if (session.process.killed || !session.process.stdin.writable) {
      addLog('warn', `Session process terminated`, session_id);
      sessions.delete(session_id);
      return res.status(410).json({ error: 'Session process terminated' });
    }
    
    // Send message to MCP server via stdin
    session.process.stdin.write(JSON.stringify(message) + '\n');

    // For now, send simple success response
    // Real responses come via SSE stdout
    res.json({ success: true });
  } catch (error) {
    addLog('error', `Error sending message: ${error.message}`, session_id);
    // Clean up dead session
    sessions.delete(session_id);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  const allSessionIds = [
    ...Array.from(sessions.keys()),
    ...Array.from(globalSessions.keys())
  ];
  res.json({
    status: 'ok',
    activeSessions: sessions.size + globalSessions.size,
    sessionIds: allSessionIds,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  addLog('info', `Server running on http://localhost:${PORT}`);
  addLog('info', `Dashboard: http://localhost:${PORT}/dashboard`);
  addLog('info', `Ready for MCP connections`);
});
