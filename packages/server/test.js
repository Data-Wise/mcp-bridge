import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'server.js');

console.log('Starting server smoke test...');

const server = spawn('node', [serverPath], {
  stdio: 'pipe'
});

let serverStarted = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  // console.log('[Server stdout]:', output.trim());
  if (output.includes('Server running on http://localhost:3000')) {
    serverStarted = true;
    console.log('✓ Server started successfully');
    checkHealth();
  }
});

server.stderr.on('data', (data) => {
  console.error('[Server stderr]:', data.toString());
});

function checkHealth() {
  http.get('http://localhost:3000/health', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.status === 'ok') {
            console.log('✓ Health check passed');
            cleanupAndExit(0);
        } else {
            console.error('✗ Health check failed:', json);
            cleanupAndExit(1);
        }
      } catch (e) {
        console.error('✗ Failed to parse health response:', e);
        cleanupAndExit(1);
      }
    });
  }).on('error', (err) => {
    console.error('✗ Health check request failed:', err);
    cleanupAndExit(1);
  });
}

function cleanupAndExit(code) {
  server.kill();
  process.exit(code);
}

// Timeout
setTimeout(() => {
  if (!serverStarted) {
    console.error('✗ Test timed out waiting for server to start');
    cleanupAndExit(1);
  }
}, 5000);
