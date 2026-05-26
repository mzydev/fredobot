const userService = require('../services/userService');
const configService = require('../services/configService');
const purchaseService = require('../services/purchaseService');
const paymentService = require('../services/paymentService');
const userHandlers = require('./userHandlers');
const adminHandlers = require('./adminHandlers');
const keyboards = require('../utils/keyboards');
const helpers = require('../utils/helpers');

const messageHandler = {
  // Route commands
  async handleCommand(ctx) {
    const command = ctx.message.text.toLowerCase();

    switch(command) {
      case '/start':
        await userHandlers.start(ctx);
        break;
      case '/buy':
        await userHandlers.buyConfig(ctx);
        break;
      case '/myconfigs':
        await userHandlers.myConfigs(ctx);
        break;
      case '/account':
        await userHandlers.myAccount(ctx);
        break;
      case '/addbalance':
        await userHandlers.addBalance(ctx);
        break;
      case '/help':
        await userHandlers.help(ctx);
        break;
      case '/admin':
        await adminHandlers.adminMenu(ctx);
        break;
      default:
        await ctx.reply('دستور نامشخص. برای مشاهده دستورات /help را تایپ کنید.');
    }
  },

  // Handle regular text messages
  async handleTextMessage(ctx) {
    try {
      // Ensure user exists
      await userService.getOrCreateUser(ctx.from.id, ctx.from);

      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));

      if (isAdmin) {
        // Check if admin is in admin menu context
        await adminHandlers.handleText(ctx);
      } else {
        // Regular user
        await userHandlers.handleText(ctx);
      }
    } catch (error) {
      console.error('[v0] Error in handleTextMessage:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Handle callback queries (button clicks)
  async handleCallbackQuery(ctx) {
    try {
      const data = ctx.callbackQuery.data;

      // Plan selection
      if (data.startsWith('plan_')) {
        await messageHandler.handlePlanSelection(ctx, data);
      }
      // Crypto selection
      else if (data.startsWith('crypto_')) {
        await messageHandler.handleCryptoSelection(ctx, data);
      }
      // Confirm/Cancel
      else if (data === 'confirm') {
        await messageHandler.handleConfirm(ctx);
      }
      else if (data === 'cancel') {
        await messageHandler.handleCancel(ctx);
      }
      // Yes/No for broadcast
      else if (data === 'yes') {
        await messageHandler.handleBroadcastConfirm(ctx);
      }
      else if (data === 'no') {
        await messageHandler.handleBroadcastCancel(ctx);
      }
      // Payment approval/rejection
      else if (data.startsWith('approve_')) {
        await messageHandler.handlePaymentApproval(ctx, data);
      }
      else if (data.startsWith('reject_')) {
        await messageHandler.handlePaymentRejection(ctx, data);
      }

      await ctx.answerCbQuery();
    } catch (error) {
      console.error('[v0] Error in handleCallbackQuery:', error);
      await ctx.answerCbQuery('An error occurred');
    }
  },

  // Handle plan selection
  async handlePlanSelection(ctx, data) {
    try {
      const planType = data.replace('plan_', '');
      const planDetails = helpers.getPlanDetails(planType);

      ctx.session = ctx.session || {};
      ctx.session.selectedPlan = planType;

      const configs = await configService.getAllConfigs(true);
      if (configs.length === 0) {
        await ctx.editMessageText('تنظیماتی موجود نیست.');
        return;
      }

      let message = `شما انتخاب کردید: ${planDetails.name}\n`;
      message += `قیمت: ${helpers.formatCurrency(planDetails.price)}\n`;
      message += `مدت زمان: ${planDetails.days} روز\n\n`;
      message += `می‌خواهید خریدتان را انجام دهید؟`;

      await ctx.editMessageText(message, keyboards.yesNoKeyboard());
    } catch (error) {
      console.error('[v0] Error in handlePlanSelection:', error);
    }
  },

  // Handle crypto selection
  async handleCryptoSelection(ctx, data) {
    try {
      const cryptoType = data.replace('crypto_', '');
      
      ctx.session = ctx.session || {};
      ctx.session.cryptoType = cryptoType;

      // Generate a crypto address (in production, use actual wallet service)
      const cryptoAddress = `${cryptoType}_ADDRESS_1A2B3C4D5E6F...`;

      let message = `💳 افزایش موجودی\n\n`;
      message += `رمزارز: ${cryptoType}\n`;
      message += `پرداخت خود را به این آدرس ارسال کنید:\n\n`;
      message += `\`${cryptoAddress}\`\n\n`;
      message += `پس از ارسال، شناسه تراکنش (TXID) خود را به من بفرستید`;

      await ctx.editMessageText(message, { parse_mode: 'Markdown' });

      ctx.session.awaitingTxid = true;
    } catch (error) {
      console.error('[v0] Error in handleCryptoSelection:', error);
    }
  },

  // Handle confirm
  async handleConfirm(ctx) {
    try {
      ctx.session = ctx.session || {};
      const user = await userService.getUser(ctx.from.id);

      if (ctx.session.selectedPlan) {
        // Purchase flow
        const planDetails = helpers.getPlanDetails(ctx.session.selectedPlan);
        const userBalance = parseFloat(user.balance) || 0;

        if (userBalance < planDetails.price) {
          await ctx.editMessageText(
            `❌ موجودی ناکافی.\n\n` +
            `مورد نیاز: ${helpers.formatCurrency(planDetails.price)}\n` +
            `موجودی شما: ${helpers.formatCurrency(userBalance)}\n\n` +
            `برای شارژ حساب از /addbalance استفاده کنید.`
          );
          delete ctx.session.selectedPlan;
          return;
        }

        // Create purchase
        const configs = await configService.getAllConfigs(true);
        const config = configs[0]; // Select first available config for now
        
        await purchaseService.createPurchase(user.id, config.id, ctx.session.selectedPlan);
        await userService.deductBalance(ctx.from.id, planDetails.price);

        await ctx.editMessageText(
          `✅ خریدتان موفق بود!\n\n` +
          `پلن: ${planDetails.name}\n` +
          `هزینه: ${helpers.formatCurrency(planDetails.price)}\n` +
          `مدت زمان: ${planDetails.days} روز\n\n` +
          `موجودی جدید شما: ${helpers.formatCurrency(userBalance - planDetails.price)}\n\n` +
          `برای مشاهده تنظیمات از /myconfigs استفاده کنید.`
        );

        delete ctx.session.selectedPlan;
      }
    } catch (error) {
      console.error('[v0] Error in handleConfirm:', error);
    }
  },

  // Handle cancel
  async handleCancel(ctx) {
    try {
      await ctx.editMessageText('❌ لغو شد.');
      delete ctx.session;
    } catch (error) {
      console.error('[v0] Error in handleCancel:', error);
    }
  },

  // Handle broadcast confirmation
  async handleBroadcastConfirm(ctx) {
    try {
      ctx.session = ctx.session || {};
      
      if (!ctx.session.broadcastMessage) {
        await ctx.editMessageText('پیامی برای ارسال وجود ندارد.');
        return;
      }

      const users = await userService.getAllUsers();
      let successCount = 0;
      let failCount = 0;

      for (const user of users) {
        try {
          await ctx.telegram.sendMessage(user.telegram_id, ctx.session.broadcastMessage);
          successCount++;
        } catch (error) {
          console.error(`[v0] Failed to send broadcast to ${user.telegram_id}:`, error.message);
          failCount++;
        }
      }

      await ctx.editMessageText(
        `📢 ارسال گروهی تکمیل شد\n\n` +
        `ارسال شده: ${successCount}\n` +
        `ناموفق: ${failCount}`
      );

      delete ctx.session.broadcastMessage;
      delete ctx.session.broadcastStep;
    } catch (error) {
      console.error('[v0] Error in handleBroadcastConfirm:', error);
    }
  },

  // Handle broadcast cancellation
  async handleBroadcastCancel(ctx) {
    try {
      await ctx.editMessageText('❌ ارسال گروهی لغو شد.');
      delete ctx.session;
    } catch (error) {
      console.error('[v0] Error in handleBroadcastCancel:', error);
    }
  },

  // Handle payment approval
  async handlePaymentApproval(ctx, data) {
    try {
      const paymentId = parseInt(data.replace('approve_', ''));
      const payment = await paymentService.getPayment(paymentId);

      if (!payment) {
        await ctx.editMessageText('❌ پرداخت یافت نشد.');
        return;
      }

      await paymentService.approvePayment(paymentId, ctx.from.id);

      // Notify user
      try {
        await ctx.telegram.sendMessage(
          payment.telegram_id,
          `✅ پرداخت تأیید شد!\n\n` +
          `مبلغ: ${helpers.formatCurrency(payment.amount)} ${payment.crypto_type}\n` +
          `موجودی جدید شما: $0.00\n\n` +
          `برای بررسی موجودی جدید از /addbalance استفاده کنید.`
        );
      } catch (err) {
        console.error('[v0] Failed to notify user:', err);
      }

      await ctx.editMessageText('✅ پرداخت با موفقیت تأیید شد!');
    } catch (error) {
      console.error('[v0] Error in handlePaymentApproval:', error);
    }
  },

  // Handle payment rejection
  async handlePaymentRejection(ctx, data) {
    try {
      const paymentId = parseInt(data.replace('reject_', ''));
      
      await paymentService.rejectPayment(paymentId, 'رد شده توسط مدیر');

      await ctx.editMessageText('❌ پرداخت رد شد.');
    } catch (error) {
      console.error('[v0] Error in handlePaymentRejection:', error);
    }
  }
};

module.exports = messageHandler;
