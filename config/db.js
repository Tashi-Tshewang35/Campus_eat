const pgp = require('pg-promise')();
require('dotenv').config();

const connection = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
} : {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'campus_eats_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS, 
};

// Render's external PostgreSQL endpoint requires TLS; local tests stay unencrypted.
const sslMode = process.env.PGSSLMODE;
if (sslMode === 'require' || sslMode === 'verify-full' ||
    (!sslMode && (process.env.RENDER === 'true' || process.env.NODE_ENV === 'production'))) {
  connection.ssl = { rejectUnauthorized: true };
}

const db = pgp(connection);

module.exports = db;
