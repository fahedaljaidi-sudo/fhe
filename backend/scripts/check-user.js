const db = require('../db');

async function checkUser() {
    try {
        const email = 'fahed@hrm.sa';
        console.log(`Checking for user with email: ${email}`);

        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('User NOT FOUND in database');
            console.log('\nListing all users:');
            const allUsers = await db.query('SELECT id, email, role FROM users LIMIT 10');
            console.table(allUsers.rows);
        } else {
            console.log('User exists:');
            const user = result.rows[0];
            console.log('ID:', user.id);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Company ID:', user.company_id);
            console.log('Has password:', !!user.password);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUser();
