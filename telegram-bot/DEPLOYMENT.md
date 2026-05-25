# Deployment Guide

This guide covers deploying the Telegram VPN Bot to various platforms.

## Prerequisites

- Telegram Bot Token from @BotFather
- MySQL database (local or hosted)
- Node.js hosting or VPS

## Local Development

### Quick Start

```bash
npm install
npm run setup-db
npm run dev
```

The bot will start polling for messages locally.

## VPS Deployment (Ubuntu/Debian)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Setup Bot Project

```bash
# Create app directory
sudo mkdir -p /opt/vpn-bot
cd /opt/vpn-bot

# Copy project files
# (Use SCP or Git to transfer files)
git clone <your-repo-url> .

# Install dependencies
npm install --production

# Setup .env file
cp .env.example .env
nano .env  # Edit with your credentials
```

### 3. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database user (inside MySQL):
CREATE USER 'bot_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON vpn_bot_db.* TO 'bot_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Setup database schema
npm run setup-db
```

### 4. Start Bot with PM2

```bash
# Start the bot
pm2 start src/bot.js --name "vpn-bot"

# Setup auto-start on reboot
pm2 startup
pm2 save

# View logs
pm2 logs vpn-bot

# Manage bot
pm2 restart vpn-bot
pm2 stop vpn-bot
```

### 5. Setup Firewall (if needed)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS if using webhook
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install mysql-client for database operations
RUN apk add --no-cache mysql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application
COPY src ./src

# Create startup script
RUN echo '#!/bin/sh\necho "Waiting for database..."\nsleep 5\necho "Setting up database..."\nnode src/database/setup.js 2>/dev/null || true\necho "Starting bot..."\nnode src/bot.js' > /startup.sh && \
    chmod +x /startup.sh

EXPOSE 8080

CMD ["/startup.sh"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: vpn_bot_db
      MYSQL_USER: bot_user
      MYSQL_PASSWORD: bot_password
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  bot:
    build: .
    environment:
      BOT_TOKEN: ${BOT_TOKEN}
      MYSQL_HOST: db
      MYSQL_USER: bot_user
      MYSQL_PASSWORD: bot_password
      MYSQL_DATABASE: vpn_bot_db
      ADMIN_IDS: ${ADMIN_IDS}
      PLAN_BRONZE_PRICE: 4.99
      PLAN_BRONZE_DAYS: 30
      PLAN_SILVER_PRICE: 12.99
      PLAN_SILVER_DAYS: 90
      PLAN_GOLD_PRICE: 24.99
      PLAN_GOLD_DAYS: 180
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  db_data:
```

### 3. Deploy with Docker

```bash
# Create .env file
cp .env.example .env
# Edit .env with your values

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop
docker-compose down
```

## Railway.app Deployment

### 1. Prepare for Railway

```bash
# Create Procfile
echo "worker: npm start" > Procfile

# Create .gitignore
echo "node_modules/\n.env\n.env.local" >> .gitignore

# Initialize Git (if not already)
git init
git add .
git commit -m "Initial commit"
```

### 2. Deploy on Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Link to project
railway link

# Deploy
railway up
```

### 3. Configure Environment Variables

In Railway dashboard:
1. Go to Variables
2. Add all variables from `.env.example`
3. Set `BOT_TOKEN`, `MYSQL_*`, `ADMIN_IDS`, and pricing variables

### 4. Setup Database

Railway provides MySQL service. Link it and update `MYSQL_HOST` to the provided host.

## Heroku Deployment

### 1. Prepare for Heroku

```bash
# Create Procfile
echo "worker: npm start" > Procfile

# Create runtime.txt
echo "18.17.0" > runtime.txt

# Initialize Git
git init && git add . && git commit -m "Initial commit"
```

### 2. Deploy

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add MySQL add-on (using ClearDB or similar)
heroku addons:create cleardb:ignite

# Set environment variables
heroku config:set BOT_TOKEN=xxxxx
heroku config:set ADMIN_IDS=xxxxx
# ... set all other variables

# Deploy
git push heroku main
```

## AWS EC2 Deployment

### 1. Launch EC2 Instance

- Image: Ubuntu 22.04 LTS
- Instance Type: t3.micro or t3.small
- Security Group: Allow SSH (22), HTTP (80), HTTPS (443)

### 2. Connect and Setup

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Follow VPS Setup instructions above
```

### 3. Setup RDS MySQL

1. Create RDS instance in AWS Console
2. Get endpoint, username, password
3. Set in `.env`:
   ```
   MYSQL_HOST=your-rds-endpoint.amazonaws.com
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   ```
4. Update security groups to allow EC2 to connect to RDS

## Database Backup

### Automated Backup (Cron)

```bash
# Create backup script
sudo nano /opt/vpn-bot/backup.sh

#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p$MYSQL_PASSWORD vpn_bot_db > /backups/vpn_bot_$TIMESTAMP.sql
gzip /backups/vpn_bot_$TIMESTAMP.sql

# Make executable
sudo chmod +x /opt/vpn-bot/backup.sh

# Add to crontab for daily 2 AM backup
sudo crontab -e
# Add: 0 2 * * * /opt/vpn-bot/backup.sh
```

### Manual Backup

```bash
mysqldump -u root -p vpn_bot_db > backup.sql
```

### Restore from Backup

```bash
mysql -u root -p vpn_bot_db < backup.sql
```

## Monitoring

### Using PM2 Monitor

```bash
# Install PM2 Plus
pm2 install pm2-auto-pull

# View in PM2 Plus dashboard
pm2 web  # Opens http://localhost:9615
```

### Manual Health Checks

```bash
# Check if bot is running
pm2 status

# View logs
tail -f /home/user/.pm2/logs/vpn-bot-error.log

# Check MySQL
mysql -u root -p -e "SELECT COUNT(*) FROM vpn_bot_db.users;"
```

## SSL/TLS Setup (Optional)

If using webhook mode (not polling):

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Update bot configuration to use webhook
# (Requires additional code changes)
```

## Troubleshooting Deployment

### Bot not starting
```bash
# Check logs
pm2 logs vpn-bot

# Check environment variables
env | grep BOT_TOKEN

# Test database connection
mysql -h $MYSQL_HOST -u $MYSQL_USER -p -e "SELECT 1"
```

### Database connection errors
```bash
# Verify MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u bot_user -p -h localhost -e "USE vpn_bot_db; SELECT COUNT(*) FROM users;"
```

### Low memory on VPS
```bash
# Check memory usage
free -h

# Kill unused processes
sudo killall -9 node  # (Careful!)

# Increase swap
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
ALTER TABLE purchases ADD INDEX idx_user_active (user_id, is_active);
ALTER TABLE payments ADD INDEX idx_user_status (user_id, status);

-- Analyze and optimize tables
OPTIMIZE TABLE users;
OPTIMIZE TABLE purchases;
OPTIMIZE TABLE payments;
```

### Node.js Optimization

```bash
# Increase file descriptor limit
ulimit -n 4096

# Run with cluster mode (for multi-core servers)
pm2 start src/bot.js -i max --name "vpn-bot"
```

## Updating the Bot

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart bot
pm2 restart vpn-bot

# Check logs
pm2 logs vpn-bot
```
