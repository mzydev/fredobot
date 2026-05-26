const userService = require('../services/userService');
const configService = require('../services/configService');
const purchaseService = require('../services/purchaseService');
const paymentService = require('../services/paymentService');
const keyboards = require('../utils/keyboards');
const helpers = require('../utils/helpers');

const userHandlers = {
  // Start command - show main menu
  async start(ctx) {
    try {
      const user = await userService.getOrCreateUser(ctx.from.id, ctx.from);
      const balance = parseFloat(user.balance) || 0;
      
      const welcomeText = `Welcome! 👋\n\nYou have $${balance.toFixed(2)} in your account.\n\nWhat would you like to do?`;
      await ctx.reply(welcomeText, userHandlers.mainMenuKeyboard());
    } catch (error) {
      console.error('[v0] Error in start:', error);
      await ctx.reply('An error occurred. Please try again later.');
    }
  },

  // Main menu keyboard
  mainMenuKeyboard() {
    return keyboards.mainMenuKeyboard();
  },

  // Buy Config flow
  async buyConfig(ctx) {
    try {
      const configs = await configService.getAllConfigs(true);
      
      if (configs.length === 0) {
        await ctx.reply('Sorry, no configs available at the moment. Please try again later.');
        return;
      }

      // Show plan selection
      const message = '📦 Select a plan:\n\n' +
        '🥉 Bronze - ' + helpers.formatCurrency(process.env.PLAN_BRONZE_PRICE || 4.99) + 
        ' for ' + (process.env.PLAN_BRONZE_DAYS || 30) + ' days\n\n' +
        '🥈 Silver - ' + helpers.formatCurrency(process.env.PLAN_SILVER_PRICE || 12.99) + 
        ' for ' + (process.env.PLAN_SILVER_DAYS || 90) + ' days\n\n' +
        '🥇 Gold - ' + helpers.formatCurrency(process.env.PLAN_GOLD_PRICE || 24.99) + 
        ' for ' + (process.env.PLAN_GOLD_DAYS || 180) + ' days';

      await ctx.reply(message, keyboards.planSelectionKeyboard());
    } catch (error) {
      console.error('[v0] Error in buyConfig:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // My Configs - show active purchases
  async myConfigs(ctx) {
    try {
      const user = await userService.getUser(ctx.from.id);
      if (!user) {
        await ctx.reply('User not found. Please use /start first.');
        return;
      }

      const purchases = await purchaseService.getUserPurchases(user.id, true);

      if (purchases.length === 0) {
        await ctx.reply('📋 You don\'t have any active configurations yet.\n\nUse /buy to purchase one!');
        return;
      }

      let message = '📋 Your Active Configurations:\n\n';
      purchases.forEach((purchase, index) => {
        const daysLeft = helpers.getDaysUntilExpiry(purchase.expiry_date);
        message += `${index + 1}. ${purchase.name}\n`;
        message += `   Plan: ${purchase.plan_type.toUpperCase()}\n`;
        message += `   Expires: ${helpers.formatDate(purchase.expiry_date)} (${daysLeft} days left)\n`;
        message += `   Config: \`${purchase.config_link}\`\n`;
        message += `   Sub Link: \`${purchase.sub_link}\`\n\n`;
      });

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[v0] Error in myConfigs:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // My Account - show account info
  async myAccount(ctx) {
    try {
      const user = await userService.getUser(ctx.from.id);
      if (!user) {
        await ctx.reply('User not found. Please use /start first.');
        return;
      }

      const purchases = await purchaseService.getUserPurchases(user.id, true);
      const payments = await paymentService.getUserPayments(user.id);

      let message = '👤 Account Information\n\n';
      message += `Username: ${user.username || 'Not set'}\n`;
      message += `Telegram ID: ${user.telegram_id}\n`;
      message += `Balance: $${(parseFloat(user.balance) || 0).toFixed(2)}\n\n`;
      message += `📊 Statistics:\n`;
      message += `Active Subscriptions: ${purchases.length}\n`;
      message += `Total Transactions: ${payments.length}\n`;
      message += `Member Since: ${helpers.formatDate(user.created_at)}\n`;

      await ctx.reply(message);
    } catch (error) {
      console.error('[v0] Error in myAccount:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Add Balance flow
  async addBalance(ctx) {
    try {
      const message = `💰 Add Balance\n\n` +
        `Select a cryptocurrency to top up your account:\n\n` +
        `₿ Bitcoin (BTC)\n` +
        `Ξ Ethereum (ETH)\n` +
        `₮ USDT\n` +
        `USDC\n\n` +
        `Please note: Admin approval is required for all payments.`;

      await ctx.reply(message, keyboards.cryptoSelectionKeyboard());
    } catch (error) {
      console.error('[v0] Error in addBalance:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Help command
  async help(ctx) {
    try {
      const message = `❓ Help & Commands\n\n` +
        `/start - Show main menu\n` +
        `/buy - Browse and purchase plans\n` +
        `/myconfigs - View your active configurations\n` +
        `/account - Account information and statistics\n` +
        `/addbalance - Request to add balance\n` +
        `/help - Show this help message\n\n` +
        `For admin access, use /admin\n\n` +
        `If you have any issues, please contact support.`;

      await ctx.reply(message);
    } catch (error) {
      console.error('[v0] Error in help:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Handle text input for user context
  async handleText(ctx) {
    const text = ctx.message.text;

    switch(text) {
      case '🛒 Buy Config':
        await userHandlers.buyConfig(ctx);
        break;
      case '📋 My Configs':
        await userHandlers.myConfigs(ctx);
        break;
      case '👤 My Account':
        await userHandlers.myAccount(ctx);
        break;
      case '💰 Add Balance':
        await userHandlers.addBalance(ctx);
        break;
      case '❓ Help':
        await userHandlers.help(ctx);
        break;
      default:
        await ctx.reply('I didn\'t understand that command. Please use the menu or /help for available commands.');
    }
  }
};

module.exports = userHandlers;
