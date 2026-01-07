# Flow360 Independent Deployment Guide

This guide explains how to deploy Flow360 on your own VPS server.

## Prerequisites

- A VPS server (Ubuntu 22.04+ recommended)
- Domain: flow360.live pointed to your VPS IP
- SSH access to your server

## Option 1: Docker Deployment (Recommended)

### Step 1: Server Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y
```

### Step 2: Clone and Configure

```bash
# Clone your repository
git clone https://github.com/your-username/flow360.git
cd flow360

# Create environment file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@your-db-host:5432/flow360
EOF
```

### Step 3: Setup SSL Certificates

```bash
# Create directories
mkdir -p certbot/conf certbot/www

# Get initial certificate (first run without SSL)
docker compose up -d nginx
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d flow360.live -d www.flow360.live --email your@email.com --agree-tos --no-eff-email

# Restart with SSL
docker compose down
docker compose up -d
```

### Step 4: Deploy

```bash
docker compose up -d --build
```

### Updating

```bash
git pull
docker compose up -d --build
```

---

## Option 2: Manual Deployment (No Docker)

### Step 1: Install Dependencies

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx
```

### Step 2: Clone and Build

```bash
cd /var/www
git clone https://github.com/your-username/flow360.git
cd flow360

# Install dependencies
npm ci

# Set environment variables
export DATABASE_URL="postgresql://user:password@host:5432/flow360"

# Build
npm run build
```

### Step 3: Run with PM2

```bash
pm2 start npm --name "flow360" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/flow360`:

```nginx
server {
    listen 80;
    server_name flow360.live www.flow360.live;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/flow360 /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 5: SSL with Certbot

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d flow360.live -d www.flow360.live
```

---

## Database Migration

### Export from Replit PostgreSQL

1. Get your Replit DATABASE_URL
2. Use pg_dump to export:

```bash
pg_dump "your-replit-database-url" > flow360_backup.sql
```

### Import to New Database

```bash
psql "your-new-database-url" < flow360_backup.sql
```

---

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |

---

## Recommended VPS Providers

| Provider | Starting Price | Notes |
|----------|---------------|-------|
| Hetzner | €4.15/mo | Best value in EU |
| DigitalOcean | $6/mo | Easy to use |
| Hostinger | $5.99/mo | Good for beginners |
| Vultr | $6/mo | Many locations |

Minimum specs: 2GB RAM, 1 CPU, 25GB SSD

---

## Monitoring

### Check App Status

```bash
# Docker
docker compose logs -f app

# PM2
pm2 logs flow360
```

### Health Check

```bash
curl https://flow360.live/api/health
```

---

## Troubleshooting

### App not starting
- Check DATABASE_URL is correct
- Check logs: `docker compose logs app` or `pm2 logs`

### SSL issues
- Ensure domain DNS points to your server IP
- Wait for DNS propagation (up to 48 hours)
- Re-run certbot if needed

### Database connection failed
- Verify DATABASE_URL format
- Check if database server allows connections from your VPS IP
- Test with: `psql $DATABASE_URL`
