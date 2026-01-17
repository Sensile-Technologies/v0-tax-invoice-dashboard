const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 5000;
const TARGET_URL = 'https://flow360.live/api/pump-callback';

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const url = new URL(TARGET_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    console.log(`[${new Date().toISOString()}] Forwarding ${req.method} request to ${TARGET_URL}`);
    console.log(`Body: ${body.substring(0, 200)}...`);

    const proxyReq = https.request(options, (proxyRes) => {
      let responseData = '';
      proxyRes.on('data', chunk => {
        responseData += chunk.toString();
      });

      proxyRes.on('end', () => {
        console.log(`[${new Date().toISOString()}] Response: ${proxyRes.statusCode}`);
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(responseData);
      });
    });

    proxyReq.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] Proxy error:`, error.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error', message: error.message }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP Proxy running on port ${PORT}`);
  console.log(`Forwarding to: ${TARGET_URL}`);
  console.log(`Configure controller with: http://<server-ip>:${PORT}/api/pump-callback`);
});
