const db = require('../db');

async function initDb() {
    const client = await db.pool.connect();
    try {
        console.log('Starting database initialization...');

        await client.query('BEGIN');

        // 1. Create companies table
        console.log('Creating companies table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Create users table with Foreign Key to companies
        console.log('Creating users table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'Employee',
        job_title VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 3. Create Index on users.company_id
        console.log('Creating index on users(company_id)...');
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
    `);

        await client.query('COMMIT');
        console.log('Database initialization completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        client.release();
        await db.pool.end();
    }
}

initDb();
