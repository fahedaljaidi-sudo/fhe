const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        console.log('Starting migration: Employees & App Structure...');
        await client.query('BEGIN');

        // 1. Create departments table
        console.log('Creating departments table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Add department_id and manager_id to users
        console.log('Altering users table...');
        // Add department_id
        await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='department_id') THEN
          ALTER TABLE users ADD COLUMN department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

        // Add manager_id
        await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='manager_id') THEN
          ALTER TABLE users ADD COLUMN manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration error:', error);
        process.exit(1);
    } finally {
        client.release();
        await db.pool.end();
    }
}

migrate();
