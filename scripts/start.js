#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || '5000';
const hostname = '0.0.0.0';

console.log(`[Flow360] Starting server on ${hostname}:${port}`);
console.log(`[Flow360] Current directory: ${process.cwd()}`);

const standalonePath = path.join(process.cwd(), '.next', 'standalone', 'server.js');
console.log(`[Flow360] Checking for standalone at: ${standalonePath}`);

if (fs.existsSync(standalonePath)) {
  console.log('[Flow360] Found standalone server, starting...');
  
  process.env.PORT = port;
  process.env.HOSTNAME = hostname;
  
  require(standalonePath);
} else {
  console.log('[Flow360] Standalone not found, using next start');
  const nextBin = path.join(process.cwd(), 'node_modules', '.bin', 'next');
  
  if (!fs.existsSync(nextBin)) {
    console.error('[Flow360] next binary not found at:', nextBin);
    process.exit(1);
  }
  
  const child = spawn(nextBin, ['start', '--hostname', hostname, '--port', port], {
    stdio: 'inherit',
    env: { ...process.env, PORT: port },
    cwd: process.cwd()
  });

  child.on('error', (err) => {
    console.error('[Flow360] Failed to start:', err);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}
