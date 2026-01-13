const db = require('../db');

async function verifySchema() {
    const client = await db.pool.connect();
    try {
        console.log('Verifying DB Schema v2...');

        // 1. Verify departments table exists
        const tableRes = await client.query("SELECT to_regclass('public.departments')");
        if (tableRes.rows[0].to_regclass) {
            console.log('SUCCESS: departments table exists.');
        } else {
            console.error('FAILURE: departments table MISSING.');
        }

        // 2. Verify users columns
        const columnsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name IN ('department_id', 'manager_id')
    `);

        const foundColumns = columnsRes.rows.map(r => r.column_name);
        if (foundColumns.includes('department_id')) {
            console.log('SUCCESS: users.department_id column exists.');
        } else {
            console.error('FAILURE: users.department_id column MISSING.');
        }

        if (foundColumns.includes('manager_id')) {
            console.log('SUCCESS: users.manager_id column exists.');
        } else {
            console.error('FAILURE: users.manager_id column MISSING.');
        }

    } catch (error) {
        console.error('Verification error:', error);
        process.exit(1);
    } finally {
        client.release();
        await db.pool.end();
    }
}

verifySchema();
