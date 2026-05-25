# Telegram VPN/Proxy Config Bot

A comprehensive Telegram bot for managing VPN/proxy configurations with user purchases, admin controls, and cryptocurrency payment handling.

## Features

### User Features
- **Buy Config**: Purchase VPN/proxy configurations with 3 pricing plans (Bronze, Silver, Gold)
- **My Configs**: View active purchased configurations with expiry dates
- **My Account**: View account balance, subscription status, and purchase history
- **Add Balance**: Request balance top-up using cryptocurrency (BTC, ETH, USDT, USDC)
- **Help**: Access command documentation

### Admin Features
- **Add Config**: Add new VPN/proxy configurations to the system
- **Statistics**: View user count, revenue, and subscription metrics
- **Approve Payments**: Review and approve pending cryptocurrency payments
- **Broadcast Messages**: Send messages to all users at once
- **User Management**: Complete user data tracking

## System Requirements

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager
- A Telegram Bot Token (from @BotFather)

## Installation

### 1. Clone or Extract the Project

```bash
cd telegram-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the following:

```env
BOT_TOKEN=your_telegram_bot_token_here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=bot_user
MYSQL_PASSWORD=secure_password_here
MYSQL_DATABASE=vpn_bot_db
ADMIN_IDS=123456789,987654321
```

### 4. Setup MySQL Database

Make sure MySQL is running and create the database:

```bash
npm run setup-db
```

This will:
- Connect to your MySQL server
- Create the database if it doesn't exist
- Create all required tables

### 5. Create Initial Admin User

After database setup, you'll need to manually add your admin user to the database:

```sql
INSERT INTO admin_users (telegram_id, username, role) 
VALUES (YOUR_TELEGRAM_ID, 'your_username', 'superadmin');
```

Or use the application admin commands to manage admins.

## Running the Bot

### Development Mode
```bash
npm run dev
```

This uses nodemon for automatic restart on file changes.

### Production Mode
```bash
npm start
```

## User Commands

| Command | Description |
|---------|-------------|
| `/start` | Show main menu with all options |
| `/buy` | Browse and purchase plans |
| `/myconfigs` | View active configurations |
| `/account` | Account information and stats |
| `/addbalance` | Request balance top-up |
| `/help` | Show help information |
| `/admin` | Access admin panel (admin only) |

## Admin Commands

| Command | Description |
|---------|-------------|
| `/admin` | Open admin menu (admin verification required) |
| `➕ Add Config` | Add new VPN/proxy configuration |
| `📊 Statistics` | View system statistics |
| `✅ Approve Payments` | Review pending payments |
| `📢 Broadcast Message` | Send message to all users |

## Pricing Plans

The default pricing is configured in `.env`:

- **Bronze**: $4.99 for 30 days
- **Silver**: $12.99 for 90 days
- **Gold**: $24.99 for 180 days

Modify `PLAN_*_PRICE` and `PLAN_*_DAYS` environment variables to change.

## Database Schema

### Tables

- **users**: User accounts and balances
- **configs**: VPN/proxy configurations
- **purchases**: User subscriptions
- **payments**: Cryptocurrency payment requests
- **admin_users**: Admin account list
- **broadcast_messages**: Message history

See `src/database/schema.sql` for detailed schema.

## Payment Workflow

1. User selects cryptocurrency and initiates payment request
2. Bot provides cryptocurrency address
3. User sends crypto and provides transaction ID
4. Admin reviews payment in the approval panel
5. Admin approves payment → user balance is credited
6. User is notified and can now use purchased configs

## Configuration

### Cryptocurrency Support
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (Tether)
- USDC (USD Coin)

### Plan Customization
Edit `.env` to customize:
- Plan names and pricing
- Plan durations in days
- Currency symbol (default: USD)

## Deployment

### Option 1: Direct VPS Deployment

```bash
# Install Node.js and MySQL on your VPS
# Clone project and setup as above

# Run as background service using PM2
npm install -g pm2
pm2 start src/bot.js --name "vpn-bot"
pm2 startup
pm2 save
```

### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t vpn-bot .
docker run -e BOT_TOKEN=xxx -e MYSQL_HOST=xxx ... vpn-bot
```

### Option 3: Cloud Deployment (Heroku, Railway, etc.)

Set environment variables in the cloud platform's dashboard and deploy.

## Security Considerations

1. **Admin Verification**: Only telegram IDs in `ADMIN_IDS` can access admin functions
2. **Rate Limiting**: Implement rate limiting for payment requests (future enhancement)
3. **Input Validation**: All user inputs are validated before processing
4. **Secure Credentials**: Never commit `.env` file to version control
5. **Database Backups**: Regularly backup your MySQL database
6. **HTTPS for Webhooks**: If using webhook mode, ensure HTTPS is enabled

## Logging

Debug logs are written to stdout with `[v0]` prefix:

```javascript
console.log('[v0] User created:', userId);
console.error('[v0] Error occurred:', error.message);
```

For production, consider redirecting output to a log file:

```bash
npm start >> bot.log 2>&1 &
```

## Monitoring & Maintenance

### Daily Tasks
- Check pending payment approvals
- Monitor user balance requests
- Review broadcast message effectiveness

### Weekly Tasks
- Backup database
- Review user statistics
- Check for expired subscriptions

### Monthly Tasks
- Archive old records
- Review revenue reports
- Update pricing if needed

## Troubleshooting

### Bot doesn't start
- Check `BOT_TOKEN` is correct
- Ensure MySQL is running and credentials are correct
- Check firewall rules if on a VPS

### Database connection fails
- Verify MySQL service is running
- Check MYSQL_* environment variables
- Ensure bot_user has proper permissions

### Payments not processing
- Verify admin IDs are correctly set
- Check database for payment records
- Review error logs for specific issues

### Messages not delivering
- Ensure Telegram Bot Token is valid
- Check user hasn't blocked the bot
- Verify user's telegram_id is correct

## Support

For issues or questions:
1. Check the logs with `[v0]` prefix
2. Review database records for debugging
3. Test database connection separately
4. Verify all environment variables are set correctly

## License

MIT License - Feel free to use and modify as needed.

## Contributing

To improve this bot:
1. Test thoroughly in development environment
2. Update documentation for any changes
3. Follow existing code patterns and style
4. Use console.log('[v0] ...') for debug logging

## Future Enhancements

- Auto-verification of cryptocurrency payments via blockchain APIs
- User referral system with rewards
- Config usage analytics and reporting
- Multi-language support
- Rate limiting and security improvements
- Webhook support for faster updates
- Admin dashboard web interface
