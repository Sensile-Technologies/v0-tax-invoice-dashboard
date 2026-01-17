# Flow360 HTTP Proxy

This is a simple HTTP proxy for pump controllers that don't support HTTPS/SSL.

## How it works

The proxy:
1. Accepts plain HTTP connections on port 5000
2. Forwards all requests to https://flow360.live/api/pump-callback
3. Returns the response back to the controller

## Deployment Options

### Option 1: Deploy on a VPS (DigitalOcean, Linode, AWS, etc.)

1. Create a VPS with Ubuntu/Debian
2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Copy these files to the server
4. Run the proxy:
   ```bash
   npm start
   ```
5. Configure your controller with:
   - IP: Your VPS IP address
   - Port: 5000
   - Protocol: HTTP

### Option 2: Run with PM2 (recommended for production)

```bash
npm install -g pm2
pm2 start proxy.js --name flow360-proxy
pm2 save
pm2 startup
```

### Option 3: Run as a systemd service

Create `/etc/systemd/system/flow360-proxy.service`:
```ini
[Unit]
Description=Flow360 HTTP Proxy
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/http-proxy
ExecStart=/usr/bin/node proxy.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then enable and start:
```bash
sudo systemctl enable flow360-proxy
sudo systemctl start flow360-proxy
```

## Controller Configuration

After deploying the proxy:
- **IP**: Your server's public IP
- **Port**: 5000
- **Protocol**: HTTP (not HTTPS)
- **Path**: /api/pump-callback

## Firewall

Make sure port 5000 is open:
```bash
sudo ufw allow 5000
```
