import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem
} from '@mui/material';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { styled } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1b4b 0%, #2c1b47 100%)',
  padding: '20px',
  color: 'white'
}));

const ChartBox = styled(Box)(({ theme }) => ({
  height: '300px',
  margin: '20px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

const TipCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '20px',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const ExpenseItem = styled(ListItem)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  marginBottom: '16px',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateX(5px)'
  }
}));

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

const CATEGORIES = ['Electronics', 'Transportation', 'Shopping', 'Food'];
const PAYMENT_METHODS = ['Physical Cash', 'Credit Card', 'Debit Card', 'UPI'];
const CURRENCIES = ['CAD ($)', 'USD ($)', 'EUR (€)'];

const Home = () => {
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState(112908);
  const [categoryData, setCategoryData] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    amount: '',
    category: '',
    currency: '',
    payment_method: ''
  });

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setEditFormData({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      currency: expense.currency,
      payment_method: expense.payment_method
    });
    setEditDialogOpen(true);
    setOpenDrawer(null);
  };

  const handleDelete = async (expenseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== expenseId));
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
    setOpenDrawer(null);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${selectedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        setEditDialogOpen(false);
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleEditChange = (field) => (event) => {
    setEditFormData({
      ...editFormData,
      [field]: event.target.value
    });
  };

  const fetchExpenses = async () => {
    try {
      const [expensesResponse, balanceResponse] = await Promise.all([
        fetch('http://localhost:5000/api/expenses'),
        fetch('http://localhost:5000/api/balance')
      ]);

      if (expensesResponse.ok && balanceResponse.ok) {
        const expensesData = await expensesResponse.json();
        const balanceData = await balanceResponse.json();
        setExpenses(expensesData);
        setBalance(balanceData.balance);
        
        // Calculate category totals
        const categoryTotals = expensesData.reduce((acc, expense) => {
          const amount = Math.abs(expense.amount);
          acc[expense.category] = (acc[expense.category] || 0) + amount;
          return acc;
        }, {});

        // Convert to pie chart data format
        const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
          name,
          value
        }));
        setCategoryData(pieData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <StyledBox>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Home
        </Typography>
        <Box
          component="img"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%'
          }}
          alt="Profile"
          src="/profile-placeholder.jpg"
        />
      </Box>

      <ChartBox>
        <Box sx={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'rgba(0, 0, 0, 0.8)', border: 'none' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => `${value.toLocaleString()}`}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h4" component="div">
            {expenses[0]?.currency.split(' ')[1]}{balance.toLocaleString()}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Available balance
          </Typography>
        </Box>
      </ChartBox>

      {expenses.length === 0 ? (
        <TipCard>
          <Box>
            <Typography variant="h6" component="div">
              Add your first expense
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Track your spending easily
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
        </TipCard>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Recent Expenses</Typography>
          </Box>

          <List sx={{ p: 0 }}>
            {expenses.map((expense) => (
              <React.Fragment key={expense.id}>
                <ExpenseItem onClick={() => setOpenDrawer(expense.id)}>
                  <ListItemAvatar>
                    <Avatar
                      src={expense.icon}
                      sx={{ 
                        background: 'white',
                        padding: '5px'
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={expense.name}
                    secondary={
                      <React.Fragment>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {expense.category}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {expense.date}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ color: '#ff4444' }}>
                      {expense.currency.split(' ')[1]}{Math.abs(expense.amount).toLocaleString()}
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.6)' }} />
                </ExpenseItem>
                <SwipeableDrawer
                  anchor="right"
                  open={openDrawer === expense.id}
                  onClose={() => setOpenDrawer(null)}
                  onOpen={() => setOpenDrawer(expense.id)}
                  PaperProps={{
                    sx: {
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      width: '200px',
                      color: 'white'
                    }
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <IconButton 
                      onClick={() => handleEdit(expense)}
                      sx={{ color: 'white', width: '100%', mb: 2 }}
                    >
                      <EditIcon sx={{ mr: 1 }} />
                      Edit
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(expense.id)}
                      sx={{ color: '#ff4444', width: '100%' }}
                    >
                      <DeleteIcon sx={{ mr: 1 }} />
                      Delete
                    </IconButton>
                  </Box>
                </SwipeableDrawer>
              </React.Fragment>
            ))}
          </List>
        </>
      )}

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editFormData.name}
            onChange={handleEditChange('name')}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={editFormData.amount}
            onChange={handleEditChange('amount')}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Select
            fullWidth
            value={editFormData.category}
            onChange={handleEditChange('category')}
            margin="normal"
            sx={{
              mt: 2,
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' }
            }}
          >
            {CATEGORIES.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
          <Select
            fullWidth
            value={editFormData.currency}
            onChange={handleEditChange('currency')}
            margin="normal"
            sx={{
              mt: 2,
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' }
            }}
          >
            {CURRENCIES.map(currency => (
              <MenuItem key={currency} value={currency}>{currency}</MenuItem>
            ))}
          </Select>
          <Select
            fullWidth
            value={editFormData.payment_method}
            onChange={handleEditChange('payment_method')}
            margin="normal"
            sx={{
              mt: 2,
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' }
            }}
          >
            {PAYMENT_METHODS.map(method => (
              <MenuItem key={method} value={method}>{method}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
            }
          }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </StyledBox>
  );
};

export default Home;
