#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || '5000';
const hostname = '0.0.0.0';

console.log(`[Flow360] Starting Next.js server on ${hostname}:${port}`);

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
