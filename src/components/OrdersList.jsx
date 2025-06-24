import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Chip, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../utils/api';

const statusColors = {
  Shipped: 'success',
  Pending: 'warning',
  Cancelled: 'error',
  Delivered: 'info',
};

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders`);
        console.log('Fetched Orders:', response.data);  // Log the response to check the structure

        // Mapping orders data
        const formattedOrders = response.data.map((order) => ({
          order_id: order.order_id,
          purchase_date: new Date(),  // Placeholder, replace with actual date if available
          order_status: 'Shipped',  // Placeholder, replace with actual status if available
          products: order.products,
          total: order.products.reduce((sum, product) => sum + product.price * product.quantity, 0),
        }));

        setOrders(formattedOrders);  // Set formatted data to state
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const columns = [
    { field: 'order_id', headerName: 'Order ID', width: 200 },
    { 
      field: 'purchase_date', headerName: 'Date', width: 180,
      valueGetter: (params) => params?.value ? new Date(params.value).toLocaleString() : ''
    },
    { 
      field: 'order_status', headerName: 'Status', width: 130,
      renderCell: (params) => (
        <Chip 
          label={params?.value || 'Unknown'}
          color={statusColors[params?.value] || 'default'} 
        />
      ) 
    },
    { 
      field: 'products', headerName: 'Items', width: 100,
      valueGetter: (params) => Array.isArray(params?.value) ? params.value.length : 0 
    },
    { 
      field: 'total', headerName: 'Total', width: 120,
      valueGetter: (params) => {
        const total = params?.row?.total || 0;
        return `$${total.toFixed(2)}`;
      }
    },
    { 
      field: 'actions', headerName: 'Actions', width: 120,
      renderCell: (params) => (
        <Button
          component={Link}
          to={`/orders/${params?.row?.order_id}`}
          size="small"
          variant="outlined"
          disabled={!params?.row?.order_id}
        >
          Details
        </Button>
      ) 
    },
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.order_id}
        components={{
          LoadingOverlay: LinearProgress,
        }}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
}
