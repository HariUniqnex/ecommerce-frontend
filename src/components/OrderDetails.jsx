import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Paper, Typography, Grid, List, ListItem, ListItemText, 
  Divider, Chip, Box, Avatar, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';
import axios from 'axios';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { apiUrl } from '../utils/api';
import { toast } from 'react-toastify';

const statusColors = {
  Shipped: 'success',
  Pending: 'warning',
  Cancelled: 'error',
  Delivered: 'info',
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        toast.error('Failed to fetch order!Try again');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  const totalAmount = order.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Order #{order.order_id}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={order.order_status} 
              color={statusColors[order.order_status] || 'default'} 
              sx={{ mr: 2 }}
            />
            <Typography variant="body2">
              Ordered on {new Date(order.purchase_date).toLocaleString()}
            </Typography>
          </Box>

          <List>
            <ListItem>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <LocalShippingIcon />
              </Avatar>
              <ListItemText 
                primary="Shipping Information" 
                secondary={
                  order.shipping_address ? 
                  `${order.shipping_address.City}, ${order.shipping_address.StateOrRegion} ${order.shipping_address.PostalCode}` :
                  'Not available'
                } 
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                <PaymentIcon />
              </Avatar>
              <ListItemText 
                primary="Payment Method" 
                secondary={order.payment_method || 'Other'} 
              />
            </ListItem>
          </List>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Products
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Brand</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>
                              <ShoppingCartIcon />
                            </Avatar>
                            <Typography>{product.title}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>${(product.price * product.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Items" />
                    <Typography>${totalAmount.toFixed(2)}</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Shipping" />
                    <Typography>$0.00</Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Order Total" />
                    <Typography variant="h6">${totalAmount.toFixed(2)}</Typography>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}