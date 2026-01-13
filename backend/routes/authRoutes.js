const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register a new company and its admin user
router.post('/register-company', async (req, res) => {
    const { companyName, adminFirstName, adminLastName, adminEmail, adminPassword } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert the company
        const companyRes = await client.query(
            'INSERT INTO companies(name) VALUES($1) RETURNING id',
            [companyName]
        );
        const companyId = companyRes.rows[0].id;

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // 3. Insert the admin user
        await client.query(
            'INSERT INTO users(first_name, last_name, email, password, company_id, role) VALUES($1, $2, $3, $4, $5, $6)',
            [adminFirstName, adminLastName, adminEmail, hashedPassword, companyId, 'Admin']
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Company and admin user registered successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    } finally {
        client.release();
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // **THE FIX IS HERE**
        // We must include company_id in the JWT payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            company_id: user.company_id // <-- This was the missing piece
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
