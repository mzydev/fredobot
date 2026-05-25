const { Markup } = require('telegraf');

const mainMenuKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.text('🛒 Buy Config')],
    [Markup.button.text('📋 My Configs')],
    [Markup.button.text('👤 My Account')],
    [Markup.button.text('💰 Add Balance')],
    [Markup.button.text('❓ Help')]
  ]).resize();
};

const adminMenuKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.text('➕ Add Config')],
    [Markup.button.text('📊 Statistics')],
    [Markup.button.text('✅ Approve Payments')],
    [Markup.button.text('📢 Broadcast Message')],
    [Markup.button.text('🔙 Back to User Menu')]
  ]).resize();
};

const planSelectionKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🥉 Bronze', 'plan_bronze'),
      Markup.button.callback('🥈 Silver', 'plan_silver'),
      Markup.button.callback('🥇 Gold', 'plan_gold')
    ],
    [Markup.button.callback('❌ Cancel', 'cancel')]
  ]);
};

const cryptoSelectionKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('₿ Bitcoin', 'crypto_BTC'),
      Markup.button.callback('Ξ Ethereum', 'crypto_ETH')
    ],
    [
      Markup.button.callback('₮ USDT', 'crypto_USDT'),
      Markup.button.callback('USDC', 'crypto_USDC')
    ],
    [Markup.button.callback('❌ Cancel', 'cancel')]
  ]);
};

const confirmKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Confirm', 'confirm'),
      Markup.button.callback('❌ Cancel', 'cancel')
    ]
  ]);
};

const yesNoKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Yes', 'yes'),
      Markup.button.callback('❌ No', 'no')
    ]
  ]);
};

const approveRejectKeyboard = (paymentId) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Approve', `approve_${paymentId}`),
      Markup.button.callback('❌ Reject', `reject_${paymentId}`)
    ]
  ]);
};

module.exports = {
  mainMenuKeyboard,
  adminMenuKeyboard,
  planSelectionKeyboard,
  cryptoSelectionKeyboard,
  confirmKeyboard,
  yesNoKeyboard,
  approveRejectKeyboard
};
