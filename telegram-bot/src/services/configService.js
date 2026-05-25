const { pool } = require('../config/database');

class ConfigService {
  async createConfig(name, configLink, subLink, description) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO configs (name, config_link, sub_link, description) VALUES (?, ?, ?, ?)',
        [name, configLink, subLink, description || null]
      );
      await connection.release();
      return { id: result.insertId };
    } catch (error) {
      console.error('[v0] Error in createConfig:', error);
      throw error;
    }
  }

  async getConfig(configId) {
    try {
      const connection = await pool.getConnection();
      const [configs] = await connection.query(
        'SELECT * FROM configs WHERE id = ?',
        [configId]
      );
      await connection.release();
      return configs.length > 0 ? configs[0] : null;
    } catch (error) {
      console.error('[v0] Error in getConfig:', error);
      throw error;
    }
  }

  async getAllConfigs(activeOnly = true) {
    try {
      const connection = await pool.getConnection();
      let query = 'SELECT * FROM configs';
      const params = [];
      
      if (activeOnly) {
        query += ' WHERE is_active = TRUE';
      }
      
      query += ' ORDER BY created_at DESC';
      const [configs] = await connection.query(query, params);
      await connection.release();
      return configs;
    } catch (error) {
      console.error('[v0] Error in getAllConfigs:', error);
      throw error;
    }
  }

  async updateConfig(configId, updates) {
    try {
      const connection = await pool.getConnection();
      const { name, configLink, subLink, description, is_active } = updates;
      
      const [result] = await connection.query(
        `UPDATE configs SET 
          name = COALESCE(?, name),
          config_link = COALESCE(?, config_link),
          sub_link = COALESCE(?, sub_link),
          description = COALESCE(?, description),
          is_active = COALESCE(?, is_active)
        WHERE id = ?`,
        [name, configLink, subLink, description, is_active, configId]
      );
      
      await connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[v0] Error in updateConfig:', error);
      throw error;
    }
  }

  async deleteConfig(configId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE configs SET is_active = FALSE WHERE id = ?',
        [configId]
      );
      await connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[v0] Error in deleteConfig:', error);
      throw error;
    }
  }

  async getTotalConfigs() {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query('SELECT COUNT(*) as count FROM configs WHERE is_active = TRUE');
      await connection.release();
      return result[0].count;
    } catch (error) {
      console.error('[v0] Error in getTotalConfigs:', error);
      throw error;
    }
  }
}

module.exports = new ConfigService();
