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
  Alert,
  Snackbar,
  Button
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { createAppTheme } from './theme';
import Calculator from './components/Calculator';
import History from './components/History';
import Account from './components/Account';
import Analytics from './components/Analytics';
import Admin from './components/Admin';
import ModelSpeedTest from './components/ModelSpeedTest';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

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
  const [themeMode, setThemeMode] = useState('dark');
  const { loading, networkError, retryConnection, retryCount } = useAuth();
  // const { t } = useLanguage(); // 暂时注释掉未使用的翻译功能
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);

  const toggleTheme = () => {
    setThemeMode(prevMode => prevMode === 'dark' ? 'light' : 'dark');
  };

  // 监听网络错误状态
  React.useEffect(() => {
    if (networkError) {
      setShowNetworkAlert(true);
    }
  }, [networkError]);

  // 处理网络错误提示关闭
  const handleNetworkAlertClose = () => {
    setShowNetworkAlert(false);
  };

  // 手动重试连接
  const handleRetryConnection = () => {
    retryConnection();
    setShowNetworkAlert(false);
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

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MainContent 
          themeMode={themeMode}
          showNetworkAlert={showNetworkAlert}
          handleNetworkAlertClose={handleNetworkAlertClose}
          handleRetryConnection={handleRetryConnection}
          retryCount={retryCount}
          networkError={networkError}
        />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

function MainContent({ themeMode, showNetworkAlert, handleNetworkAlertClose, handleRetryConnection, retryCount, networkError }) {
  const { t } = useLanguage();
  const [value, setValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路径设置底部导航的值
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') setValue(0);
    else if (path === '/history') setValue(1);
    else if (path === '/analytics') setValue(2);
    else if (path === '/account') setValue(3);
  }, [location.pathname]);

  const handleNavigationChange = (event, newValue) => {
    setValue(newValue);
    const paths = ['/', '/history', '/analytics', '/account'];
    navigate(paths[newValue]);
  };



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container component="main" sx={{ flexGrow: 1, py: 3, pb: 10 }}>
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/account" element={<Account />} />
          <Route path="/speed-test" element={<ModelSpeedTest />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
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
          onChange={handleNavigationChange}
          sx={{
            background: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem',
              '&.Mui-selected': {
                color: 'primary.main',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: 2
              },

            },
          }}
        >
          <BottomNavigationAction label={t('calculate')} icon={<CalculateIcon />} />
          <BottomNavigationAction label={t('shoppingAnalysis')} icon={<HistoryIcon />} />
          <BottomNavigationAction label="購物旅程" icon={<AnalyticsIcon />} />
          <BottomNavigationAction label={t('profile')} icon={<AccountCircleIcon />} />
        </BottomNavigation>
      </AppBar>


      
      {/* 网络错误提示 */}
      <Snackbar
        open={showNetworkAlert}
        autoHideDuration={6000}
        onClose={handleNetworkAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleNetworkAlertClose}
          severity="warning"
          sx={{ width: '100%' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRetryConnection}
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? '重试次数已达上限' : '重试连接'}
            </Button>
          }
        >
          {networkError || 'Supabase连接出现问题，可能是网络变化导致的。'}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// 根应用组件
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
