const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

async function setupDatabase() {
  try {
    console.log('[v0] Starting SQLite database setup...');

    // Create database connection
    const dbPath = path.join(__dirname, '../../vpn_bot.db');
    const db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    console.log('[v0] Database connection established');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema-sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements and execute
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        db.exec(statement);
      } catch (error) {
        console.error('[v0] Error executing statement:', error.message);
      }
    }

    console.log('[v0] ✓ Database tables created successfully');

    // Add default admin user if not exists
    const adminId = process.env.ADMIN_IDS ? parseInt(process.env.ADMIN_IDS.split(',')[0]) : 123456789;
    
    try {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO admin_users (telegram_id, username, first_name, is_active)
        VALUES (?, ?, ?, 1)
      `);
      stmt.run(adminId, 'admin', 'Admin');
      console.log('[v0] ✓ Admin user created/verified');
    } catch (error) {
      console.error('[v0] Error creating admin user:', error.message);
    }

    // Close connection
    db.close();

    console.log('[v0] Database setup completed successfully!');
    console.log(`[v0] Database file: ${dbPath}`);
    process.exit(0);

  } catch (error) {
    console.error('[v0] Database setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
