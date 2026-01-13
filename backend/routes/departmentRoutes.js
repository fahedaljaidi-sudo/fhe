const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming db.js is in the parent directory
const authenticateToken = require('../middleware/authMiddleware');

// Middleware to check for Admin role (we'll assume a simple check for now)
const isAdmin = (req, res, next) => {
    // In a real app, you'd check req.user.role or similar
    // For now, we'll just let authenticated users pass
    next();
};

// GET all departments for the user's company
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.user;
        const result = await db.query('SELECT * FROM departments WHERE company_id = $1 ORDER BY name', [companyId]);
        res.json(result.rows);
    } catch (error) {
        console.error('!!! ERROR fetching departments:', error);
        res.status(500).json({ message: 'Error fetching departments' });
    }
});

// POST a new department
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    console.log('--- TRAP 1: Reached POST /api/departments route ---'); // الفخ الأول
    const { name } = req.body;
    const { companyId } = req.user;

    console.log(`--- TRAP 2: Data received: name=${name}, companyId=${companyId} ---`); // الفخ الثاني

    if (!name) {
        console.log('--- ERROR: Department name is missing ---');
        return res.status(400).json({ message: 'Department name is required' });
    }

    try {
        const queryText = 'INSERT INTO departments(name, company_id) VALUES($1, $2) RETURNING *';
        const values = [name, companyId];

        console.log('--- TRAP 3: Executing SQL query ---'); // الفخ الثالث
        const result = await db.query(queryText, values);
        console.log('--- TRAP 4: SQL query successful ---'); // الفخ الرابع

        res.status(201).json(result.rows[0]);

    } catch (error) {
        // This is the most important trap
        console.error('!!!!!! CRITICAL ERROR in POST /api/departments !!!!!!', error);
        res.status(500).json({ message: 'Failed to create department due to a server error.' });
    }
});

// PUT (Update) a department
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    // ... (code for updating)
    res.send('Update department route');
});

// DELETE a department
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    // ... (code for deleting)
    res.send('Delete department route');
});


module.exports = router;
