#!/usr/bin/env node
process.env.HOSTNAME = '0.0.0.0';
process.env.PORT = process.env.PORT || '5000';

console.log('[Flow360] Starting production server...');
console.log('[Flow360] PORT:', process.env.PORT);
console.log('[Flow360] HOSTNAME:', process.env.HOSTNAME);

require('../.next/standalone/server.js');
