const db = require('../config/database-sqlite');

class PaymentService {
  async requestPayment(userId, amount, currency) {
    try {
      const stmt = db.prepare(`
        INSERT INTO payments (user_id, amount, currency, status)
        VALUES (?, ?, ?, 'pending')
      `);

      const result = stmt.run(userId, amount, currency);

      return {
        id: result.lastInsertRowid,
        user_id: userId,
        amount: amount,
        currency: currency,
        status: 'pending',
        requested_at: new Date()
      };
    } catch (error) {
      console.error('[v0] Error in requestPayment:', error.message);
      throw error;
    }
  }

  async submitTransaction(paymentId, txId) {
    try {
      const stmt = db.prepare(`
        UPDATE payments 
        SET tx_id = ? 
        WHERE id = ? AND status = 'pending'
      `);

      const result = stmt.run(txId, paymentId);

      if (result.changes === 0) {
        throw new Error('Payment not found or already processed');
      }

      // Get updated payment
      const getStmt = db.prepare('SELECT * FROM payments WHERE id = ?');
      return getStmt.get(paymentId);
    } catch (error) {
      console.error('[v0] Error in submitTransaction:', error.message);
      throw error;
    }
  }

  async approvePayment(paymentId, adminId) {
    try {
      const stmt = db.prepare(`
        UPDATE payments 
        SET status = 'approved', approved_by = ?, approved_at = datetime('now')
        WHERE id = ? AND status = 'pending'
      `);

      const result = stmt.run(adminId, paymentId);

      if (result.changes === 0) {
        throw new Error('Payment not found or already processed');
      }

      // Get payment details
      const getStmt = db.prepare('SELECT * FROM payments WHERE id = ?');
      const payment = getStmt.get(paymentId);

      // Add balance to user
      const addBalanceStmt = db.prepare(`
        UPDATE users 
        SET balance = balance + ?
        WHERE id = ?
      `);
      addBalanceStmt.run(payment.amount, payment.user_id);

      return payment;
    } catch (error) {
      console.error('[v0] Error in approvePayment:', error.message);
      throw error;
    }
  }

  async rejectPayment(paymentId, adminId) {
    try {
      const stmt = db.prepare(`
        UPDATE payments 
        SET status = 'rejected', approved_by = ?, approved_at = datetime('now')
        WHERE id = ? AND status = 'pending'
      `);

      const result = stmt.run(adminId, paymentId);

      if (result.changes === 0) {
        throw new Error('Payment not found or already processed');
      }

      // Get payment details
      const getStmt = db.prepare('SELECT * FROM payments WHERE id = ?');
      return getStmt.get(paymentId);
    } catch (error) {
      console.error('[v0] Error in rejectPayment:', error.message);
      throw error;
    }
  }

  async getPendingPayments() {
    try {
      const stmt = db.prepare(`
        SELECT p.*, u.username, u.first_name
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE p.status = 'pending'
        ORDER BY p.requested_at ASC
      `);

      return stmt.all();
    } catch (error) {
      console.error('[v0] Error in getPendingPayments:', error.message);
      throw error;
    }
  }

  async getPaymentById(paymentId) {
    try {
      const stmt = db.prepare(`
        SELECT p.*, u.username, u.first_name
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `);

      const payment = stmt.get(paymentId);

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      console.error('[v0] Error in getPaymentById:', error.message);
      throw error;
    }
  }

  async getTotalApprovedPayments() {
    try {
      const stmt = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payments
        WHERE status = 'approved'
      `);

      const result = stmt.get();
      return result.total;
    } catch (error) {
      console.error('[v0] Error in getTotalApprovedPayments:', error.message);
      throw error;
    }
  }

  async getUserPaymentHistory(userId) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM payments
        WHERE user_id = ?
        ORDER BY requested_at DESC
      `);

      return stmt.all(userId);
    } catch (error) {
      console.error('[v0] Error in getUserPaymentHistory:', error.message);
      throw error;
    }
  }
}

module.exports = new PaymentService();
