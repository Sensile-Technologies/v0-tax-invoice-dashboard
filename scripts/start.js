#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || '5000';
const hostname = '0.0.0.0';

console.log(`[Flow360] Starting server on ${hostname}:${port}`);

const standalonePath = path.join(process.cwd(), '.next', 'standalone', 'server.js');

if (fs.existsSync(standalonePath)) {
  console.log('[Flow360] Using standalone server');
  const child = spawn('node', [standalonePath], {
    stdio: 'inherit',
    env: { ...process.env, PORT: port, HOSTNAME: hostname },
    cwd: process.cwd()
  });

  child.on('error', (err) => {
    console.error('[Flow360] Failed to start:', err);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  console.log('[Flow360] Standalone not found, using next start');
  const nextBin = path.join(process.cwd(), 'node_modules', '.bin', 'next');
  const child = spawn(nextBin, ['start', '--hostname', hostname, '--port', port], {
    stdio: 'inherit',
    env: process.env,
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
