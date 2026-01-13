// This script now also uses the central db.js file for consistency
const db = require('../db');

async function migrate() {
    console.log('Starting DB Migration v3: Add employee_id...');
    const client = await db.pool.connect();
    try {
        const colCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='users' AND column_name='employee_id';
        `);

        if (colCheck.rowCount === 0) {
            await client.query('ALTER TABLE users ADD COLUMN employee_id VARCHAR(255)');
            console.log('Column "employee_id" added to "users" table successfully.');
        } else {
            console.log('Column "employee_id" already exists in "users" table.');
        }
    } catch (error) {
        console.error('Migration v3 error:', error);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate().finally(() => db.pool.end());
