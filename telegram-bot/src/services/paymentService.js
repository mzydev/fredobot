const { pool } = require('../config/database');

class PaymentService {
  async createPayment(userId, amount, cryptoType) {
    try {
      const connection = await pool.getConnection();
      
      const [result] = await connection.query(
        `INSERT INTO payments (user_id, amount, crypto_type, status) 
         VALUES (?, ?, ?, 'pending')`,
        [userId, amount, cryptoType]
      );

      await connection.release();
      return { id: result.insertId };
    } catch (error) {
      console.error('[v0] Error in createPayment:', error);
      throw error;
    }
  }

  async getPayment(paymentId) {
    try {
      const connection = await pool.getConnection();
      const [payments] = await connection.query(
        'SELECT * FROM payments WHERE id = ?',
        [paymentId]
      );
      await connection.release();
      return payments.length > 0 ? payments[0] : null;
    } catch (error) {
      console.error('[v0] Error in getPayment:', error);
      throw error;
    }
  }

  async getPendingPayments() {
    try {
      const connection = await pool.getConnection();
      const [payments] = await connection.query(
        `SELECT p.*, u.telegram_id, u.username, u.first_name 
         FROM payments p
         JOIN users u ON p.user_id = u.id
         WHERE p.status = 'pending'
         ORDER BY p.created_at ASC`
      );
      await connection.release();
      return payments;
    } catch (error) {
      console.error('[v0] Error in getPendingPayments:', error);
      throw error;
    }
  }

  async getUserPayments(userId) {
    try {
      const connection = await pool.getConnection();
      const [payments] = await connection.query(
        'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      await connection.release();
      return payments;
    } catch (error) {
      console.error('[v0] Error in getUserPayments:', error);
      throw error;
    }
  }

  async updatePaymentTxid(paymentId, txid) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE payments SET txid = ? WHERE id = ?',
        [txid, paymentId]
      );
      await connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[v0] Error in updatePaymentTxid:', error);
      throw error;
    }
  }

  async approvePayment(paymentId, approvedBy) {
    try {
      const connection = await pool.getConnection();
      
      const [result] = await connection.query(
        `UPDATE payments 
         SET status = 'approved', approved_at = NOW(), approved_by = ?
         WHERE id = ?`,
        [approvedBy, paymentId]
      );

      if (result.affectedRows > 0) {
        // Get payment details and update user balance
        const payment = await this.getPayment(paymentId);
        if (payment) {
          const userService = require('./userService');
          await userService.updateBalance(payment.telegram_id || payment.user_id, payment.amount);
        }
      }

      await connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[v0] Error in approvePayment:', error);
      throw error;
    }
  }

  async rejectPayment(paymentId, reason) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        `UPDATE payments 
         SET status = 'rejected', rejection_reason = ?
         WHERE id = ?`,
        [reason, paymentId]
      );
      await connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[v0] Error in rejectPayment:', error);
      throw error;
    }
  }

  async getTotalApprovedAmount() {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'SELECT SUM(amount) as total FROM payments WHERE status = "approved"'
      );
      await connection.release();
      return result[0].total || 0;
    } catch (error) {
      console.error('[v0] Error in getTotalApprovedAmount:', error);
      throw error;
    }
  }

  async getPendingPaymentCount() {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'SELECT COUNT(*) as count FROM payments WHERE status = "pending"'
      );
      await connection.release();
      return result[0].count;
    } catch (error) {
      console.error('[v0] Error in getPendingPaymentCount:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
