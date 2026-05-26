const { Markup } = require('telegraf');

const mainMenuKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.text('🛒 خرید تنظیمات')],
    [Markup.button.text('📋 تنظیمات من')],
    [Markup.button.text('👤 حساب من')],
    [Markup.button.text('💰 افزایش موجودی')],
    [Markup.button.text('🔐 پنل مدیریت')],
    [Markup.button.text('❓ راهنمایی')]
  ]).resize();
};

const adminMenuKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.text('➕ افزودن تنظیمات')],
    [Markup.button.text('📊 آمار')],
    [Markup.button.text('✅ تأیید پرداخت‌ها')],
    [Markup.button.text('📢 ارسال پیام گروهی')],
    [Markup.button.text('🔙 بازگشت به منوی کاربری')]
  ]).resize();
};

const planSelectionKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🥉 برنزی', 'plan_bronze'),
      Markup.button.callback('🥈 نقره‌ای', 'plan_silver'),
      Markup.button.callback('🥇 طلایی', 'plan_gold')
    ],
    [Markup.button.callback('❌ لغو', 'cancel')]
  ]);
};

const cryptoSelectionKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('₿ بیت‌کوین', 'crypto_BTC'),
      Markup.button.callback('Ξ اتریوم', 'crypto_ETH')
    ],
    [
      Markup.button.callback('₮ تتر', 'crypto_USDT'),
      Markup.button.callback('USDC', 'crypto_USDC')
    ],
    [Markup.button.callback('❌ لغو', 'cancel')]
  ]);
};

const confirmKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ تأیید', 'confirm'),
      Markup.button.callback('❌ لغو', 'cancel')
    ]
  ]);
};

const yesNoKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ بله', 'yes'),
      Markup.button.callback('❌ خیر', 'no')
    ]
  ]);
};

const approveRejectKeyboard = (paymentId) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ تأیید', `approve_${paymentId}`),
      Markup.button.callback('❌ رد', `reject_${paymentId}`)
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
