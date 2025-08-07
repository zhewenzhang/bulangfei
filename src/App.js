import React, { useState, createContext, useContext } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { createAppTheme } from './theme';
import Calculator from './components/Calculator';
import History from './components/History';
import Account from './components/Account';
import AuthComponent from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 创建主题上下文
const ThemeContext = createContext();

// 主题上下文提供者
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};



// 主应用组件（需要认证的部分）
function MainApp() {
  const [value, setValue] = useState(0);
  const [themeMode, setThemeMode] = useState('dark');
  const { user, loading } = useAuth();

  const toggleTheme = () => {
    setThemeMode(prevMode => prevMode === 'dark' ? 'light' : 'dark');
  };

  const theme = createAppTheme(themeMode);

  // 如果正在加载，显示加载指示器
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <CircularProgress size={60} sx={{ color: 'white' }} />
        </Box>
      </ThemeProvider>
    );
  }

  // 如果用户未登录，显示登录界面
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthComponent />
      </ThemeProvider>
    );
  }

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

  // 用户已登录，显示主应用
  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Container component="main" sx={{ flexGrow: 1, py: 3, pb: 10 }}>
          {renderContent()}
        </Container>

        <AppBar position="fixed" color="primary" sx={{ 
           top: 'auto', 
           bottom: 0,
           background: themeMode === 'dark'
             ? 'rgba(28, 28, 30, 0.95)'
             : 'rgba(255, 255, 255, 0.95)',
           backdropFilter: 'blur(20px)',
           borderTop: themeMode === 'dark'
             ? '1px solid rgba(84, 84, 88, 0.6)'
             : '1px solid rgba(60, 60, 67, 0.29)'
         }}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
            sx={{
              background: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: 2,
                  transform: 'scale(1.05)',
                  transition: 'all 0.3s ease'
                },
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: 2
                }
              },
            }}
          >
            <BottomNavigationAction label="计算器" icon={<CalculateIcon />} />
            <BottomNavigationAction label="历史记录" icon={<HistoryIcon />} />
            <BottomNavigationAction label="设置" icon={<AccountCircleIcon />} />
          </BottomNavigation>
        </AppBar>
      </Box>
    </ThemeProvider>
    </ThemeContext.Provider>
  );
}

// 根应用组件
function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
