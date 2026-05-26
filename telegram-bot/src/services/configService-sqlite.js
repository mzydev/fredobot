const db = require('../config/database-sqlite');

class ConfigService {
  async addConfig(name, configLink, subLink, adminId) {
    try {
      const stmt = db.prepare(`
        INSERT INTO configs (config_name, config_link, sub_link, created_by)
        VALUES (?, ?, ?, ?)
      `);

      const result = stmt.run(name, configLink, subLink || null, adminId);

      return {
        id: result.lastInsertRowid,
        config_name: name,
        config_link: configLink,
        sub_link: subLink,
        created_by: adminId
      };
    } catch (error) {
      console.error('[v0] Error in addConfig:', error.message);
      throw error;
    }
  }

  async getConfigs() {
    try {
      const stmt = db.prepare('SELECT * FROM configs ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      console.error('[v0] Error in getConfigs:', error.message);
      throw error;
    }
  }

  async getConfigById(configId) {
    try {
      const stmt = db.prepare('SELECT * FROM configs WHERE id = ?');
      const config = stmt.get(configId);

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    } catch (error) {
      console.error('[v0] Error in getConfigById:', error.message);
      throw error;
    }
  }

  async deleteConfig(configId) {
    try {
      const stmt = db.prepare('DELETE FROM configs WHERE id = ?');
      const result = stmt.run(configId);

      if (result.changes === 0) {
        throw new Error('Config not found');
      }

      return { success: true };
    } catch (error) {
      console.error('[v0] Error in deleteConfig:', error.message);
      throw error;
    }
  }

  async getConfigCount() {
    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM configs');
      const result = stmt.get();
      return result.count;
    } catch (error) {
      console.error('[v0] Error in getConfigCount:', error.message);
      throw error;
    }
  }
}

module.exports = new ConfigService();
