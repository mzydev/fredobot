#!/bin/bash

# Telegram VPN Bot Setup Script
# This script automates the initial setup process

set -e

echo "================================================"
echo "Telegram VPN Bot - Setup Script"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js v14 or higher from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js is installed: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    exit 1
fi

echo "✓ npm is installed: $(npm -v)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

echo "✓ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "IMPORTANT: Please edit .env and set these values:"
    echo "  - BOT_TOKEN (from @BotFather on Telegram)"
    echo "  - MYSQL_HOST (database host)"
    echo "  - MYSQL_USER (database username)"
    echo "  - MYSQL_PASSWORD (database password)"
    echo "  - ADMIN_IDS (your Telegram ID)"
    echo ""
    echo "Edit .env now and then run: npm run setup-db"
    exit 0
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Checking MySQL connection..."

# Try to read MySQL variables from .env
if [ -f .env ]; then
    export $(cat .env | grep MYSQL | xargs)
fi

# Simple MySQL connection check
if ! mysql -h "${MYSQL_HOST:-localhost}" -u "${MYSQL_USER:-root}" -p"${MYSQL_PASSWORD}" -e "SELECT 1" > /dev/null 2>&1; then
    echo "Warning: Could not connect to MySQL"
    echo "Make sure MySQL is running and credentials are correct in .env"
    echo ""
    echo "When MySQL is ready, run: npm run setup-db"
    exit 0
fi

echo "✓ Connected to MySQL"
echo ""

# Setup database
echo "Setting up database..."
npm run setup-db

echo ""
echo "================================================"
echo "Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Add your Telegram bot's admin users:"
echo "   Use /admin command in Telegram"
echo ""
echo "2. Add VPN configurations:"
echo "   Use /admin menu and select 'Add Config'"
echo ""
echo "3. Start the bot:"
echo "   npm start"
echo ""
echo "4. Find your bot on Telegram and send /start"
echo ""
echo "For more help, see QUICKSTART.md"
echo ""
