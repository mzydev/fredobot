const userService = require('../services/userService');
const configService = require('../services/configService');
const purchaseService = require('../services/purchaseService');
const paymentService = require('../services/paymentService');
const keyboards = require('../utils/keyboards');
const helpers = require('../utils/helpers');

const adminHandlers = {
  // Admin menu - requires admin verification
  async adminMenu(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ شما دسترسی مدیر ندارید.');
        return;
      }

      const message = '🔐 پنل مدیریت\n\nیک عملیات انتخاب کنید:';
      await ctx.reply(message, keyboards.adminMenuKeyboard());
    } catch (error) {
      console.error('[v0] Error in adminMenu:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Add Config
  async addConfig(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ دسترسی مدیر لازم است.');
        return;
      }

      // Store state in ctx session for multi-step form
      ctx.session = ctx.session || {};
      ctx.session.addConfigStep = 1;
      
      await ctx.reply('➕ افزودن تنظیمات جدید\n\nمرحله 1/4: نام تنظیمات را وارد کنید:');
    } catch (error) {
      console.error('[v0] Error in addConfig:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Statistics command
  async statistics(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ دسترسی مدیر لازم است.');
        return;
      }

      const totalUsers = await userService.getTotalUsers();
      const activeUsers = await userService.getActiveUsers();
      const totalConfigs = await configService.getTotalConfigs();
      const totalPurchases = await purchaseService.getTotalPurchases();
      const activePurchases = await purchaseService.getActivePurchases();
      const totalRevenue = await purchaseService.getTotalRevenue();
      const totalApproved = await paymentService.getTotalApprovedAmount();

      let message = '📊 آمار\n\n';
      message += `👥 کاربران:\n`;
      message += `   کل: ${totalUsers}\n`;
      message += `   فعال: ${activeUsers}\n\n`;
      message += `📦 تنظیمات:\n`;
      message += `   کل: ${totalConfigs}\n\n`;
      message += `💳 خریدها:\n`;
      message += `   کل: ${totalPurchases}\n`;
      message += `   فعال: ${activePurchases}\n\n`;
      message += `💰 درآمد:\n`;
      message += `   کل درآمد (30 روز): $${totalRevenue.toFixed(2)}\n`;
      message += `   پرداخت‌های تأیید شده: $${totalApproved.toFixed(2)}\n`;

      await ctx.reply(message);
    } catch (error) {
      console.error('[v0] Error in statistics:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Approve Payments
  async approvePayments(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ دسترسی مدیر لازم است.');
        return;
      }

      const pendingPayments = await paymentService.getPendingPayments();

      if (pendingPayments.length === 0) {
        await ctx.reply('✅ هیچ پرداختی برای تأیید وجود ندارد.');
        return;
      }

      let message = `✅ پرداخت‌های در انتظار (${pendingPayments.length})\n\n`;
      
      for (const payment of pendingPayments) {
        const user = await userService.getUserById(payment.user_id);
        message += `شناسه پرداخت: ${payment.id}\n`;
        message += `کاربر: ${payment.first_name || payment.username || payment.telegram_id}\n`;
        message += `مبلغ: ${helpers.formatCurrency(payment.amount)} ${payment.crypto_type}\n`;
        message += `TXID: ${payment.txid || 'ارائه نشده'}\n`;
        message += `تاریخ: ${helpers.formatDateTime(payment.created_at)}\n\n`;
      }

      await ctx.reply(message);
      
      // Send buttons for first payment
      if (pendingPayments.length > 0) {
        const firstPayment = pendingPayments[0];
        const user = await userService.getUserById(firstPayment.user_id);
        const confirmMessage = `تأیید پرداخت از ${user.first_name || user.username}؟`;
        await ctx.reply(confirmMessage, keyboards.approveRejectKeyboard(firstPayment.id));
      }
    } catch (error) {
      console.error('[v0] Error in approvePayments:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Broadcast Message
  async broadcastMessage(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ دسترسی مدیر لازم است.');
        return;
      }

      ctx.session = ctx.session || {};
      ctx.session.broadcastStep = 1;
      
      await ctx.reply('📢 ارسال پیام گروهی\n\nپیامی را وارد کنید که می‌خواهید برای همه کاربران ارسال کنید:');
    } catch (error) {
      console.error('[v0] Error in broadcastMessage:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Handle text input for admin context
  async handleText(ctx) {
    const text = ctx.message.text;

    switch(text) {
      case '➕ افزودن تنظیمات':
        await adminHandlers.addConfig(ctx);
        break;
      case '📊 آمار':
        await adminHandlers.statistics(ctx);
        break;
      case '✅ تأیید پرداخت‌ها':
        await adminHandlers.approvePayments(ctx);
        break;
      case '📢 ارسال پیام گروهی':
        await adminHandlers.broadcastMessage(ctx);
        break;
      case '🔙 بازگشت به منوی کاربری':
        // Return to user menu
        const user = await userService.getUser(ctx.from.id);
        const balance = parseFloat(user?.balance) || 0;
        await ctx.reply(
          `خوش آمدید دوباره! موجودی شما: $${balance.toFixed(2)}`,
          keyboards.mainMenuKeyboard()
        );
        break;
      default:
        // Handle multi-step forms
        if (ctx.session && ctx.session.addConfigStep) {
          await adminHandlers.handleAddConfigStep(ctx);
        } else if (ctx.session && ctx.session.broadcastStep) {
          await adminHandlers.handleBroadcastStep(ctx);
        } else {
          await ctx.reply('دستور مفهومی نیست. لطفاً از منو استفاده کنید.');
        }
    }
  },

  // Handle Add Config multi-step form
  async handleAddConfigStep(ctx) {
    try {
      const text = ctx.message.text;
      ctx.session = ctx.session || {};

      if (ctx.session.addConfigStep === 1) {
        ctx.session.configName = text;
        ctx.session.addConfigStep = 2;
        await ctx.reply('مرحله 2/4: لینک تنظیمات را وارد کنید:');
      } else if (ctx.session.addConfigStep === 2) {
        ctx.session.configLink = text;
        ctx.session.addConfigStep = 3;
        await ctx.reply('مرحله 3/4: لینک اشتراک را وارد کنید:');
      } else if (ctx.session.addConfigStep === 3) {
        ctx.session.subLink = text;
        ctx.session.addConfigStep = 4;
        await ctx.reply('مرحله 4/4: توضیحات را وارد کنید (یا "skip" را بفرستید):');
      } else if (ctx.session.addConfigStep === 4) {
        const description = text === 'skip' ? null : text;
        
        await configService.createConfig(
          ctx.session.configName,
          ctx.session.configLink,
          ctx.session.subLink,
          description
        );

        delete ctx.session.addConfigStep;
        delete ctx.session.configName;
        delete ctx.session.configLink;
        delete ctx.session.subLink;

        await ctx.reply('✅ تنظیمات با موفقیت اضافه شد!');
        await ctx.reply('عملیات بعدی را انتخاب کنید:', keyboards.adminMenuKeyboard());
      }
    } catch (error) {
      console.error('[v0] Error in handleAddConfigStep:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  },

  // Handle Broadcast message multi-step form
  async handleBroadcastStep(ctx) {
    try {
      const text = ctx.message.text;
      ctx.session = ctx.session || {};

      if (ctx.session.broadcastStep === 1) {
        ctx.session.broadcastMessage = text;
        ctx.session.broadcastStep = 2;
        
        const confirmMessage = `📢 تأیید پیام:\n\n${text}\n\nبرای تمام کاربران ارسال شود؟`;
        await ctx.reply(confirmMessage, keyboards.yesNoKeyboard());
      }
    } catch (error) {
      console.error('[v0] Error in handleBroadcastStep:', error);
      await ctx.reply('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    }
  }
};

module.exports = adminHandlers;
