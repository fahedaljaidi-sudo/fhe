const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using environment variables or defaults
// By default, pg uses: PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
