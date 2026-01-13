const bcrypt = require('bcryptjs');
const db = require('../db');

async function createUser() {
    try {
        const email = 'fahed@hrm.sa';
        const password = '123456'; // You can change this after logging in

        // Check if user already exists
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            console.log('User already exists!');
            process.exit(0);
        }

        // Get or create a company
        let companyId;
        const companies = await db.query('SELECT id FROM companies LIMIT 1');
        if (companies.rows.length > 0) {
            companyId = companies.rows[0].id;
        } else {
            const newCompany = await db.query(
                'INSERT INTO companies(name) VALUES($1) RETURNING id',
                ['HRM Company']
            );
            companyId = newCompany.rows[0].id;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user with correct column name (password_hash)
        await db.query(
            'INSERT INTO users(email, password_hash, role, company_id, full_name) VALUES($1, $2, $3, $4, $5)',
            [email, hashedPassword, 'Admin', companyId, 'Fahed Admin']
        );

        console.log('User created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role: Admin');
        console.log('Company ID:', companyId);

        process.exit(0);
    } catch (error) {
        console.error('Error creating user:', error.message);
        process.exit(1);
    }
}

createUser();
