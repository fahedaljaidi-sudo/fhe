const db = require('../db');

async function migrateAttendance() {
    console.log('Starting attendance_records table migration...');

    try {
        // Create the attendance_records table
        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance_records (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                check_in TIMESTAMP WITH TIME ZONE NOT NULL,
                check_out TIMESTAMP WITH TIME ZONE,
                status VARCHAR(50) DEFAULT 'Checked-in',
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ attendance_records table created successfully!');

        // Create indexes for faster lookups
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
        `);
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_attendance_company_id ON attendance_records(company_id);
        `);
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance_records(check_in);
        `);

        console.log('✅ Indexes created successfully!');
        console.log('Migration completed!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrateAttendance();
