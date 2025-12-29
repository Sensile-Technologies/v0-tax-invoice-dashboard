#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const serverPath = path.join(standaloneDir, 'server.js');

if (!fs.existsSync(serverPath)) {
  console.log('[patch] No standalone server.js found, skipping patch');
  process.exit(0);
}

// Copy public folder to standalone
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc)) {
  console.log('[patch] Copying public folder to standalone...');
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}

// Copy .next/static to standalone/.next/static
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  console.log('[patch] Copying .next/static folder to standalone...');
  fs.cpSync(staticSrc, staticDest, { recursive: true });
}

console.log('[patch] Patching standalone server.js to force 0.0.0.0 binding...');

let content = fs.readFileSync(serverPath, 'utf8');

content = content.replace(
  "const hostname = process.env.HOSTNAME || '0.0.0.0'",
  "const hostname = '0.0.0.0'"
);

fs.writeFileSync(serverPath, content, 'utf8');

console.log('[patch] Patched successfully - server will bind to 0.0.0.0');
