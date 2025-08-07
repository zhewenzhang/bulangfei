import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import theme from './theme';
import Calculator from './components/Calculator';
import History from './components/History';

// Placeholder for the Account view
const Account = () => <Box sx={{ p: 3 }}><Typography variant="h4">Account</Typography></Box>;

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Residual Value Calculator
            </Typography>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
          {renderContent()}
        </Container>

        <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
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
        </AppBar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
