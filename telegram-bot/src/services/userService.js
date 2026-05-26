const { pool } = require('../config/database');

class UserService {
  async getOrCreateUser(telegramId, userData) {
    try {
      const connection = await pool.getConnection();
      
      // Check if user exists
      const [existing] = await connection.query(
        'SELECT id, telegram_id, username, first_name, balance, created_at FROM users WHERE telegram_id = ?',
        [telegramId]
      );

      if (existing.length > 0) {
        const user = existing[0];
        // Convert balance to number (MySQL returns DECIMAL as object)
        if (user.balance !== null && user.balance !== undefined) {
          user.balance = parseFloat(user.balance);
        }
        await connection.release();
        return user;
      }

      // Create new user
      const [result] = await connection.query(
        'INSERT INTO users (telegram_id, username, first_name, balance) VALUES (?, ?, ?, ?)',
        [telegramId, userData.username || null, userData.first_name || null, 0]
      );

      await connection.release();
      return { 
        id: result.insertId, 
        telegram_id: telegramId,
        username: userData.username || null,
        first_name: userData.first_name || null,
        balance: 0,
        created_at: new Date()
      };
    } catch (error) {
      console.error('[v0] Error in getOrCreateUser:', error);
      throw error;
    }
  }

  async getUser(telegramId) {
    try {
      const connection = await pool.getConnection();
      const [users] = await connection.query(
        'SELECT * FROM users WHERE telegram_id = ?',
        [telegramId]
      );
      await connection.release();
      if (users.length > 0) {
        const user = users[0];
        // Convert balance to number (MySQL returns DECIMAL as object)
        if (user.balance !== null && user.balance !== undefined) {
          user.balance = parseFloat(user.balance);
        }
        return user;
      }
      return null;
    } catch (error) {
      console.error('[v0] Error in getUser:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const connection = await pool.getConnection();
      const [users] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      await connection.release();
      if (users.length > 0) {
        const user = users[0];
        // Convert balance to number (MySQL returns DECIMAL as object)
        if (user.balance !== null && user.balance !== undefined) {
          user.balance = parseFloat(user.balance);
        }
        return user;
      }
      return null;
    } catch (error) {
      console.error('[v0] Error in getUserById:', error);
      throw error;
    }
  }

  async updateBalance(telegramId, amount) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE users SET balance = balance + ? WHERE telegram_id = ?',
        [amount, telegramId]
      );
      await connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[v0] Error in updateBalance:', error);
      throw error;
    }
  }

  async deductBalance(telegramId, amount) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE users SET balance = balance - ? WHERE telegram_id = ? AND balance >= ?',
        [amount, telegramId, amount]
      );
      await connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[v0] Error in deductBalance:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const connection = await pool.getConnection();
      const [users] = await connection.query('SELECT * FROM users');
      await connection.release();
      // Convert balance to number for all users
      return users.map(user => {
        if (user.balance !== null && user.balance !== undefined) {
          user.balance = parseFloat(user.balance);
        }
        return user;
      });
    } catch (error) {
      console.error('[v0] Error in getAllUsers:', error);
      throw error;
    }
  }

  async getTotalUsers() {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query('SELECT COUNT(*) as count FROM users');
      await connection.release();
      return result[0].count;
    } catch (error) {
      console.error('[v0] Error in getTotalUsers:', error);
      throw error;
    }
  }

  async getActiveUsers() {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'SELECT COUNT(DISTINCT user_id) as count FROM purchases WHERE is_active = TRUE'
      );
      await connection.release();
      return result[0].count;
    } catch (error) {
      console.error('[v0] Error in getActiveUsers:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
