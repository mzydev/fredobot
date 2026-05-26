const userService = require('../services/userService-sqlite');
const configService = require('../services/configService-sqlite');
const purchaseService = require('../services/purchaseService-sqlite');
const paymentService = require('../services/paymentService-sqlite');
const keyboards = require('../utils/keyboards');
const helpers = require('../utils/helpers');

const adminHandlers = {
  // Admin menu - requires admin verification
  async adminMenu(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ You do not have admin access.');
        return;
      }

      const message = '🔐 Admin Panel\n\nSelect an action:';
      await ctx.reply(message, keyboards.adminMenuKeyboard());
    } catch (error) {
      console.error('[v0] Error in adminMenu:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Add Config
  async addConfig(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ Admin access required.');
        return;
      }

      // Store state in ctx session for multi-step form
      ctx.session = ctx.session || {};
      ctx.session.addConfigStep = 1;
      
      await ctx.reply('➕ Add New Configuration\n\nStep 1/4: Enter configuration name:');
    } catch (error) {
      console.error('[v0] Error in addConfig:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Statistics command
  async statistics(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ Admin access required.');
        return;
      }

      const totalUsers = await userService.getTotalUsers();
      const activeUsers = await userService.getActiveUsers();
      const totalConfigs = await configService.getTotalConfigs();
      const totalPurchases = await purchaseService.getTotalPurchases();
      const activePurchases = await purchaseService.getActivePurchases();
      const totalRevenue = await purchaseService.getTotalRevenue();
      const totalApproved = await paymentService.getTotalApprovedAmount();

      let message = '📊 Statistics\n\n';
      message += `👥 Users:\n`;
      message += `   Total: ${totalUsers}\n`;
      message += `   Active: ${activeUsers}\n\n`;
      message += `📦 Configurations:\n`;
      message += `   Total: ${totalConfigs}\n\n`;
      message += `💳 Purchases:\n`;
      message += `   Total: ${totalPurchases}\n`;
      message += `   Active: ${activePurchases}\n\n`;
      message += `💰 Revenue:\n`;
      message += `   Total Revenue (30 days): $${totalRevenue.toFixed(2)}\n`;
      message += `   Approved Payments: $${totalApproved.toFixed(2)}\n`;

      await ctx.reply(message);
    } catch (error) {
      console.error('[v0] Error in statistics:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Approve Payments
  async approvePayments(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ Admin access required.');
        return;
      }

      const pendingPayments = await paymentService.getPendingPayments();

      if (pendingPayments.length === 0) {
        await ctx.reply('✅ No pending payments to approve.');
        return;
      }

      let message = `✅ Pending Payments (${pendingPayments.length})\n\n`;
      
      for (const payment of pendingPayments) {
        const user = await userService.getUserById(payment.user_id);
        message += `Payment ID: ${payment.id}\n`;
        message += `User: ${payment.first_name || payment.username || payment.telegram_id}\n`;
        message += `Amount: ${helpers.formatCurrency(payment.amount)} ${payment.crypto_type}\n`;
        message += `TXID: ${payment.txid || 'Not provided'}\n`;
        message += `Date: ${helpers.formatDateTime(payment.created_at)}\n\n`;
      }

      await ctx.reply(message);
      
      // Send buttons for first payment
      if (pendingPayments.length > 0) {
        const firstPayment = pendingPayments[0];
        const user = await userService.getUserById(firstPayment.user_id);
        const confirmMessage = `Approve payment from ${user.first_name || user.username}?`;
        await ctx.reply(confirmMessage, keyboards.approveRejectKeyboard(firstPayment.id));
      }
    } catch (error) {
      console.error('[v0] Error in approvePayments:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Broadcast Message
  async broadcastMessage(ctx) {
    try {
      const isAdmin = helpers.isAdmin(ctx.from.id, helpers.parseAdminIds(process.env.ADMIN_IDS));
      
      if (!isAdmin) {
        await ctx.reply('❌ Admin access required.');
        return;
      }

      ctx.session = ctx.session || {};
      ctx.session.broadcastStep = 1;
      
      await ctx.reply('📢 Broadcast Message\n\nEnter the message you want to send to all users:');
    } catch (error) {
      console.error('[v0] Error in broadcastMessage:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  },

  // Handle text input for admin context
  async handleText(ctx) {
    const text = ctx.message.text;

    switch(text) {
      case '➕ Add Config':
        await adminHandlers.addConfig(ctx);
        break;
      case '📊 Statistics':
        await adminHandlers.statistics(ctx);
        break;
      case '✅ Approve Payments':
        await adminHandlers.approvePayments(ctx);
        break;
      case '📢 Broadcast Message':
        await adminHandlers.broadcastMessage(ctx);
        break;
      case '🔙 Back to User Menu':
        // Return to user menu
        const user = await userService.getUser(ctx.from.id);
        const balance = user?.balance || 0;
        await ctx.reply(
          `Welcome back! You have $${balance.toFixed(2)} in your account.`,
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
          await ctx.reply('I didn\'t understand that command. Please use the menu.');
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
        await ctx.reply('Step 2/4: Enter configuration link (config link):');
      } else if (ctx.session.addConfigStep === 2) {
        ctx.session.configLink = text;
        ctx.session.addConfigStep = 3;
        await ctx.reply('Step 3/4: Enter subscription link (sub link):');
      } else if (ctx.session.addConfigStep === 3) {
        ctx.session.subLink = text;
        ctx.session.addConfigStep = 4;
        await ctx.reply('Step 4/4: Enter description (or send "skip" to skip):');
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

        await ctx.reply('✅ Configuration added successfully!');
        await ctx.reply('Select next action:', keyboards.adminMenuKeyboard());
      }
    } catch (error) {
      console.error('[v0] Error in handleAddConfigStep:', error);
      await ctx.reply('An error occurred. Please try again.');
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
        
        const confirmMessage = `📢 Confirm Message:\n\n${text}\n\nSend to all users?`;
        await ctx.reply(confirmMessage, keyboards.yesNoKeyboard());
      }
    } catch (error) {
      console.error('[v0] Error in handleBroadcastStep:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  }
};

module.exports = adminHandlers;
