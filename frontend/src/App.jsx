import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterCompanyPage from './pages/RegisterCompanyPage';
import Dashboard from './pages/Dashboard';
import EmployeesPage from './pages/EmployeesPage';
import SalariesPage from './pages/SalariesPage';
import AttendancePage from './pages/AttendancePage';

// Layout
import ProtectedLayout from './components/Layout';

// Define the dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00BCD4', // Teal/Cyan
    },
    background: {
      default: '#121212', // Charcoal Black
      paper: '#1e1e1e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-company" element={<RegisterCompanyPage />} />

          {/* Protected Routes wrapped by the persistent Layout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/salaries" element={<SalariesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            {/* Add other protected routes here */}
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
