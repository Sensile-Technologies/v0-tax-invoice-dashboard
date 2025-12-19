const { spawn } = require('child_process');

const port = process.env.PORT || '5000';
const hostname = process.env.HOSTNAME || '0.0.0.0';

console.log(`Starting Next.js on ${hostname}:${port}`);

const child = spawn('npx', ['next', 'start', '--hostname', hostname, '--port', port], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
