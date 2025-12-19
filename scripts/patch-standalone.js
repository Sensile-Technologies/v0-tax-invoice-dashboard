#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');

if (!fs.existsSync(serverPath)) {
  console.log('[patch] No standalone server.js found, skipping patch');
  process.exit(0);
}

console.log('[patch] Patching standalone server.js to force 0.0.0.0 binding...');

let content = fs.readFileSync(serverPath, 'utf8');

content = content.replace(
  "const hostname = process.env.HOSTNAME || '0.0.0.0'",
  "const hostname = '0.0.0.0'"
);

fs.writeFileSync(serverPath, content, 'utf8');

console.log('[patch] Patched successfully - server will bind to 0.0.0.0');
