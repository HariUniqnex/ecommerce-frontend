import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Stack,
} from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { apiUrl } from "../utils/api";

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
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [filteredData, setFilteredData] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders/stats`);
        const data = response.data;

        const years = [
          ...new Set(
            data.monthlyTotals
              .filter((item) => item.total > 0)
              .map((item) => item.year)
          ),
        ].sort();

        setAvailableYears(years);
        setStats(data);
        setFilteredData(data);
      } catch (error) {
        toa.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats) {
      const monthsForYear = stats.monthlyTotals
        .filter((item) => selectedYear === "all" || item.year === selectedYear)
        .filter((item) => item.total > 0)
        .map((item) => item.month);

      setAvailableMonths([...new Set(monthsForYear)]);

      if (selectedMonth !== "all" && !monthsForYear.includes(selectedMonth)) {
        setSelectedMonth("all");
      }
    }
  }, [selectedYear, stats]);

  useEffect(() => {
    if (stats) {
      let filteredStats = { ...stats };

      if (selectedYear !== "all") {
        filteredStats.monthlyTotals = stats.monthlyTotals.filter(
          (item) => item.year === selectedYear
        );
      }

      if (selectedMonth !== "all") {
        const monthData = filteredStats.monthlyTotals.find(
          (item) =>
            item.month === selectedMonth &&
            (selectedYear === "all" || item.year === selectedYear)
        );

        if (monthData && monthData.total > 0) {
          const estimatedOrders = Math.round(
            monthData.total / stats.avgOrderValue
          );

          filteredStats = {
            ...filteredStats,
            totalRevenue: monthData.total,
            totalOrders: estimatedOrders,
            avgOrderValue:
              estimatedOrders > 0 ? monthData.total / estimatedOrders : 0,
            monthlyTotals: [monthData],
          };
        } else {
          filteredStats = {
            ...filteredStats,
            totalRevenue: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            monthlyTotals: [],
          };
        }
      } else {
        const relevantMonths = filteredStats.monthlyTotals.filter(
          (item) => item.total > 0
        );

        filteredStats.totalRevenue = relevantMonths.reduce(
          (sum, item) => sum + item.total,
          0
        );

        if (filteredStats.totalRevenue > 0) {
          filteredStats.totalOrders = Math.max(
            1,
            Math.round(
              filteredStats.totalRevenue /
                (stats.avgOrderValue || filteredStats.totalRevenue)
            )
          );
        } else {
          filteredStats.totalOrders = 0;
        }

        filteredStats.avgOrderValue =
          filteredStats.totalOrders > 0
            ? filteredStats.totalRevenue / filteredStats.totalOrders
            : 0;

        filteredStats.monthlyTotals = relevantMonths;
      }

      setFilteredData(filteredStats);
    }
  }, [selectedYear, selectedMonth, stats]);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );

  if (!filteredData || !filteredData.statusCounts) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography variant="h6">No data available</Typography>
      </Box>
    );
  }

  const statusData = {
    labels: filteredData.statusCounts.map((item) => item.id),
    datasets: [
      {
        data: filteredData.statusCounts.map((item) => item.count),
        backgroundColor: [
          "#FF9900",
          "#232F3E",
          "#FFD700",
          "#00A8E1",
          "#FF6B6B",
          "#4ECDC4",
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = {
    labels: filteredData.monthlyTotals.map(
      (item) => `${item.month} ${item.year}`
    ),
    datasets: [
      {
        label: "Sales ($)",
        data: filteredData.monthlyTotals.map((item) => item.total),
        backgroundColor: "#FF9900",
        borderRadius: 4,
      },
    ],
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="all">All Years</MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={availableMonths.length === 0}
            >
              <MenuItem value="all">All Months</MenuItem>
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4">
              {filteredData.totalOrders || 1}
            </Typography>
  
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4">
              ${(filteredData.totalRevenue || 0).toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Avg. Order Value
            </Typography>
            <Typography variant="h4">
              ${(filteredData.avgOrderValue || filteredData.totalRevenue).toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Orders by Status
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: 300 }}>
            {filteredData.statusCounts.length > 0 ? (
              <Pie
                data={statusData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                  },
                }}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Typography color="textSecondary">
                  No status data available
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            {selectedMonth === "all"
              ? selectedYear === "all"
                ? "Monthly Sales"
                : `${selectedYear} Sales`
              : `${selectedMonth} ${
                  selectedYear !== "all" ? selectedYear : ""
                } Sales`}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: 300 }}>
            {filteredData.monthlyTotals.length > 0 ? (
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
                        label: function (context) {
                          return "$" + context.raw.toFixed(2);
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return "$" + value;
                        },
                      },
                    },
                  },
                }}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Typography color="textSecondary">
                  No sales data for selected period
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
