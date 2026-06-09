#!/bin/bash
# UHHomes Admin Portal - Deployment Script
# Run this on your VPS after cloning/uploading the project

set -e

APP_DIR="/var/www/uhhomes-admin"
DOMAIN="admin.uhhomes.com"

echo "=== UHHomes Admin Deployment ==="

# 1. Install dependencies (if not already installed)
echo "[1/8] Checking system dependencies..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get install -y nginx
fi

if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# 2. Create app directory
echo "[2/8] Setting up app directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 3. Copy project files (if running from project dir)
echo "[3/8] Copying project files..."
cp -r . $APP_DIR/
cd $APP_DIR

# 4. Install frontend dependencies and build
echo "[4/8] Building frontend..."
npm install
npm run build

# 5. Install backend dependencies
echo "[5/8] Installing backend dependencies..."
cd backend
npm install --production
cd ..

# 6. Setup backend .env (if not exists)
if [ ! -f backend/.env ]; then
    echo "[!] WARNING: backend/.env not found!"
    echo "    Copy .env.example to .env and fill in your production values:"
    echo "    cp backend/.env.example backend/.env"
    echo "    nano backend/.env"
    echo ""
    echo "    Required changes for production:"
    echo "    - NODE_ENV=production"
    echo "    - FRONTEND_URL=https://$DOMAIN"
    echo "    - DB_HOST, DB_NAME, DB_USER, DB_PASSWORD"
    echo "    - JWT_SECRET (generate a strong one)"
    echo "    - GOOGLE_CALLBACK_URL=https://$DOMAIN/api/auth/google/callback"
    echo ""
fi

# 7. Setup Nginx
echo "[6/8] Configuring Nginx..."
sudo cp nginx/admin.uhhomes.com.conf /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config (will fail if SSL cert doesn't exist yet, that's okay)
echo "[7/8] Getting SSL certificate..."
# Temporarily use HTTP-only config for certbot
sudo tee /etc/nginx/sites-available/$DOMAIN-temp > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root /var/www/certbot;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/$DOMAIN-temp /etc/nginx/sites-enabled/$DOMAIN
sudo mkdir -p /var/www/certbot
sudo nginx -t && sudo systemctl reload nginx

# Get SSL certificate
sudo certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --non-interactive --agree-tos --email admin@uhhomes.com

# Now switch to full HTTPS config
sudo cp nginx/admin.uhhomes.com.conf /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
sudo rm -f /etc/nginx/sites-available/$DOMAIN-temp
sudo nginx -t && sudo systemctl reload nginx

# 8. Start/restart backend with PM2
echo "[8/8] Starting backend with PM2..."
pm2 delete uhhomes-backend 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: https://$DOMAIN"
echo "Backend API: https://$DOMAIN/api/"
echo ""
echo "Next steps:"
echo "1. Make sure backend/.env is configured with production values"
echo "2. Run: pm2 restart uhhomes-backend"
echo "3. Check logs: pm2 logs uhhomes-backend"
echo "4. SSL auto-renewal is handled by certbot timer"
