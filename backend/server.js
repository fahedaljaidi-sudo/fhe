const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const authenticateToken = require('./middleware/authMiddleware');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello World from Backend!' });
});

// Protected Endpoint
app.get('/api/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
