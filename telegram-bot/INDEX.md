# Telegram VPN Bot - Complete Documentation Index

Welcome to your Telegram VPN Bot project! This file serves as a guide to all documentation.

## Quick Navigation

### For First-Time Users
1. **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
2. **[README.md](./README.md)** - Complete user guide and features overview
3. **.env.example** - Configuration template (copy to .env and edit)

### For Developers
1. **[API.md](./API.md)** - Internal API documentation and service architecture
2. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Technical overview and file structure
3. **[src/](./src/)** - Source code directory

### For Deployment
1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to VPS, Docker, Railway, Heroku, AWS, etc.
2. **[Dockerfile](./Dockerfile)** - Docker container configuration
3. **[docker-compose.yml](./docker-compose.yml)** - Multi-container setup

## File Structure Guide

### Documentation Files
```
QUICKSTART.md          - 5-minute setup guide (START HERE)
README.md              - Complete documentation with features
DEPLOYMENT.md          - Deployment instructions for all platforms
API.md                 - Internal service and database API
PROJECT_SUMMARY.md     - Technical summary and architecture
INDEX.md               - This file
```

### Configuration Files
```
.env.example           - Environment variable template
package.json           - Node.js dependencies
Dockerfile             - Docker container definition
docker-compose.yml     - Docker Compose multi-container setup
setup.sh               - Setup automation script
```

### Source Code
```
src/
├── bot.js                  # Main bot entry point
├── config/
│   └── database.js         # MySQL connection pool
├── database/
│   ├── schema.sql          # Database schema
│   └── setup.js            # Database initialization
├── handlers/
│   ├── messageHandler.js   # Message routing
│   ├── userHandlers.js     # User commands
│   └── adminHandlers.js    # Admin commands
├── services/
│   ├── userService.js      # User operations
│   ├── configService.js    # Config management
│   ├── purchaseService.js  # Subscriptions
│   └── paymentService.js   # Payments
└── utils/
    ├── keyboards.js        # Telegram buttons
    └── helpers.js          # Utility functions
```

## Getting Started

### Option 1: Automatic Setup (Recommended)
```bash
./setup.sh
```

### Option 2: Manual Setup
1. Copy and edit configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your bot token and database credentials
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup database:
   ```bash
   npm run setup-db
   ```

4. Start the bot:
   ```bash
   npm start
   ```

### Option 3: Docker Setup
```bash
docker-compose up -d
```

## Key Features

### User Features
- Buy VPN/proxy configurations
- View active subscriptions
- Check account balance and stats
- Request balance top-ups
- Support for BTC, ETH, USDT, USDC

### Admin Features
- Manage configurations
- View system statistics
- Approve/reject payments
- Broadcast messages to users
- User management

## User Commands

| Command | Description |
|---------|-------------|
| `/start` | Main menu |
| `/buy` | Purchase a plan |
| `/myconfigs` | View subscriptions |
| `/account` | Account details |
| `/addbalance` | Top up balance |
| `/help` | Get help |
| `/admin` | Admin panel (admin only) |

## Configuration

### Essential Environment Variables
```env
BOT_TOKEN=your_telegram_bot_token
MYSQL_HOST=localhost
MYSQL_USER=bot_user
MYSQL_PASSWORD=your_password
ADMIN_IDS=your_telegram_id
```

### Customization
- **Pricing**: Edit PLAN_*_PRICE in .env
- **Durations**: Edit PLAN_*_DAYS in .env
- **Commands**: Edit handlers in src/handlers/
- **Database**: Modify schema.sql before first run

## Database

### Supported
- MySQL 5.7+
- MariaDB
- Any MySQL-compatible database

### Tables
- **users** - User accounts and balances
- **configs** - VPN/proxy configurations
- **purchases** - Subscriptions
- **payments** - Payment requests
- **admin_users** - Admin accounts
- **broadcast_messages** - Message history

See [API.md](./API.md) for detailed database documentation.

## Payment Workflow

1. User initiates balance top-up → `/addbalance`
2. Selects cryptocurrency (BTC, ETH, USDT, USDC)
3. Receives crypto address
4. Sends crypto + provides transaction ID
5. Admin reviews and approves payment
6. User balance credited
7. User notified

## Deployment Options

- **VPS** (Ubuntu/Debian)
- **Docker**
- **Docker Compose**
- **Railway.app**
- **Heroku**
- **AWS EC2 + RDS**
- **DigitalOcean**
- **Linode**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Support & Troubleshooting

### Common Issues
- **Bot won't start** → Check BOT_TOKEN and MySQL connection
- **Database fails** → Ensure MySQL is running and credentials are correct
- **Commands don't work** → Make sure you're using `/` prefix

### Getting Help
1. Check [README.md](./README.md) troubleshooting section
2. Review [API.md](./API.md) for technical details
3. Check database logs for errors
4. Review bot console output with `[v0]` prefix

## Development

### Adding a New Command
1. Create handler method in src/handlers/
2. Add route in messageHandler.js
3. Test with the bot

### Adding a New Database Table
1. Add SQL to src/database/schema.sql
2. Create service file in src/services/
3. Use in handlers

### Development Mode
```bash
npm run dev  # Auto-reload on file changes
```

## Security

- Admin verification via Telegram ID whitelist
- Input validation on all user inputs
- No hardcoded credentials
- Environment variables for sensitive data
- Prepared statements for SQL queries

## Performance

- Connection pooling (10 connections)
- Indexed database queries
- Efficient message routing
- Minimal memory footprint
- Horizontal scalability ready

## Monitoring

All operations log with `[v0]` prefix:
```
[v0] Database connection successful
[v0] User created: { id: 1, telegram_id: 123456789 }
[v0] Error in getUser: Error message
```

Easily filter logs: `npm start | grep "[v0]"`

## Updates & Maintenance

### Regular Tasks
- Daily: Check pending payments
- Weekly: Backup database
- Monthly: Review statistics and revenue

### Updating the Bot
```bash
git pull
npm install
npm run setup-db  # If schema changes
npm restart      # If using PM2
```

## What's Included

### Code
- 12 JavaScript source files (~1,800 lines)
- 2 utility modules (keyboards, helpers)
- 4 service modules (user, config, purchase, payment)
- 3 handler modules (message, user, admin)
- 1 database config
- 1 main bot file

### Documentation
- 7 markdown files with complete documentation
- Inline code comments
- API documentation
- Deployment guides
- Troubleshooting guides

### Configuration
- Docker support
- Environment templates
- Package management
- Database schemas
- Setup scripts

## Next Steps

1. **Setup**: Follow [QUICKSTART.md](./QUICKSTART.md)
2. **Configure**: Edit .env with your credentials
3. **Customize**: Adjust pricing and features
4. **Deploy**: Use [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Monitor**: Watch logs for issues
6. **Maintain**: Regular backups and monitoring

## Useful Links

- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js Documentation](https://nodejs.org/docs/)

## Version & Status

- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: May 2026
- **License**: MIT (Open Source)

## Support

For issues or questions:
1. Read the troubleshooting section in README.md
2. Check error logs with `[v0]` prefix
3. Review API.md for technical details
4. Check database records for debugging

---

**Start with [QUICKSTART.md](./QUICKSTART.md) to get running in 5 minutes!**
