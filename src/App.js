import React, { useState } from 'react';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './App.css';
import Calculator from './components/Calculator';
import History from './components/History';

// Placeholder for the Account view
const Account = () => <Box sx={{ p: 3, mb: 7 }}><h1>Account</h1></Box>;

function App() {
  const [value, setValue] = useState(0);

  const renderContent = () => {
    switch (value) {
      case 0:
        return <Calculator />;
      case 1:
        return <History />;
      case 2:
        return <Account />;
      default:
        return <Calculator />;
    }
  };

  return (
    <Box className="App">
      <Box className="content-area">
        {renderContent()}
      </Box>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction label="Calculator" icon={<CalculateIcon />} />
          <BottomNavigationAction label="History" icon={<HistoryIcon />} />
          <BottomNavigationAction label="Account" icon={<AccountCircleIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default App;
