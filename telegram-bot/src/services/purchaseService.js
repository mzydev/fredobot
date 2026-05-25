const { pool } = require('../config/database');

class PurchaseService {
  async createPurchase(userId, configId, planType) {
    try {
      const connection = await pool.getConnection();
      
      // Calculate expiry date based on plan type
      const planDays = {
        bronze: parseInt(process.env.PLAN_BRONZE_DAYS) || 30,
        silver: parseInt(process.env.PLAN_SILVER_DAYS) || 90,
        gold: parseInt(process.env.PLAN_GOLD_DAYS) || 180
      };

      const daysToAdd = planDays[planType] || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);

      const [result] = await connection.query(
        `INSERT INTO purchases (user_id, config_id, plan_type, expiry_date) 
         VALUES (?, ?, ?, ?)`,
        [userId, configId, planType, expiryDate]
      );

      await connection.release();
      return { id: result.insertId, expiryDate };
    } catch (error) {
      console.error('[v0] Error in createPurchase:', error);
      throw error;
    }
  }

  async getUserPurchases(userId, activeOnly = true) {
    try {
      const connection = await pool.getConnection();
      
      let query = `
        SELECT p.*, c.name, c.config_link, c.sub_link 
        FROM purchases p
        JOIN configs c ON p.config_id = c.id
        WHERE p.user_id = ?
      `;
      const params = [userId];

      if (activeOnly) {
        query += ' AND p.is_active = TRUE AND p.expiry_date > NOW()';
      }

      query += ' ORDER BY p.purchase_date DESC';

      const [purchases] = await connection.query(query, params);
      await connection.release();
      return purchases;
    } catch (error) {
      console.error('[v0] Error in getUserPurchases:', error);
      throw error;
    }
  }

  async getPurchase(purchaseId) {
    try {
      const connection = await pool.getConnection();
      const [purchases] = await connection.query(
        `SELECT p.*, c.name, c.config_link, c.sub_link 
         FROM purchases p
         JOIN configs c ON p.config_id = c.id
         WHERE p.id = ?`,
        [purchaseId]
      );
      await connection.release();
      return purchases.length > 0 ? purchases[0] : null;
    } catch (error) {
      console.error('[v0] Error in getPurchase:', error);
      throw error;
    }
  }

  async updateDataUsage(purchaseId, dataUsed) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE purchases SET data_used = ? WHERE id = ?',
        [dataUsed, purchaseId]
      );
      await connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[v0] Error in updateDataUsage:', error);
      throw error;
    }
  }

  async getTotalRevenue() {
    try {
      const connection = await pool.getConnection();
      const planPrices = {
        bronze: parseFloat(process.env.PLAN_BRONZE_PRICE) || 4.99,
        silver: parseFloat(process.env.PLAN_SILVER_PRICE) || 12.99,
        gold: parseFloat(process.env.PLAN_GOLD_PRICE) || 24.99
      };

      const [result] = await connection.query(
        'SELECT plan_type, COUNT(*) as count FROM purchases WHERE purchase_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY plan_type'
      );

      let revenue = 0;
      result.forEach(row => {
        revenue += (planPrices[row.plan_type] || 0) * row.count;
      });

      await connection.release();
      return revenue;
    } catch (error) {
      console.error('[v0] Error in getTotalRevenue:', error);
      throw error;
    }
  }

  async getTotalPurchases() {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query('SELECT COUNT(*) as count FROM purchases');
      await connection.release();
      return result[0].count;
    } catch (error) {
      console.error('[v0] Error in getTotalPurchases:', error);
      throw error;
    }
  }

  async getActivePurchases() {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'SELECT COUNT(*) as count FROM purchases WHERE is_active = TRUE AND expiry_date > NOW()'
      );
      await connection.release();
      return result[0].count;
    } catch (error) {
      console.error('[v0] Error in getActivePurchases:', error);
      throw error;
    }
  }

  async deactivateExpiredPurchases() {
    try {
      const connection = await pool.getConnection();
      await connection.query(
        'UPDATE purchases SET is_active = FALSE WHERE expiry_date <= NOW()'
      );
      await connection.release();
    } catch (error) {
      console.error('[v0] Error in deactivateExpiredPurchases:', error);
      throw error;
    }
  }
}

module.exports = new PurchaseService();
