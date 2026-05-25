const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  try {
    // Connect to MySQL without selecting a database first
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      multipleStatements: true
    });

    console.log('[v0] Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.MYSQL_DATABASE || 'vpn_bot_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`[v0] Database '${dbName}' created or already exists`);

    // Select the database
    await connection.changeUser({ database: dbName });
    console.log(`[v0] Selected database '${dbName}'`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('[v0] Database schema created successfully');

    console.log('\n[v0] Database setup completed successfully!');
    console.log('[v0] Next steps:');
    console.log('1. Update your .env file with database credentials');
    console.log('2. Replace admin IDs in ADMIN_IDS environment variable');
    console.log('3. Start the bot: npm start');

  } catch (error) {
    console.error('[v0] Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
