import React from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Fab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';

const StyledBottomNav = styled(BottomNavigation)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  width: '100%',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: 1000
}));

const StyledNavAction = styled(BottomNavigationAction)({
  color: 'rgba(255, 255, 255, 0.6) !important',
  '&.Mui-selected': {
    color: 'white !important',
  },
});

const AddButton = styled(Fab)(({ theme }) => ({
  position: 'absolute',
  top: -30,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
  },
  width: '60px',
  height: '60px',
  borderRadius: '16px',
  zIndex: 1001
}));

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToIndex = {
    '/': 0,
    '/stats': 1,
    '/wallet': 2,
    '/profile': 3
  };

  const handleNavigation = (event, newValue) => {
    const paths = ['/', '/stats', '/wallet', '/profile'];
    navigate(paths[newValue]);
  };

  return (
    <Box sx={{ pb: 7, position: 'relative' }}>
      <StyledBottomNav
        value={pathToIndex[location.pathname] || 0}
        onChange={handleNavigation}
      >
        <StyledNavAction icon={<HomeIcon />} />
        <StyledNavAction icon={<BarChartIcon />} />
        <StyledNavAction icon={<AccountBalanceWalletIcon />} />
        <StyledNavAction icon={<PersonIcon />} />
      </StyledBottomNav>
      <AddButton onClick={() => navigate('/add')}>
        <AddIcon />
      </AddButton>
    </Box>
  );
};

export default BottomNav;
