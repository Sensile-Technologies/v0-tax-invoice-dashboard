#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('[Flow360] Server startup script beginning...');
console.log('[Flow360] Environment PORT:', process.env.PORT);
console.log('[Flow360] Current directory:', process.cwd());

const port = process.env.PORT || '3000';
const hostname = '0.0.0.0';

console.log(`[Flow360] Will start server on ${hostname}:${port}`);

const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.error('[Flow360] ERROR: .next directory not found! Build may have failed.');
  process.exit(1);
}
console.log('[Flow360] .next directory found');

const nextBin = path.join(process.cwd(), 'node_modules', '.bin', 'next');
if (!fs.existsSync(nextBin)) {
  console.error('[Flow360] ERROR: next binary not found!');
  process.exit(1);
}
console.log('[Flow360] next binary found at:', nextBin);

console.log('[Flow360] Spawning next start...');
const child = spawn(nextBin, ['start', '-H', hostname, '-p', port], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

child.on('error', (err) => {
  console.error('[Flow360] Failed to start:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log('[Flow360] Process exited with code:', code);
  process.exit(code || 0);
});
