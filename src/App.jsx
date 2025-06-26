import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import OrdersList from './components/OrdersList';
import Dashboard from './components/Dashboard';
import { CssBaseline, Container, ThemeProvider, createTheme } from '@mui/material';
import NavBar from './components/NavBar';
import OrderDetail from './components/OrderDetails';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9900', 
    },
    secondary: {
      main: '#232F3E', 
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavBar />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;