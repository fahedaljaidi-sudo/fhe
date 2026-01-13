const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authenticateToken);

// POST /api/attendance/check-in - Record check-in
router.post('/check-in', async (req, res) => {
    try {
        // Check if there's already an active session (checked in but not out)
        const activeSession = await db.query(`
            SELECT id FROM attendance_records 
            WHERE user_id = $1 AND check_out IS NULL
            ORDER BY check_in DESC LIMIT 1
        `, [req.user.id]);

        if (activeSession.rows.length > 0) {
            return res.status(400).json({
                error: 'Already checked in. Please check out first.'
            });
        }

        // Create new check-in record
        const result = await db.query(`
            INSERT INTO attendance_records (user_id, company_id, check_in, status)
            VALUES ($1, $2, CURRENT_TIMESTAMP, 'Checked-in')
            RETURNING id, check_in, status
        `, [req.user.id, req.user.companyId]);

        res.status(201).json({
            message: 'Checked in successfully',
            record: result.rows[0]
        });
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/attendance/check-out - Record check-out
router.post('/check-out', async (req, res) => {
    try {
        // Find the active session
        const activeSession = await db.query(`
            SELECT id, check_in FROM attendance_records 
            WHERE user_id = $1 AND check_out IS NULL
            ORDER BY check_in DESC LIMIT 1
        `, [req.user.id]);

        if (activeSession.rows.length === 0) {
            return res.status(400).json({
                error: 'No active session found. Please check in first.'
            });
        }

        // Update with check-out time
        const result = await db.query(`
            UPDATE attendance_records 
            SET check_out = CURRENT_TIMESTAMP, status = 'Checked-out'
            WHERE id = $1
            RETURNING id, check_in, check_out, status
        `, [activeSession.rows[0].id]);

        res.json({
            message: 'Checked out successfully',
            record: result.rows[0]
        });
    } catch (error) {
        console.error('Error checking out:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/attendance/status - Get current attendance status
router.get('/status', async (req, res) => {
    try {
        // Get the most recent record
        const result = await db.query(`
            SELECT id, check_in, check_out, status 
            FROM attendance_records 
            WHERE user_id = $1
            ORDER BY check_in DESC LIMIT 1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.json({
                status: 'not-checked-in',
                message: 'No attendance records found',
                isCheckedIn: false
            });
        }

        const record = result.rows[0];
        const isCheckedIn = record.check_out === null;

        res.json({
            status: record.status,
            isCheckedIn,
            checkInTime: record.check_in,
            checkOutTime: record.check_out
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/attendance/my-records - Get records for current week
router.get('/my-records', async (req, res) => {
    try {
        // Get records for the current week (Monday to Sunday)
        const result = await db.query(`
            SELECT 
                id, 
                check_in, 
                check_out, 
                status,
                EXTRACT(EPOCH FROM (COALESCE(check_out, CURRENT_TIMESTAMP) - check_in)) / 3600 as hours_worked
            FROM attendance_records 
            WHERE user_id = $1 
              AND check_in >= date_trunc('week', CURRENT_DATE)
              AND check_in < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
            ORDER BY check_in DESC
        `, [req.user.id]);

        // Calculate daily totals for the chart
        const dailyHours = await db.query(`
            SELECT 
                DATE(check_in) as date,
                EXTRACT(DOW FROM check_in) as day_of_week,
                SUM(EXTRACT(EPOCH FROM (COALESCE(check_out, CURRENT_TIMESTAMP) - check_in)) / 3600) as total_hours
            FROM attendance_records 
            WHERE user_id = $1 
              AND check_in >= date_trunc('week', CURRENT_DATE)
              AND check_in < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
            GROUP BY DATE(check_in), EXTRACT(DOW FROM check_in)
            ORDER BY DATE(check_in)
        `, [req.user.id]);

        res.json({
            records: result.rows,
            dailyHours: dailyHours.rows
        });
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
