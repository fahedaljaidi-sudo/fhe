const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function verifyAuth() {
    try {
        const timestamp = Date.now();
        const adminEmail = `admin${timestamp}@example.com`;
        const companyName = `Company ${timestamp}`;

        console.log('--- 1. Registering Company ---');
        await axios.post(`${API_URL}/auth/register-company`, {
            companyName,
            adminFullName: 'Super Admin',
            adminEmail,
            adminPassword: 'password123'
        });
        console.log('SUCCESS: Company registered.');

        console.log('--- 2. Logging In ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: adminEmail,
            password: 'password123'
        });
        const { token } = loginRes.data;
        console.log('SUCCESS: Login successful. Token received.');

        console.log('--- 3. Accessing Protected Endpoint ---');
        const meRes = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('SUCCESS: Protected data received:', meRes.data);

    } catch (error) {
        console.error('FAILURE:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verifyAuth();
