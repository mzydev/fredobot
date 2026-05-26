const db = require('../config/database-sqlite');

class UserService {
  async getOrCreateUser(telegramId, userData) {
    try {
      // Check if user exists
      const stmt = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
      const existing = stmt.get(telegramId);

      if (existing) {
        return existing;
      }

      // Create new user
      const insertStmt = db.prepare(`
        INSERT INTO users (telegram_id, username, first_name, balance)
        VALUES (?, ?, ?, 0)
      `);
      
      const result = insertStmt.run(
        telegramId,
        userData.username || null,
        userData.first_name || null
      );

      return {
        id: result.lastInsertRowid,
        telegram_id: telegramId,
        username: userData.username || null,
        first_name: userData.first_name || null,
        balance: 0,
        created_at: new Date()
      };
    } catch (error) {
      console.error('[v0] Error in getOrCreateUser:', error.message);
      throw error;
    }
  }

  async getUser(telegramId) {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
      const user = stmt.get(telegramId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      console.error('[v0] Error in getUser:', error.message);
      throw error;
    }
  }

  async addBalance(userId, amount) {
    try {
      const stmt = db.prepare(`
        UPDATE users SET balance = balance + ? WHERE id = ?
      `);
      
      const result = stmt.run(amount, userId);
      
      if (result.changes === 0) {
        throw new Error('User not found');
      }

      // Get updated user
      const getStmt = db.prepare('SELECT * FROM users WHERE id = ?');
      return getStmt.get(userId);
    } catch (error) {
      console.error('[v0] Error in addBalance:', error.message);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total_users,
          COALESCE(SUM(balance), 0) as total_balance
        FROM users
      `);
      
      return stmt.get();
    } catch (error) {
      console.error('[v0] Error in getUserStats:', error.message);
      throw error;
    }
  }

  async getTopUsers(limit = 10) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM users
        ORDER BY balance DESC
        LIMIT ?
      `);
      
      return stmt.all(limit);
    } catch (error) {
      console.error('[v0] Error in getTopUsers:', error.message);
      throw error;
    }
  }
}

module.exports = new UserService();
