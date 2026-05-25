const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const isAdmin = (telegramId, adminIds) => {
  if (!adminIds) return false;
  return adminIds.includes(telegramId);
};

const parseAdminIds = (adminIdsString) => {
  if (!adminIdsString) return [];
  return adminIdsString.split(',').map(id => parseInt(id.trim()));
};

const generateTransactionId = () => {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const validateCryptoAddress = (address, cryptoType) => {
  // Basic validation - in production, use more robust validation
  if (!address || typeof address !== 'string') return false;
  
  switch(cryptoType.toUpperCase()) {
    case 'BTC':
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    case 'ETH':
    case 'USDT':
    case 'USDC':
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    default:
      return true;
  }
};

const getPlanDetails = (planType) => {
  const plans = {
    bronze: {
      name: '🥉 Bronze',
      price: process.env.PLAN_BRONZE_PRICE || 4.99,
      days: process.env.PLAN_BRONZE_DAYS || 30
    },
    silver: {
      name: '🥈 Silver',
      price: process.env.PLAN_SILVER_PRICE || 12.99,
      days: process.env.PLAN_SILVER_DAYS || 90
    },
    gold: {
      name: '🥇 Gold',
      price: process.env.PLAN_GOLD_PRICE || 24.99,
      days: process.env.PLAN_GOLD_DAYS || 180
    }
  };
  return plans[planType] || null;
};

module.exports = {
  formatCurrency,
  formatDate,
  formatDateTime,
  getDaysUntilExpiry,
  isAdmin,
  parseAdminIds,
  generateTransactionId,
  validateCryptoAddress,
  getPlanDetails
};
