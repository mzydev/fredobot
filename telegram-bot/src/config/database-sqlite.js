const Database = require('better-sqlite3');
const path = require('path');

// Create database file in project root
const dbPath = path.join(__dirname, '../../vpn_bot.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log(`[v0] SQLite database initialized at: ${dbPath}`);

module.exports = db;
