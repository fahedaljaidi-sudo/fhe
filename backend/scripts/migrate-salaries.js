const db = require('../db');

async function migrateSalaries() {
    console.log('Starting salaries table migration...');

    try {
        // Create the salaries table
        await db.query(`
            CREATE TABLE IF NOT EXISTS salaries (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                base_salary DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                housing_allowance DECIMAL(10, 2) DEFAULT 0.00,
                transport_allowance DECIMAL(10, 2) DEFAULT 0.00,
                other_allowances DECIMAL(10, 2) DEFAULT 0.00,
                deductions DECIMAL(10, 2) DEFAULT 0.00,
                effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        console.log('✅ Salaries table created successfully!');

        // Create index for faster lookups
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_salaries_user_id ON salaries(user_id);
        `);
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_salaries_company_id ON salaries(company_id);
        `);

        console.log('✅ Indexes created successfully!');
        console.log('Migration completed!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrateSalaries();
