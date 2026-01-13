import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, TextField,
    Card, CardContent, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, Chip
} from '@mui/material';
import { Edit, Print, Download } from '@mui/icons-material';
import axios from 'axios';
import * as XLSX from 'xlsx';

const SalariesPage = () => {
    const [salaries, setSalaries] = useState([]);
    const [mySalary, setMySalary] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // Edit dialog
    const [editDialog, setEditDialog] = useState({ open: false, employee: null });
    const [salaryForm, setSalaryForm] = useState({
        user_id: '',
        base_salary: '',
        housing_allowance: '',
        transport_allowance: '',
        other_allowances: '',
        deductions: '',
        effective_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Decode JWT to get user role
    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role);
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        }
    }, [token]);

    // Fetch data based on role
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (userRole === 'Admin') {
                    const [salRes, empRes] = await Promise.all([
                        axios.get('http://localhost:3000/api/salaries', { headers }),
                        axios.get('http://localhost:3000/api/salaries/employees', { headers })
                    ]);
                    setSalaries(salRes.data);
                    setEmployees(empRes.data);
                } else if (userRole) {
                    const res = await axios.get('http://localhost:3000/api/salaries/me', { headers });
                    setMySalary(res.data);
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setMySalary(null);
                } else {
                    console.error('Error fetching salary data:', err);
                }
            }
            setLoading(false);
        };

        if (userRole) fetchData();
    }, [userRole]);

    const handleEditSalary = (employee) => {
        const existingSalary = salaries.find(s => s.user_id === employee.id);
        setSalaryForm({
            user_id: employee.id,
            base_salary: existingSalary?.base_salary || '',
            housing_allowance: existingSalary?.housing_allowance || '',
            transport_allowance: existingSalary?.transport_allowance || '',
            other_allowances: existingSalary?.other_allowances || '',
            deductions: existingSalary?.deductions || '',
            effective_date: existingSalary?.effective_date?.split('T')[0] || new Date().toISOString().split('T')[0],
            notes: existingSalary?.notes || ''
        });
        setEditDialog({ open: true, employee });
    };

    const handleSaveSalary = async () => {
        try {
            await axios.post('http://localhost:3000/api/salaries', {
                ...salaryForm,
                base_salary: parseFloat(salaryForm.base_salary) || 0,
                housing_allowance: parseFloat(salaryForm.housing_allowance) || 0,
                transport_allowance: parseFloat(salaryForm.transport_allowance) || 0,
                other_allowances: parseFloat(salaryForm.other_allowances) || 0,
                deductions: parseFloat(salaryForm.deductions) || 0
            }, { headers });

            setMessage('Salary saved successfully!');
            setEditDialog({ open: false, employee: null });
            const salRes = await axios.get('http://localhost:3000/api/salaries', { headers });
            setSalaries(salRes.data);
        } catch (err) {
            setMessage('Error saving salary: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleExportExcel = () => {
        const exportData = salaries.map(s => ({
            'Employee Name': s.full_name,
            'Employee ID': s.employee_id || '-',
            'Job Title': s.job_title || '-',
            'Department': s.department_name || '-',
            'Base Salary': parseFloat(s.base_salary),
            'Housing Allowance': parseFloat(s.housing_allowance),
            'Transport Allowance': parseFloat(s.transport_allowance),
            'Other Allowances': parseFloat(s.other_allowances),
            'Deductions': parseFloat(s.deductions),
            'Net Salary': parseFloat(s.net_salary),
            'Effective Date': s.effective_date?.split('T')[0] || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Salaries');
        XLSX.writeFile(wb, `salaries_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = () => window.print();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(amount || 0);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    // Admin View
    if (userRole === 'Admin') {
        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Salary Management</Typography>
                    <Button variant="contained" startIcon={<Download />} onClick={handleExportExcel} disabled={salaries.length === 0}>
                        Export to Excel
                    </Button>
                </Box>

                {message && <Typography color="primary" sx={{ mb: 2 }}>{message}</Typography>}

                <Typography variant="h6" gutterBottom>Employees Without Salary</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {employees.filter(e => !e.has_salary).map(emp => (
                        <Grid item xs={12} sm={6} md={4} key={emp.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="subtitle1">{emp.full_name}</Typography>
                                    <Typography variant="body2" color="textSecondary">{emp.job_title || 'No Title'}</Typography>
                                    <Button size="small" onClick={() => handleEditSalary(emp)} sx={{ mt: 1 }}>Set Salary</Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {employees.filter(e => !e.has_salary).length === 0 && (
                        <Grid item xs={12}>
                            <Typography color="textSecondary">All employees have salaries assigned.</Typography>
                        </Grid>
                    )}
                </Grid>

                <Typography variant="h6" gutterBottom>Salary Table</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Job Title</TableCell>
                                <TableCell align="right">Base Salary</TableCell>
                                <TableCell align="right">Housing</TableCell>
                                <TableCell align="right">Transport</TableCell>
                                <TableCell align="right">Other</TableCell>
                                <TableCell align="right">Deductions</TableCell>
                                <TableCell align="right">Net Salary</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {salaries.map(salary => (
                                <TableRow key={salary.id}>
                                    <TableCell>
                                        <Typography variant="body2">{salary.full_name}</Typography>
                                        <Typography variant="caption" color="textSecondary">{salary.employee_id}</Typography>
                                    </TableCell>
                                    <TableCell>{salary.job_title || '-'}</TableCell>
                                    <TableCell align="right">{formatCurrency(salary.base_salary)}</TableCell>
                                    <TableCell align="right">{formatCurrency(salary.housing_allowance)}</TableCell>
                                    <TableCell align="right">{formatCurrency(salary.transport_allowance)}</TableCell>
                                    <TableCell align="right">{formatCurrency(salary.other_allowances)}</TableCell>
                                    <TableCell align="right" sx={{ color: 'error.main' }}>{formatCurrency(salary.deductions)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(salary.net_salary)}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleEditSalary({ id: salary.user_id, full_name: salary.full_name })}>
                                            <Edit />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {salaries.length === 0 && (
                                <TableRow><TableCell colSpan={9} align="center">No salary records found</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Edit Salary Dialog */}
                <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, employee: null })} maxWidth="sm" fullWidth>
                    <DialogTitle>{editDialog.employee?.full_name ? `Edit Salary: ${editDialog.employee.full_name}` : 'Edit Salary'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}><TextField label="Base Salary" type="number" fullWidth value={salaryForm.base_salary} onChange={(e) => setSalaryForm({ ...salaryForm, base_salary: e.target.value })} /></Grid>
                            <Grid item xs={6}><TextField label="Housing Allowance" type="number" fullWidth value={salaryForm.housing_allowance} onChange={(e) => setSalaryForm({ ...salaryForm, housing_allowance: e.target.value })} /></Grid>
                            <Grid item xs={6}><TextField label="Transport Allowance" type="number" fullWidth value={salaryForm.transport_allowance} onChange={(e) => setSalaryForm({ ...salaryForm, transport_allowance: e.target.value })} /></Grid>
                            <Grid item xs={6}><TextField label="Other Allowances" type="number" fullWidth value={salaryForm.other_allowances} onChange={(e) => setSalaryForm({ ...salaryForm, other_allowances: e.target.value })} /></Grid>
                            <Grid item xs={6}><TextField label="Deductions" type="number" fullWidth value={salaryForm.deductions} onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })} /></Grid>
                            <Grid item xs={6}><TextField label="Effective Date" type="date" fullWidth value={salaryForm.effective_date} onChange={(e) => setSalaryForm({ ...salaryForm, effective_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid item xs={12}><TextField label="Notes" fullWidth multiline rows={2} value={salaryForm.notes} onChange={(e) => setSalaryForm({ ...salaryForm, notes: e.target.value })} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialog({ open: false, employee: null })}>Cancel</Button>
                        <Button onClick={handleSaveSalary} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    // Employee View (Payslip style)
    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">My Salary</Typography>
                {mySalary && <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>}
            </Box>

            {!mySalary ? (
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" align="center">No salary information available. Please contact HR.</Typography>
                    </CardContent>
                </Card>
            ) : (
                <Card className="printable-payslip">
                    <CardContent>
                        <Typography variant="h5" gutterBottom align="center">Salary Statement</Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Employee Name</Typography><Typography>{mySalary.full_name}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Employee ID</Typography><Typography>{mySalary.employee_id || '-'}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Job Title</Typography><Typography>{mySalary.job_title || '-'}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Department</Typography><Typography>{mySalary.department_name || '-'}</Typography></Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom>Earnings</Typography>
                        <Box sx={{ pl: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Base Salary</Typography><Typography>{formatCurrency(mySalary.base_salary)}</Typography></Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Housing Allowance</Typography><Typography>{formatCurrency(mySalary.housing_allowance)}</Typography></Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Transport Allowance</Typography><Typography>{formatCurrency(mySalary.transport_allowance)}</Typography></Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Other Allowances</Typography><Typography>{formatCurrency(mySalary.other_allowances)}</Typography></Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom>Deductions</Typography>
                        <Box sx={{ pl: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Total Deductions</Typography><Typography color="error">{formatCurrency(mySalary.deductions)}</Typography></Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Net Salary</Typography>
                            <Chip label={formatCurrency(mySalary.net_salary)} color="primary" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                        </Box>

                        <Typography variant="caption" display="block" sx={{ mt: 2 }} color="textSecondary">
                            Effective Date: {mySalary.effective_date?.split('T')[0]}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default SalariesPage;
