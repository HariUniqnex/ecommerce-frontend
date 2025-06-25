  import React, { useState, useEffect } from "react";
  import { DataGrid } from "@mui/x-data-grid";
  import { Button, Chip, LinearProgress } from "@mui/material";
  import { Link } from "react-router-dom";
  import axios from "axios";
  import { apiUrl } from "../utils/api";

  const statusColors = {
    Shipped: "success",
    Pending: "warning",
    Cancelled: "error",
    Delivered: "info",
  };

  export default function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/orders`);
          console.log(response.data);

          const formattedOrders = response.data.map((order) => {
            const products = Array.isArray(order.products) ? order.products : [];

            const { total, items } = products.reduce(
              (acc, product) => {
                const price = parseFloat(
                  product.price ||
                    product.product_price ||
                    product.unit_price ||
                    0
                );

                const quantity = parseInt(
                  product.quantity || product.qty || 0,
                  10
                );

                return {
                  total: acc.total + price * quantity,
                  items: acc.items + quantity,
                };
              },
              { total: 0, items: 0 }
            );

            return {
              id: order.order_id,
              order_id: order.order_id,
              purchase_date: order.purchase_date || "N/A",
              order_status: order.order_status || "Shipped",
              products: products,
              items: items,
              total: total,
            };
          });

          setOrders(formattedOrders);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, []);

    const columns = [
      {
        field: "order_id",
        headerName: "Order ID",
        width: 200,
      },
      {
        field: "purchase_date",
        headerName: "Date",
        width: 180,
        valueFormatter: (value) => {
          if (!value) return "N/A";

          const date = new Date(value);
          if (isNaN(date.getTime())) return "Invalid Date";

          return date.toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },

      {
        field: "order_status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.value || "Unknown"}
            color={statusColors[params.value] || "default"}
          />
        ),
      },
      {
        field: "items",
        headerName: "Items",
        width: 100,
        type: "number",
      },
      {
        field: "total",
        headerName: "Total",
        width: 120,
        type: "number",
        valueFormatter: (params) => {
          const value = Number(params) || 0;
          return `$${value.toFixed(2)}`;
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            component={Link}
            to={`/orders/${params.row.order_id}`}
            size="small"
            variant="outlined"
            disabled={!params.row.order_id}
          >
            Details
          </Button>
        ),
      },
    ];

    return (
      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={orders}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          slots={{
            loadingOverlay: LinearProgress,
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick
        />
      </div>
    );
  }
