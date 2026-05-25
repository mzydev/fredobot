# Quick Start Guide

Get your Telegram VPN bot running in 5 minutes!

## Prerequisites

- Telegram account
- Node.js installed (v14+)
- MySQL installed and running

## Step 1: Get Your Bot Token

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts to create a bot
4. Copy your bot token (looks like: `123456789:ABCdefGHIjklmnoPQRstuvWXYZ...`)

**Keep this safe!** This is your `BOT_TOKEN`.

## Step 2: Clone/Extract Project

```bash
cd telegram-bot
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Configure Environment

```bash
cp .env.example .env
nano .env  # or edit in your favorite editor
```

Edit these critical variables:

```env
BOT_TOKEN=your_bot_token_from_botfather
MYSQL_HOST=localhost
MYSQL_USER=root           # or your MySQL user
MYSQL_PASSWORD=           # your MySQL password
ADMIN_IDS=your_telegram_id  # Get your ID: search for @userinfobot on Telegram
```

To find your Telegram ID:
1. Search for `@userinfobot` on Telegram
2. Send any message
3. Copy the `id` number shown

## Step 5: Setup Database

```bash
npm run setup-db
```

This will:
- Create the database
- Create all tables
- Set everything up

## Step 6: Start the Bot

```bash
npm start
```

You should see:
```
[v0] Database connection successful
[v0] Bot is running! Listening for messages...
```

## Step 7: Test Your Bot

1. Find your bot on Telegram (search by its username)
2. Send `/start`
3. You should see the main menu

## Troubleshooting

### Bot doesn't start

Check if MySQL is running:
```bash
# Mac
brew services list

# Linux
sudo systemctl status mysql

# Windows
services.msc (search for MySQL)
```

### Database setup fails

Verify MySQL credentials:
```bash
mysql -u root -p
# Enter your password
# If this works, credentials are correct
```

### Can't find your bot

Make sure you copied the bot token correctly from @BotFather.

### Only getting "I didn't understand that command"

Make sure you're sending commands like `/start`, `/buy`, etc. The bot recognizes these commands.

## Next Steps

1. **Add a config**: Use `/admin` then select "Add Config"
2. **Add another admin**: Edit database directly (see README.md)
3. **Customize pricing**: Edit `.env` file (PLAN_*_PRICE and PLAN_*_DAYS)
4. **Deploy to production**: See DEPLOYMENT.md

## Using the Bot

### As a User
- `/start` - Main menu
- `/buy` - Purchase a plan
- `/myconfigs` - View your configs
- `/account` - See your balance
- `/addbalance` - Top up account
- `/help` - Get help

### As an Admin
- `/admin` - Admin panel
- Add configs
- Approve payments
- Broadcast messages
- View statistics

## Development Mode

For development with auto-reload:

```bash
npm run dev
```

This uses nodemon to automatically restart when you change files.

## Common Issues

### "Database connection failed"
- MySQL is not running
- Wrong MYSQL_HOST/USER/PASSWORD
- Database doesn't exist (run `npm run setup-db`)

### "Bot token is invalid"
- Copy token from @BotFather again
- Remove any extra spaces
- Make sure it's in .env as BOT_TOKEN

### "Can't send messages to users"
- User has blocked the bot
- User's telegram_id is wrong in database
- Network connectivity issue

### Port conflicts
If port 3306 (MySQL) is in use, change MYSQL_PORT in .env

## Next: Production Deployment

Once everything works locally:

1. **Get a VPS**: Rent a server from DigitalOcean, Linode, etc.
2. **Follow DEPLOYMENT.md**: Complete deployment guide
3. **Setup backups**: Regular database backups
4. **Monitor logs**: Check bot is running smoothly

## Support

- Check README.md for full documentation
- Check DEPLOYMENT.md for deployment help
- Check API.md for developer API docs
- Review error logs: `npm start` shows `[v0]` prefixed logs

## What to Configure Next

1. **Change plan prices** in `.env`
2. **Add actual crypto addresses** (currently placeholder)
3. **Add more admin users** to database
4. **Add more configs** using admin menu
5. **Setup payment verification** (manual or auto)

---

**Congratulations!** Your Telegram VPN bot is ready. Start adding configurations and users!
