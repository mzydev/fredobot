const { Telegraf, session } = require('telegraf');
const dotenv = require('dotenv');
const db = require('./config/database-sqlite');
const messageHandler = require('./handlers/messageHandler');
const purchaseService = require('./services/purchaseService-sqlite');

// Load environment variables
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Error handling
process.on('uncaughtException', (err) => {
  console.error('[v0] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[v0] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
bot.use(session()); // Session middleware for storing state

// Initialize bot
async function initializeBot() {
  try {
    console.log('[v0] Testing database connection...');
    // Test SQLite connection
    const stmt = db.prepare('SELECT 1');
    stmt.get();
    console.log('[v0] Database connection successful');

    // Start listening for messages
    console.log('[v0] Starting Telegram bot...');

    // Commands
    bot.command('start', (ctx) => messageHandler.handleCommand(ctx));
    bot.command('buy', (ctx) => messageHandler.handleCommand(ctx));
    bot.command('myconfigs', (ctx) => messageHandler.handleCommand(ctx));
    bot.command('account', (ctx) => messageHandler.handleCommand(ctx));
    bot.command('addbalance', (ctx) => messageHandler.handleCommand(ctx));
    bot.command('help', (ctx) => messageHandler.handleCommand(ctx));
    bot.command('admin', (ctx) => messageHandler.handleCommand(ctx));

    // Text messages
    bot.on('text', async (ctx) => {
      if (ctx.message.text.startsWith('/')) {
        // Command will be handled by command middleware
        return;
      }

      // Check if awaiting TXID for payment
      if (ctx.session && ctx.session.awaitingTxid) {
        try {
          const user = require('./services/userService');
          const userData = await user.getUser(ctx.from.id);
          const cryptoType = ctx.session.cryptoType;
          const txid = ctx.message.text;

          // Create payment record
          const paymentService = require('./services/paymentService');
          
          // Calculate amount based on balance top-up (default to $25)
          const topupAmount = 25.00;
          
          const payment = await paymentService.createPayment(userData.id, topupAmount, cryptoType);
          await paymentService.updatePaymentTxid(payment.id, txid);

          delete ctx.session.awaitingTxid;
          delete ctx.session.cryptoType;

          const message = `💰 Payment Request Submitted\n\n` +
            `Amount: $${topupAmount.toFixed(2)}\n` +
            `Cryptocurrency: ${cryptoType}\n` +
            `Transaction ID: ${txid}\n\n` +
            `Your payment is pending admin approval. You will be notified once it's processed.`;

          await ctx.reply(message);
        } catch (error) {
          console.error('[v0] Error processing TXID:', error);
          await ctx.reply('An error occurred. Please try again.');
        }
        return;
      }

      // Regular message handling
      await messageHandler.handleTextMessage(ctx);
    });

    // Callback queries (button clicks)
    bot.on('callback_query', async (ctx) => {
      await messageHandler.handleCallbackQuery(ctx);
    });

    // Start polling
    console.log('[v0] Bot is running! Listening for messages...');
    await bot.launch();

    // Graceful shutdown
    process.once('SIGINT', () => {
      console.log('[v0] SIGINT received, closing bot...');
      bot.stop('SIGINT');
      pool.end().then(() => {
        console.log('[v0] Database pool closed');
        process.exit(0);
      });
    });

    process.once('SIGTERM', () => {
      console.log('[v0] SIGTERM received, closing bot...');
      bot.stop('SIGTERM');
      pool.end().then(() => {
        console.log('[v0] Database pool closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('[v0] Failed to initialize bot:', error);
    process.exit(1);
  }
}

// Run the bot
if (require.main === module) {
  initializeBot();
}

module.exports = bot;
