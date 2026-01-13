const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

// Add Employee (Admin only)
router.post('/', async (req, res) => {
  if (req.user.role !== 'Admin') return res.sendStatus(403);

  const { full_name, email, password, job_title, employee_id, department_id, manager_id } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // department_id and manager_id can be null or integer
    const result = await db.query(
      `INSERT INTO users (company_id, email, password_hash, full_name, role, job_title, employee_id, department_id, manager_id) 
       VALUES ($1, $2, $3, $4, 'Employee', $5, $6, $7, $8) RETURNING id, email, full_name, role, job_title, employee_id, department_id, manager_id`,
      [req.user.companyId, email, hashedPassword, full_name, job_title, employee_id, department_id, manager_id].map(val => val === '' ? null : val)
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get Employees
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT u.id, u.full_name, u.email, u.role, u.job_title, u.employee_id,
             u.department_id, u.manager_id,
             d.name as department_name, 
             m.full_name as manager_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.company_id = $1
    `;
    const params = [req.user.companyId];

    // Optional: Filter for managers?
    // For now, return all for the company so the UI is populated.

    query += ' ORDER BY u.full_name';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Employee (Admin only)
router.put('/:id', async (req, res) => {
  if (req.user.role !== 'Admin') return res.sendStatus(403);

  const { id } = req.params;
  const { full_name, job_title, employee_id, department_id, manager_id, role } = req.body;

  console.log('--- UPDATE EMPLOYEE DEBUG ---');
  console.log('User:', req.user);
  console.log('Params ID:', id);
  console.log('Body:', req.body);

  try {
    // Convert empty strings to null for integer fields
    const deptId = department_id === '' ? null : department_id;
    const mgrId = manager_id === '' ? null : manager_id;

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           job_title = COALESCE($2, job_title), 
           employee_id = COALESCE($3, employee_id),
           department_id = $4, 
           manager_id = $5,
           role = COALESCE($6, role)
       WHERE id = $7 AND company_id = $8
       RETURNING id, full_name, job_title, employee_id, department_id, manager_id, role`,
      [full_name, job_title, employee_id, deptId, mgrId, role, id, req.user.companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete Employee (Admin only)
router.delete('/:id', async (req, res) => {
  if (req.user.role !== 'Admin') return res.sendStatus(403);

  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 AND company_id = $2 RETURNING id, full_name',
      [id, req.user.companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully', employee: result.rows[0] });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
