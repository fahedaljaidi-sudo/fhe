import React from 'react';
import { Typography, Box, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { People, AttachMoney, AccessTime } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const quickLinks = [
        {
            path: '/employees',
            label: 'Manage Employees',
            icon: <People sx={{ fontSize: 40 }} />,
            description: 'Add, edit, and manage employee records'
        },
        {
            path: '/salaries',
            label: 'Salaries',
            icon: <AttachMoney sx={{ fontSize: 40 }} />,
            description: 'View and manage employee salaries'
        },
        {
            path: '/attendance',
            label: 'Attendance',
            icon: <AccessTime sx={{ fontSize: 40 }} />,
            description: 'Track check-in and check-out times'
        },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Welcome to HRM Dashboard
            </Typography>
            <Typography color="textSecondary" paragraph>
                Select an option from the sidebar or use the quick links below to get started.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {quickLinks.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.path}>
                        <Card>
                            <CardActionArea component={Link} to={item.path} sx={{ p: 2 }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                                        {item.icon}
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        {item.label}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {item.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Dashboard;
