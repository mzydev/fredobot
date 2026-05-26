require('dotenv').config();

// In-memory database for demonstration/testing
const inMemoryDB = {
  users: [],
  configs: [],
  purchases: [],
  payments: []
};

let nextUserId = 1;
let nextConfigId = 1;
let nextPurchaseId = 1;
let nextPaymentId = 1;

// Wrapper for pool compatibility with MySQL-like interface
const pool = {
  async getConnection() {
    return {
      query: async (sql, params = []) => {
        try {
          const result = await executeQuery(sql, params);
          return [result];
        } catch (error) {
          console.error('[v0] Query error:', error, 'SQL:', sql);
          throw error;
        }
      },
      release: async () => {
        // No-op for in-memory DB
      }
    };
  },
  end: async () => {
    console.log('[v0] Database connection closed');
  }
};

async function executeQuery(sql, params = []) {
  const upperSql = sql.toUpperCase();
  
  // INSERT INTO users
  if (upperSql.includes('INSERT INTO users')) {
    const user = {
      id: nextUserId++,
      telegram_id: params[0],
      username: params[1],
      first_name: params[2],
      balance: params[3] || 0,
      created_at: new Date().toISOString()
    };
    inMemoryDB.users.push(user);
    return [{ insertId: user.id, affectedRows: 1 }];
  }
  
  // SELECT * FROM users WHERE telegram_id = ?
  if (upperSql.includes('SELECT') && upperSql.includes('FROM users') && upperSql.includes('telegram_id')) {
    const telegramId = params[0];
    const results = inMemoryDB.users.filter(u => u.telegram_id === telegramId);
    return results;
  }
  
  // SELECT * FROM users WHERE id = ?
  if (upperSql.includes('SELECT') && upperSql.includes('FROM users') && upperSql.includes('id')) {
    const userId = params[0];
    const results = inMemoryDB.users.filter(u => u.id === userId);
    return results;
  }
  
  // SELECT * FROM users
  if (upperSql.includes('SELECT') && upperSql.includes('FROM users')) {
    return inMemoryDB.users;
  }
  
  // UPDATE users SET balance
  if (upperSql.includes('UPDATE users') && upperSql.includes('balance')) {
    const user = inMemoryDB.users.find(u => u.telegram_id === params[1]);
    if (user) {
      user.balance = (parseFloat(user.balance) || 0) + parseFloat(params[0]);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }
  
  // INSERT INTO configs
  if (upperSql.includes('INSERT INTO configs')) {
    const config = {
      id: nextConfigId++,
      name: params[0],
      config_link: params[1],
      sub_link: params[2],
      description: params[3],
      is_active: 1,
      created_at: new Date().toISOString()
    };
    inMemoryDB.configs.push(config);
    return [{ insertId: config.id, affectedRows: 1 }];
  }
  
  // SELECT * FROM configs WHERE is_active = ?
  if (upperSql.includes('SELECT') && upperSql.includes('FROM configs')) {
    return inMemoryDB.configs.filter(c => !params[0] || c.is_active === params[0]);
  }
  
  // COUNT queries
  if (upperSql.includes('COUNT')) {
    if (upperSql.includes('users')) {
      return [{ count: inMemoryDB.users.length }];
    }
    if (upperSql.includes('configs')) {
      return [{ count: inMemoryDB.configs.length }];
    }
    if (upperSql.includes('purchases')) {
      return [{ count: inMemoryDB.purchases.length }];
    }
  }
  
  // Default: return empty array
  return [];
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 as test');
    await connection.release();
    console.log('[v0] Database connection successful');
  } catch (error) {
    console.error('[v0] Database connection failed:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  inMemoryDB
};
