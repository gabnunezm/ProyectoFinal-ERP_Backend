const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

if (!DB_USER) {
  console.warn('Warning: DB_USER not set. Defaulting to "root".');
}
if (DB_PASS === undefined || DB_PASS === '') {
  console.warn('Warning: DB_PASS is empty or not set. MySQL connection will attempt without a password. Create a .env file or set DB_PASS to your DB password.');
}

const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  port: DB_PORT ? Number(DB_PORT) : 3306,
  user: DB_USER || 'root',
  password: DB_PASS || '12345',
  database: DB_NAME || 'erp_academico',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
