import React, { useState, useEffect, useRef } from 'react';
import {
    Typography, Box, Card, CardContent, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Chip
} from '@mui/material';
import { AccessTime, Login, Logout } from '@mui/icons-material';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AttendancePage = () => {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [records, setRecords] = useState([]);
    const [dailyHours, setDailyHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const timerRef = useRef(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch initial status and records
    useEffect(() => {
        fetchStatus();
        fetchRecords();
    }, []);

    // Timer effect
    useEffect(() => {
        if (isCheckedIn && checkInTime) {
            timerRef.current = setInterval(() => {
                const now = new Date();
                const checkIn = new Date(checkInTime);
                setElapsedTime(Math.floor((now - checkIn) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsedTime(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isCheckedIn, checkInTime]);

    const fetchStatus = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/attendance/status', { headers });
            setIsCheckedIn(res.data.isCheckedIn);
            if (res.data.isCheckedIn) setCheckInTime(res.data.checkInTime);
        } catch (err) {
            console.error('Error fetching status:', err);
        }
        setLoading(false);
    };

    const fetchRecords = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/attendance/my-records', { headers });
            setRecords(res.data.records || []);

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const chartData = res.data.dailyHours?.map(d => ({
                day: days[parseInt(d.day_of_week)],
                hours: parseFloat(d.total_hours).toFixed(2),
                date: d.date
            })) || [];
            setDailyHours(chartData);
        } catch (err) {
            console.error('Error fetching records:', err);
        }
    };

    const handleCheckIn = async () => {
        try {
            const res = await axios.post('http://localhost:3000/api/attendance/check-in', {}, { headers });
            setIsCheckedIn(true);
            setCheckInTime(res.data.record.check_in);
            setMessage('Checked in successfully!');
            fetchRecords();
        } catch (err) {
            setMessage(err.response?.data?.error || 'Error checking in');
        }
    };

    const handleCheckOut = async () => {
        try {
            await axios.post('http://localhost:3000/api/attendance/check-out', {}, { headers });
            setIsCheckedIn(false);
            setCheckInTime(null);
            setMessage('Checked out successfully!');
            fetchRecords();
        } catch (err) {
            setMessage(err.response?.data?.error || 'Error checking out');
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatHours = (hours) => {
        if (!hours) return '-';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Attendance</Typography>

            {message && (
                <Chip label={message} color="primary" onDelete={() => setMessage('')} sx={{ mb: 2 }} />
            )}

            <Grid container spacing={3}>
                {/* Check-in/out Button Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ textAlign: 'center', py: 4 }}>
                        <CardContent>
                            <Box
                                onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                                sx={{
                                    width: 150, height: 150, borderRadius: '50%',
                                    backgroundColor: isCheckedIn ? 'error.main' : 'success.main',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    mx: 'auto', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'scale(1.05)', boxShadow: 6 }
                                }}
                            >
                                {isCheckedIn ? <Logout sx={{ fontSize: 40, color: 'white' }} /> : <Login sx={{ fontSize: 40, color: 'white' }} />}
                                <Typography variant="h6" color="white" sx={{ mt: 1 }}>
                                    {isCheckedIn ? 'Check Out' : 'Check In'}
                                </Typography>
                            </Box>

                            {isCheckedIn && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="body2" color="textSecondary">Time elapsed</Typography>
                                    <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>{formatTime(elapsedTime)}</Typography>
                                </Box>
                            )}

                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                {isCheckedIn ? `Checked in at ${formatDateTime(checkInTime)}` : 'Click to check in'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Weekly Hours Chart */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Weekly Hours
                            </Typography>
                            {dailyHours.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={dailyHours}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value) => [`${value} hours`, 'Worked']} />
                                        <Bar dataKey="hours" fill="#00BCD4" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                                    No attendance records this week
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Weekly Summary Table */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Weekly Summary</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Check In</TableCell>
                                            <TableCell>Check Out</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Hours</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {records.map(record => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    {new Date(record.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </TableCell>
                                                <TableCell>{formatDateTime(record.check_in)}</TableCell>
                                                <TableCell>{formatDateTime(record.check_out)}</TableCell>
                                                <TableCell>
                                                    <Chip label={record.status} size="small" color={record.status === 'Checked-in' ? 'success' : 'default'} />
                                                </TableCell>
                                                <TableCell align="right">{formatHours(record.hours_worked)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {records.length === 0 && (
                                            <TableRow><TableCell colSpan={5} align="center">No records this week</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AttendancePage;
