import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, TextField,
    Card, CardContent, Grid, MenuItem, Select, FormControl, InputLabel,
    Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const EmployeesPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Forms
    const [newDeptName, setNewDeptName] = useState('');
    const [newEmployee, setNewEmployee] = useState({
        full_name: '', email: '', password: '', job_title: '', employee_id: '', department_id: '', manager_id: ''
    });

    // Edit dialogs
    const [editDeptDialog, setEditDeptDialog] = useState({ open: false, dept: null });
    const [editEmpDialog, setEditEmpDialog] = useState({ open: false, emp: null });
    const [editDeptName, setEditDeptName] = useState('');
    const [editEmployee, setEditEmployee] = useState({
        full_name: '', job_title: '', employee_id: '', department_id: '', manager_id: '', role: ''
    });

    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            const depts = await axios.get('http://localhost:3000/api/departments', { headers });
            setDepartments(depts.data);
            const emps = await axios.get('http://localhost:3000/api/employees', { headers });
            setEmployees(emps.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    // Department CRUD
    const handleCreateDept = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/departments', { name: newDeptName }, { headers });
            setMessage('Department created!');
            setNewDeptName('');
            fetchData();
        } catch (err) {
            setMessage('Error creating department: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleEditDept = (dept) => {
        setEditDeptName(dept.name);
        setEditDeptDialog({ open: true, dept });
    };

    const handleUpdateDept = async () => {
        try {
            await axios.put(`http://localhost:3000/api/departments/${editDeptDialog.dept.id}`, { name: editDeptName }, { headers });
            setMessage('Department updated!');
            setEditDeptDialog({ open: false, dept: null });
            fetchData();
        } catch (err) {
            setMessage('Error updating department: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteDept = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/departments/${id}`, { headers });
            setMessage('Department deleted!');
            fetchData();
        } catch (err) {
            setMessage('Error deleting department: ' + (err.response?.data?.error || err.message));
        }
    };

    // Employee CRUD
    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/employees', newEmployee, { headers });
            setMessage('Employee created!');
            setNewEmployee({ full_name: '', email: '', password: '', job_title: '', employee_id: '', department_id: '', manager_id: '' });
            fetchData();
        } catch (err) {
            setMessage('Error creating employee: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleEditEmp = (emp) => {
        setEditEmployee({
            full_name: emp.full_name || '', job_title: emp.job_title || '', employee_id: emp.employee_id || '',
            department_id: emp.department_id || '', manager_id: emp.manager_id || '', role: emp.role || 'Employee'
        });
        setEditEmpDialog({ open: true, emp });
    };

    const handleUpdateEmp = async () => {
        try {
            await axios.put(`http://localhost:3000/api/employees/${editEmpDialog.emp.id}`, editEmployee, { headers });
            setMessage('Employee updated!');
            setEditEmpDialog({ open: false, emp: null });
            fetchData();
        } catch (err) {
            setMessage('Error updating employee: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteEmp = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/employees/${id}`, { headers });
            setMessage('Employee deleted!');
            fetchData();
        } catch (err) {
            setMessage('Error deleting employee: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Organization Management</Typography>
            {message && <Typography color="primary" sx={{ mb: 2 }}>{message}</Typography>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Manage Employees" />
                    <Tab label="Manage Departments" />
                </Tabs>
            </Box>

            {/* Employees Tab */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Add New Employee</Typography>
                                <form onSubmit={handleCreateEmployee}>
                                    <TextField label="Full Name" fullWidth margin="normal" required value={newEmployee.full_name} onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })} />
                                    <TextField label="Email" type="email" fullWidth margin="normal" required value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />
                                    <TextField label="Password" type="password" fullWidth margin="normal" required value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} />
                                    <TextField label="Employee ID" fullWidth margin="normal" value={newEmployee.employee_id} onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })} />
                                    <TextField label="Job Title" fullWidth margin="normal" value={newEmployee.job_title} onChange={(e) => setNewEmployee({ ...newEmployee, job_title: e.target.value })} />
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Department</InputLabel>
                                        <Select value={newEmployee.department_id} label="Department" onChange={(e) => setNewEmployee({ ...newEmployee, department_id: e.target.value })}>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Manager</InputLabel>
                                        <Select value={newEmployee.manager_id} label="Manager" onChange={(e) => setNewEmployee({ ...newEmployee, manager_id: e.target.value })}>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.full_name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Add Employee</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>Existing Employees</Typography>
                        <Grid container spacing={2}>
                            {employees.map(emp => (
                                <Grid item xs={12} sm={6} key={emp.id}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="h6">{emp.full_name}</Typography>
                                                    <Typography color="textSecondary">{emp.job_title || 'No Title'}</Typography>
                                                    <Typography variant="body2">{emp.email}</Typography>
                                                    {emp.employee_id && <Typography variant="caption" display="block">ID: {emp.employee_id}</Typography>}
                                                    <Typography variant="caption" display="block">Dep: {emp.department_name || '-'} | Mgr: {emp.manager_name || '-'}</Typography>
                                                    <Typography variant="caption" color="primary">Role: {emp.role}</Typography>
                                                </Box>
                                                <Box>
                                                    <IconButton size="small" onClick={() => handleEditEmp(emp)}><Edit /></IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteEmp(emp.id)}><Delete /></IconButton>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Departments Tab */}
            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Add Department</Typography>
                                <form onSubmit={handleCreateDept}>
                                    <TextField label="Name" fullWidth margin="normal" required value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
                                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Create Department</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>Existing Departments</Typography>
                        {departments.map(dept => (
                            <Card key={dept.id} sx={{ mb: 1 }}>
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography>{dept.name}</Typography>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleEditDept(dept)}><Edit /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteDept(dept.id)}><Delete /></IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Edit Department Dialog */}
            <Dialog open={editDeptDialog.open} onClose={() => setEditDeptDialog({ open: false, dept: null })}>
                <DialogTitle>Edit Department</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Department Name" fullWidth value={editDeptName} onChange={(e) => setEditDeptName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDeptDialog({ open: false, dept: null })}>Cancel</Button>
                    <Button onClick={handleUpdateDept} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Employee Dialog */}
            <Dialog open={editEmpDialog.open} onClose={() => setEditEmpDialog({ open: false, emp: null })} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Full Name" fullWidth value={editEmployee.full_name} onChange={(e) => setEditEmployee({ ...editEmployee, full_name: e.target.value })} />
                    <TextField margin="dense" label="Employee ID" fullWidth value={editEmployee.employee_id} onChange={(e) => setEditEmployee({ ...editEmployee, employee_id: e.target.value })} />
                    <TextField margin="dense" label="Job Title" fullWidth value={editEmployee.job_title} onChange={(e) => setEditEmployee({ ...editEmployee, job_title: e.target.value })} />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Department</InputLabel>
                        <Select value={editEmployee.department_id} label="Department" onChange={(e) => setEditEmployee({ ...editEmployee, department_id: e.target.value })}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Manager</InputLabel>
                        <Select value={editEmployee.manager_id} label="Manager" onChange={(e) => setEditEmployee({ ...editEmployee, manager_id: e.target.value })}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            {employees.filter(e => editEmpDialog.emp && e.id !== editEmpDialog.emp.id).map(e => <MenuItem key={e.id} value={e.id}>{e.full_name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Role</InputLabel>
                        <Select value={editEmployee.role} label="Role" onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}>
                            <MenuItem value="Employee">Employee</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditEmpDialog({ open: false, emp: null })}>Cancel</Button>
                    <Button onClick={handleUpdateEmp} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmployeesPage;
