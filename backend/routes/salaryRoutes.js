const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authenticateToken);

// GET /api/salaries - Admin: fetch all employee salaries
router.get('/', async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    try {
        const result = await db.query(`
            SELECT 
                s.id,
                s.user_id,
                s.base_salary,
                s.housing_allowance,
                s.transport_allowance,
                s.other_allowances,
                s.deductions,
                s.effective_date,
                s.notes,
                u.full_name,
                u.email,
                u.employee_id,
                u.job_title,
                d.name as department_name,
                (s.base_salary + s.housing_allowance + s.transport_allowance + s.other_allowances - s.deductions) as net_salary
            FROM salaries s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE s.company_id = $1
            ORDER BY u.full_name
        `, [req.user.companyId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching salaries:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/salaries/me - Employee: fetch own salary
router.get('/me', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                s.id,
                s.base_salary,
                s.housing_allowance,
                s.transport_allowance,
                s.other_allowances,
                s.deductions,
                s.effective_date,
                s.notes,
                u.full_name,
                u.email,
                u.employee_id,
                u.job_title,
                d.name as department_name,
                (s.base_salary + s.housing_allowance + s.transport_allowance + s.other_allowances - s.deductions) as net_salary
            FROM salaries s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE s.user_id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Salary record not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching own salary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/salaries/employees - Admin: get all employees for salary assignment
router.get('/employees', async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    try {
        const result = await db.query(`
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.employee_id,
                u.job_title,
                d.name as department_name,
                CASE WHEN s.id IS NOT NULL THEN true ELSE false END as has_salary
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN salaries s ON u.id = s.user_id
            WHERE u.company_id = $1
            ORDER BY u.full_name
        `, [req.user.companyId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/salaries - Admin: upsert salary for employee
router.post('/', async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const {
        user_id,
        base_salary,
        housing_allowance = 0,
        transport_allowance = 0,
        other_allowances = 0,
        deductions = 0,
        effective_date,
        notes
    } = req.body;

    if (!user_id || base_salary === undefined) {
        return res.status(400).json({ error: 'user_id and base_salary are required' });
    }

    try {
        // Verify the employee belongs to the same company
        const userCheck = await db.query(
            'SELECT id FROM users WHERE id = $1 AND company_id = $2',
            [user_id, req.user.companyId]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found in your company' });
        }

        // Upsert: Insert or Update on conflict
        const result = await db.query(`
            INSERT INTO salaries (
                user_id, company_id, base_salary, housing_allowance, 
                transport_allowance, other_allowances, deductions, 
                effective_date, notes, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                base_salary = EXCLUDED.base_salary,
                housing_allowance = EXCLUDED.housing_allowance,
                transport_allowance = EXCLUDED.transport_allowance,
                other_allowances = EXCLUDED.other_allowances,
                deductions = EXCLUDED.deductions,
                effective_date = EXCLUDED.effective_date,
                notes = EXCLUDED.notes,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [
            user_id,
            req.user.companyId,
            base_salary,
            housing_allowance,
            transport_allowance,
            other_allowances,
            deductions,
            effective_date || new Date(),
            notes
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error upserting salary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
