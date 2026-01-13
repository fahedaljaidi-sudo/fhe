import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';

function RegisterCompanyPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    adminFullName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.companyName || !formData.adminFullName || !formData.adminEmail || !formData.adminPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      // This is the corrected API endpoint URL
      const response = await axios.post('/api/auth/register-company', formData);
      
      setSuccess('Company registered successfully! You can now log in.');
      // Optionally, redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      // Set a user-friendly error message
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', p: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
              Register New Company
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="companyName"
                label="Company Name"
                name="companyName"
                autoComplete="organization"
                autoFocus
                value={formData.companyName}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="adminFullName"
                label="Admin Full Name"
                name="adminFullName"
                autoComplete="name"
                value={formData.adminFullName}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="adminEmail"
                label="Admin Email Address"
                name="adminEmail"
                autoComplete="email"
                value={formData.adminEmail}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="adminPassword"
                label="Admin Password"
                type="password"
                id="adminPassword"
                autoComplete="new-password"
                value={formData.adminPassword}
                onChange={handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, p: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Register Company'}
              </Button>
              <Typography align="center">
                Already have an account? <Link to="/login">Login here</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default RegisterCompanyPage;
