import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Button
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  Key as KeyIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

import ApiConfig from './ApiConfig';
import CategoryManager from './CategoryManager';
import { useLanguage } from '../contexts/LanguageContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Admin = () => {
  const [tabValue, setTabValue] = useState(0);
  const { language } = useLanguage();

  const texts = {
    zh: {
      title: '管理后台',
      subtitle: '系统配置与管理',
      backToApp: '返回应用',
      apiConfig: 'API 配置',
      categoryManagement: '分类管理',
      systemSettings: '系统设置',
      dataAnalytics: '数据分析',
      comingSoon: '功能开发中...',
      description: '在这里您可以管理应用的各项配置'
    },
    en: {
      title: 'Admin Panel',
      subtitle: 'System Configuration & Management',
      backToApp: 'Back to App',
      apiConfig: 'API Configuration',
      categoryManagement: 'Category Management',
      systemSettings: 'System Settings',
      dataAnalytics: 'Data Analytics',
      comingSoon: 'Coming Soon...',
      description: 'Manage your application configurations here'
    }
  };

  const t = texts[language] || texts.zh;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBackToApp = () => {
    window.location.href = '/';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 顶部导航栏 */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToApp}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <SettingsIcon sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {t.title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Button
            color="inherit"
            onClick={handleBackToApp}
            startIcon={<ArrowBackIcon />}
          >
            {t.backToApp}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* 欢迎信息 */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            🛠️ {t.title}
          </Typography>
          <Typography variant="body1">
            {t.description}
          </Typography>
        </Paper>

        {/* 标签页导航 */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontSize: '1rem'
              }
            }}
          >
            <Tab
              icon={<KeyIcon />}
              label={t.apiConfig}
              id="admin-tab-0"
              aria-controls="admin-tabpanel-0"
            />
            <Tab
              icon={<CategoryIcon />}
              label={t.categoryManagement}
              id="admin-tab-1"
              aria-controls="admin-tabpanel-1"
            />
            <Tab
              icon={<AnalyticsIcon />}
              label={t.dataAnalytics}
              id="admin-tab-2"
              aria-controls="admin-tabpanel-2"
            />
            <Tab
              icon={<SettingsIcon />}
              label={t.systemSettings}
              id="admin-tab-3"
              aria-controls="admin-tabpanel-3"
            />
          </Tabs>

          {/* API 配置页面 */}
          <TabPanel value={tabValue} index={0}>
            <ApiConfig />
          </TabPanel>

          {/* 分类管理页面 */}
          <TabPanel value={tabValue} index={1}>
            <CategoryManager />
          </TabPanel>

          {/* 数据分析页面 */}
          <TabPanel value={tabValue} index={2}>
            <Box textAlign="center" py={8}>
              <AnalyticsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {t.dataAnalytics}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.comingSoon}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                高级数据分析和报表功能正在开发中
              </Typography>
            </Box>
          </TabPanel>

          {/* 系统设置页面 */}
          <TabPanel value={tabValue} index={3}>
            <Box textAlign="center" py={8}>
              <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {t.systemSettings}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.comingSoon}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                系统配置和高级设置功能正在开发中
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default Admin;