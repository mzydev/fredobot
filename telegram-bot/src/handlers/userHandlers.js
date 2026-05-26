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
      
      const welcomeText = `خوش آمدید! 👋\n\nموجودی حساب شما: $${balance.toFixed(2)}\n\nچه کاری می‌خواهید انجام دهید؟`;
      await ctx.reply(welcomeText, userHandlers.mainMenuKeyboard());
    } catch (error) {
      console.error('[v0] Error in start:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً بعداً دوباره تلاش کنید.');
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
        await ctx.reply('متأسفانه هیچ تنظیماتی در حال حاضر موجود نیست. لطفاً بعداً دوباره تلاش کنید.');
        return;
      }

      // Show plan selection
      const message = '📦 یک پلن انتخاب کنید:\n\n' +
        '🥉 برنزی - ' + helpers.formatCurrency(process.env.PLAN_BRONZE_PRICE || 4.99) + 
        ' برای ' + (process.env.PLAN_BRONZE_DAYS || 30) + ' روز\n\n' +
        '🥈 نقره‌ای - ' + helpers.formatCurrency(process.env.PLAN_SILVER_PRICE || 12.99) + 
        ' برای ' + (process.env.PLAN_SILVER_DAYS || 90) + ' روز\n\n' +
        '🥇 طلایی - ' + helpers.formatCurrency(process.env.PLAN_GOLD_PRICE || 24.99) + 
        ' برای ' + (process.env.PLAN_GOLD_DAYS || 180) + ' روز';

      await ctx.reply(message, keyboards.planSelectionKeyboard());
    } catch (error) {
      console.error('[v0] Error in buyConfig:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // My Configs - show active purchases
  async myConfigs(ctx) {
    try {
      const user = await userService.getUser(ctx.from.id);
      if (!user) {
        await ctx.reply('کاربر یافت نشد. لطفاً ابتدا /start را بزنید.');
        return;
      }

      const purchases = await purchaseService.getUserPurchases(user.id, true);

      if (purchases.length === 0) {
        await ctx.reply('📋 شما هنوز هیچ تنظیماتی فعالی ندارید.\n\nبرای خرید از /buy استفاده کنید!');
        return;
      }

      let message = '📋 تنظیمات فعال شما:\n\n';
      purchases.forEach((purchase, index) => {
        const daysLeft = helpers.getDaysUntilExpiry(purchase.expiry_date);
        message += `${index + 1}. ${purchase.name}\n`;
        message += `   پلن: ${purchase.plan_type.toUpperCase()}\n`;
        message += `   انقضا: ${helpers.formatDate(purchase.expiry_date)} (${daysLeft} روز باقی مانده)\n`;
        message += `   تنظیمات: \`${purchase.config_link}\`\n`;
        message += `   لینک اشتراک: \`${purchase.sub_link}\`\n\n`;
      });

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[v0] Error in myConfigs:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // My Account - show account info
  async myAccount(ctx) {
    try {
      const user = await userService.getUser(ctx.from.id);
      if (!user) {
        await ctx.reply('کاربر یافت نشد. لطفاً ابتدا /start را بزنید.');
        return;
      }

      const purchases = await purchaseService.getUserPurchases(user.id, true);
      const payments = await paymentService.getUserPayments(user.id);

      let message = '👤 اطلاعات حساب\n\n';
      message += `نام کاربری: ${user.username || 'تعیین نشده'}\n`;
      message += `شناسه تلگرام: ${user.telegram_id}\n`;
      message += `موجودی: $${(parseFloat(user.balance) || 0).toFixed(2)}\n\n`;
      message += `📊 آمار:\n`;
      message += `اشتراک‌های فعال: ${purchases.length}\n`;
      message += `کل تراکنش‌ها: ${payments.length}\n`;
      message += `عضویت از: ${helpers.formatDate(user.created_at)}\n`;

      await ctx.reply(message);
    } catch (error) {
      console.error('[v0] Error in myAccount:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Add Balance flow
  async addBalance(ctx) {
    try {
      const message = `💰 افزایش موجودی\n\n` +
        `برای شارژ حساب یک رمزارز انتخاب کنید:\n\n` +
        `₿ بیت‌کوین (BTC)\n` +
        `Ξ اتریوم (ETH)\n` +
        `₮ تتر (USDT)\n` +
        `USDC\n\n` +
        `توجه: تمام پرداخت‌ها نیاز به تأیید مدیر دارند.`;

      await ctx.reply(message, keyboards.cryptoSelectionKeyboard());
    } catch (error) {
      console.error('[v0] Error in addBalance:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Help command
  async help(ctx) {
    try {
      const message = `❓ راهنمایی و دستورات\n\n` +
        `/start - نمایش منوی اصلی\n` +
        `/buy - مرور و خرید پلن‌ها\n` +
        `/myconfigs - مشاهده تنظیمات فعال شما\n` +
        `/account - اطلاعات حساب و آمار\n` +
        `/addbalance - درخواست افزایش موجودی\n` +
        `/help - نمایش این پیام راهنمایی\n\n` +
        `برای دسترسی مدیر، از /admin استفاده کنید\n\n` +
        `اگر مشکلی دارید، لطفاً با پشتیبانی تماس بگیرید.`;

      await ctx.reply(message);
    } catch (error) {
      console.error('[v0] Error in help:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Handle text input for user context
  async handleText(ctx) {
    const text = ctx.message.text;

    switch(text) {
      case '🛒 خرید تنظیمات':
        await userHandlers.buyConfig(ctx);
        break;
      case '📋 تنظیمات من':
        await userHandlers.myConfigs(ctx);
        break;
      case '👤 حساب من':
        await userHandlers.myAccount(ctx);
        break;
      case '💰 افزایش موجودی':
        await userHandlers.addBalance(ctx);
        break;
      case '🔐 پنل مدیریت':
        await userHandlers.adminAccess(ctx);
        break;
      case '❓ راهنمایی':
        await userHandlers.help(ctx);
        break;
      default:
        await ctx.reply('دستور مفهومی نیست. لطفاً از منو استفاده کنید یا /help را بزنید.');
    }
  },

  // Admin access from main menu
  async adminAccess(ctx) {
    try {
      const isAdmin = require('../utils/helpers').isAdmin(ctx.from.id, require('../utils/helpers').parseAdminIds(process.env.ADMIN_IDS));
      if (!isAdmin) {
        await ctx.reply('❌ شما دسترسی مدیر ندارید.');
        return;
      }
      const adminHandlers = require('./adminHandlers');
      await adminHandlers.adminMenu(ctx);
    } catch (error) {
      console.error('[v0] Error in adminAccess:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  }
};

module.exports = userHandlers;
