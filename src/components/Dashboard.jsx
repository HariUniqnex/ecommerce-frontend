import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Card, CardContent, 
  CircularProgress, Divider 
} from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { apiUrl } from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders/stats`);
        console.log("ORDERS",response)
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <CircularProgress />;

  const statusData = {
    labels: stats?.statusCounts?.map(item => item.id),
    datasets: [{
      data: stats?.statusCounts?.map(item => item.count),
      backgroundColor: [
        '#FF9900', '#232F3E', '#FFD700', '#00A8E1'
      ],
    }]
  };

  const monthlyData = {
    labels: stats?.monthlyTotals?.map(item => item.month),
    datasets: [{
      label: 'Sales ($)',
      data: stats?.monthlyTotals?.map(item => item.total),
      backgroundColor: '#FF9900',
    }]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Orders</Typography>
            <Typography variant="h4">{stats?.totalOrders}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Revenue</Typography>
            <Typography variant="h4">${stats?.totalRevenue?.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Avg. Order Value</Typography>
            <Typography variant="h4">${stats?.avgOrderValue?.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Orders by Status</Typography>
          <Divider sx={{ mb: 2 }} />
          <Pie data={statusData} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Monthly Sales</Typography>
          <Divider sx={{ mb: 2 }} />
          <Bar data={monthlyData} />
        </Paper>
      </Grid>
    </Grid>
  );
}