const db = require('../config/database-sqlite');

class PurchaseService {
  async createPurchase(userId, configId, planType, price, expiryDate) {
    try {
      const stmt = db.prepare(`
        INSERT INTO purchases (user_id, config_id, plan_type, price, expiry_date, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
      `);

      const result = stmt.run(userId, configId, planType, price, expiryDate);

      return {
        id: result.lastInsertRowid,
        user_id: userId,
        config_id: configId,
        plan_type: planType,
        price: price,
        expiry_date: expiryDate
      };
    } catch (error) {
      console.error('[v0] Error in createPurchase:', error.message);
      throw error;
    }
  }

  async getUserPurchases(userId) {
    try {
      const stmt = db.prepare(`
        SELECT 
          p.*,
          c.config_name,
          c.config_link,
          c.sub_link
        FROM purchases p
        JOIN configs c ON p.config_id = c.id
        WHERE p.user_id = ? AND p.is_active = 1
        ORDER BY p.purchased_at DESC
      `);

      return stmt.all(userId);
    } catch (error) {
      console.error('[v0] Error in getUserPurchases:', error.message);
      throw error;
    }
  }

  async getPurchaseById(purchaseId) {
    try {
      const stmt = db.prepare(`
        SELECT 
          p.*,
          c.config_name,
          c.config_link,
          c.sub_link
        FROM purchases p
        JOIN configs c ON p.config_id = c.id
        WHERE p.id = ?
      `);

      const purchase = stmt.get(purchaseId);

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      return purchase;
    } catch (error) {
      console.error('[v0] Error in getPurchaseById:', error.message);
      throw error;
    }
  }

  async deactivatePurchase(purchaseId) {
    try {
      const stmt = db.prepare('UPDATE purchases SET is_active = 0 WHERE id = ?');
      const result = stmt.run(purchaseId);

      if (result.changes === 0) {
        throw new Error('Purchase not found');
      }

      return { success: true };
    } catch (error) {
      console.error('[v0] Error in deactivatePurchase:', error.message);
      throw error;
    }
  }

  async getTotalRevenue() {
    try {
      const stmt = db.prepare(`
        SELECT COALESCE(SUM(price), 0) as total FROM purchases
      `);

      const result = stmt.get();
      return result.total;
    } catch (error) {
      console.error('[v0] Error in getTotalRevenue:', error.message);
      throw error;
    }
  }

  async getActivePurchasesCount() {
    try {
      const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM purchases WHERE is_active = 1
      `);

      const result = stmt.get();
      return result.count;
    } catch (error) {
      console.error('[v0] Error in getActivePurchasesCount:', error.message);
      throw error;
    }
  }

  async checkExpiredPurchases() {
    try {
      const stmt = db.prepare(`
        UPDATE purchases 
        SET is_active = 0 
        WHERE is_active = 1 AND expiry_date < datetime('now')
      `);

      return stmt.run();
    } catch (error) {
      console.error('[v0] Error in checkExpiredPurchases:', error.message);
      throw error;
    }
  }
}

module.exports = new PurchaseService();
