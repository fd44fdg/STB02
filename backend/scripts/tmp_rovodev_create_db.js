#!/usr/bin/env node
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' });

(async () => {
  try {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'shuati_db';

    const conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database ensured: ${dbName}`);
    await conn.end();
    process.exit(0);
  } catch (e) {
    console.error('❌ Failed to ensure database:', e.message);
    process.exit(1);
  }
})();
