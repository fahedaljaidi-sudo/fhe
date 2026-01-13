// This script now uses the central db.js file, just like init-db.js
const db = require('../db');

async function migrate() {
    console.log('Starting DB Migration v2: Departments & User Hierarchy...');
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create departments table
        console.log('Creating departments table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS departments (
                id SERIAL PRIMARY KEY,
                company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                UNIQUE(company_id, name)
            );
        `);

        // 2. Add department_id and manager_id to users
        console.log('Altering users table...');
        const columns = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name='users' AND column_name IN ('department_id', 'manager_id');
        `);
        const existingColumns = columns.rows.map(r => r.column_name);

        if (!existingColumns.includes('department_id')) {
            await client.query('ALTER TABLE users ADD COLUMN department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL');
            console.log('Added department_id column.');
        }

        if (!existingColumns.includes('manager_id')) {
            await client.query('ALTER TABLE users ADD COLUMN manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
            console.log('Added manager_id column.');
        }

        await client.query('COMMIT');
        console.log('Migration v2 completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration v2 error:', error);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate().finally(() => db.pool.end());
