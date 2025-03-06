import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1b4b 0%, #2c1b47 100%)',
  padding: '20px',
  color: 'white'
}));

const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',
  padding: '15px',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  border: 'none',
  borderRadius: '12px',
  color: 'white',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  '&:hover': {
    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '20px'
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  color: 'white',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  '& .MuiSvgIcon-root': {
    color: 'white',
  }
}));

const AddExpense = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    currency: 'CAD ($)',
    payment_method: 'Physical Cash'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (!formData.category && data.length > 0) {
            setFormData(prev => ({ ...prev, category: data[0].name }));
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.amount || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    // Convert amount to number
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.error('Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <StyledBox>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Add Expenses
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

      <InputContainer>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          NAME
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Enter expense name"
          sx={{
            input: { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }
            }
          }}
        />
      </InputContainer>

      <InputContainer>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          CATEGORY
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StyledSelect
            value={formData.category}
            onChange={handleChange('category')}
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={category.icon} alt={category.name} style={{ width: 20, height: 20 }} />
                  {category.name}
                </Box>
              </MenuItem>
            ))}  
          </StyledSelect>
          <IconButton 
            onClick={() => setNewCategoryDialog(true)}
            sx={{ 
              color: 'white',
              '&:hover': { 
                color: '#8b5cf6'
              }
            }}
          >
            <AddCircleOutlineIcon />
          </IconButton>
        </Box>
      </InputContainer>

      <InputContainer>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          AMOUNT
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          sx={{
            input: { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }
            }
          }}
          value={formData.amount}
          onChange={handleChange('amount')}
          placeholder="Enter amount"
        />
      </InputContainer>

      <InputContainer>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          CURRENCY
        </Typography>
        <StyledSelect
          value={formData.currency}
          onChange={handleChange('currency')}
        >
          <MenuItem value="CAD ($)">CAD ($)</MenuItem>
          <MenuItem value="USD ($)">USD ($)</MenuItem>
          <MenuItem value="EUR (€)">EUR (€)</MenuItem>
        </StyledSelect>
      </InputContainer>

      <InputContainer>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          PAYMENT METHOD
        </Typography>
        <StyledSelect
          value={formData.payment_method}
          onChange={handleChange('payment_method')}
        >
          <MenuItem value="Physical Cash">Physical Cash</MenuItem>
          <MenuItem value="Credit Card">Credit Card</MenuItem>
          <MenuItem value="Debit Card">Debit Card</MenuItem>
          <MenuItem value="UPI">UPI</MenuItem>
        </StyledSelect>
      </InputContainer>

        <Box sx={{ mt: 4 }}>
          <StyledButton as="button" type="submit">
            Add Expense
          </StyledButton>
        </Box>
      </form>
      <Dialog 
        open={newCategoryDialog} 
        onClose={() => setNewCategoryDialog(false)}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            margin="dense"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <StyledButton 
            onClick={() => setNewCategoryDialog(false)}
            style={{ 
              background: 'transparent', 
              border: '1px solid rgba(255, 255, 255, 0.23)',
              width: 'auto',
              padding: '8px 16px'
            }}
          >
            Cancel
          </StyledButton>
          <StyledButton 
            onClick={async () => {
              if (newCategory.trim()) {
                try {
                  const response = await fetch('http://localhost:5001/api/categories', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: newCategory.trim() })
                  });

                  if (response.ok) {
                    const newCat = await response.json();
                    setCategories(prev => [...prev, newCat]);
                    setFormData(prev => ({ ...prev, category: newCat.name }));
                    setNewCategory('');
                    setNewCategoryDialog(false);
                  } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to add category');
                  }
                } catch (error) {
                  console.error('Error adding category:', error);
                  alert('Failed to add category');
                }
              }
            }}
            style={{ 
              width: 'auto',
              padding: '8px 16px'
            }}
          >
            Add Category
          </StyledButton>
        </DialogActions>
      </Dialog>
    </StyledBox>
  );
};

export default AddExpense;
