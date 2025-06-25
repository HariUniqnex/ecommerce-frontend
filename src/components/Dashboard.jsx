import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Card, CardContent, 
  CircularProgress, Divider, MenuItem, Select, 
  FormControl, InputLabel, Box
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
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [filteredData, setFilteredData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders/stats`);
        setStats(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats) {
      if (selectedMonth === 'all') {
        setFilteredData(stats);
      } else {
        const monthData = stats.monthlyTotals.find(item => item.month === selectedMonth);
        const filteredStats = {
          ...stats,
          totalRevenue: monthData ? monthData.total : 0,
          totalOrders: monthData ? Math.round(monthData.total / stats.avgOrderValue) : 0,
          monthlyTotals: monthData ? [monthData] : []
        };
        setFilteredData(filteredStats);
      }
    }
  }, [selectedMonth, stats]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  const statusData = {
    labels: filteredData?.statusCounts?.map(item => item.id),
    datasets: [{
      data: filteredData?.statusCounts?.map(item => item.count),
      backgroundColor: [
        '#FF9900', '#232F3E', '#FFD700', '#00A8E1'
      ],
      borderWidth: 1,
    }]
  };

  const monthlyData = {
    labels: filteredData?.monthlyTotals?.map(item => item.month),
    datasets: [{
      label: 'Sales ($)',
      data: filteredData?.monthlyTotals?.map(item => item.total),
      backgroundColor: '#FF9900',
      borderRadius: 4,
    }]
  };

  // Get months with actual sales (> 0) for the filter dropdown
  const availableMonths = stats?.monthlyTotals
    ?.filter(item => item.total > 0)
    ?.map(item => item.month) || [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="flex-end">
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Filter by Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Filter by Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <MenuItem value="all">All Months</MenuItem>
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>{month}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Total Orders</Typography>
            <Typography variant="h4">{filteredData?.totalOrders}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Total Revenue</Typography>
            <Typography variant="h4">${filteredData?.totalRevenue?.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Avg. Order Value</Typography>
            <Typography variant="h4">${stats?.avgOrderValue?.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>Orders by Status</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: 300 }}>
            <Pie 
              data={statusData} 
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                }
              }} 
            />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            {selectedMonth === 'all' ? 'Monthly Sales' : `${selectedMonth} Sales`}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: 300 }}>
            <Bar 
              data={monthlyData} 
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return '$' + context.raw.toFixed(2);
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }} 
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}