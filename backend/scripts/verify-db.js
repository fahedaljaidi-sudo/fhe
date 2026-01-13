const db = require('../db');

async function verifyDb() {
    const client = await db.pool.connect();
    try {
        console.log('Starting database verification...');

        // 1. Insert a new company
        console.log('Inserting test company...');
        const companyRes = await client.query(`
      INSERT INTO companies (name) VALUES ($1) RETURNING *;
    `, ['Test Company ' + Date.now()]);
        const company = companyRes.rows[0];
        console.log('Created Company:', company);

        // 2. Insert a new user linked to this company
        console.log('Inserting test user...');
        const userRes = await client.query(`
      INSERT INTO users (company_id, email, password_hash, full_name, role) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `, [company.id, `user${Date.now()}@example.com`, 'hashedsecret', 'John Doe', 'Admin']);
        const user = userRes.rows[0];
        console.log('Created User:', user);

        // 3. Verify linkage
        if (user.company_id === company.id) {
            console.log('SUCCESS: User is correctly linked to company.');
        } else {
            console.error('FAILURE: User company_id mismatch.');
        }

    } catch (error) {
        console.error('Error verifying database:', error);
        process.exit(1);
    } finally {
        client.release();
        await db.pool.end();
    }
}

verifyDb();
