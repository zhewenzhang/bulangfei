import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Switch,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  Drawer,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from '@mui/material';
import {
  Palette,
  Info,
  Security,
  Notifications,
  Logout,
  Email,
  Language,
  Close,
} from '@mui/icons-material';
import { useTheme } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

function Account() {
  const { themeMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const languages = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleLanguageDialogClose = () => {
    setLanguageDialogOpen(false);
  };

  const handleLanguageSave = () => {
    changeLanguage(selectedLanguage);
    setLanguageDialogOpen(false);
  };

  // 当语言上下文中的语言改变时，更新本地选择的语言
  React.useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const settingsItems = [
    {
      icon: <Palette />,
      primary: t('darkMode'),
      secondary: t('switchTheme'),
      action: (
        <Switch
          checked={themeMode === 'dark'}
          onChange={toggleTheme}
          color="primary"
        />
      ),
    },
    {
      icon: <Language />,
      primary: t('languageRegion'),
      secondary: t('selectAppLanguage'),
      action: (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setLanguageDialogOpen(true)}
          sx={{
            textTransform: 'none',
            minWidth: 'auto',
            px: 2,
          }}
        >
          {languages.find(lang => lang.code === selectedLanguage)?.flag} {languages.find(lang => lang.code === selectedLanguage)?.name}
        </Button>
      ),
    },
    {
      icon: <Notifications />,
      primary: t('notificationSettings'),
      secondary: t('manageNotificationPreferences'),
    },
    {
      icon: <Security />,
      primary: t('privacySecurity'),
      secondary: t('dataProtectionSecuritySettings'),
    },
    {
      icon: <Info />,
      primary: t('aboutApp'),
      secondary: t('versionInfoHelp'),
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      {/* 用户信息卡片 */}
      <Card
        sx={{
          mb: 3,
          background: themeMode === 'dark'
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
            : 'linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(90, 200, 250, 0.1))',
          border: themeMode === 'dark'
            ? '1px solid rgba(99, 102, 241, 0.3)'
            : '1px solid rgba(0, 122, 255, 0.3)',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              background: themeMode === 'dark'
                ? 'linear-gradient(45deg, #6366f1, #8b5cf6)'
                : 'linear-gradient(45deg, #007AFF, #5AC8FA)',
              fontSize: '2rem',
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || '👤'}
          </Avatar>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: themeMode === 'dark'
                ? 'linear-gradient(45deg, #6366f1, #ec4899)'
                : 'linear-gradient(45deg, #007AFF, #FF3B30)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('welcomeBack')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Chip 
            label={t('verifiedUser')} 
            color="success" 
            size="small"
            sx={{ mb: 2 }}
          />
          <Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleSignOut}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('logout')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 设置选项卡片 */}
      <Card>
        <CardHeader
          title={
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: themeMode === 'dark'
                  ? 'linear-gradient(45deg, #6366f1, #ec4899)'
                  : 'linear-gradient(45deg, #007AFF, #FF3B30)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('appSettings')}
            </Typography>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <List>
            {settingsItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      background: themeMode === 'dark'
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(0, 122, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: themeMode === 'dark' ? '#6366f1' : '#007AFF',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600}>
                        {item.primary}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {item.secondary}
                      </Typography>
                    }
                  />
                  {item.action && (
                    <ListItemSecondaryAction>
                      {item.action}
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                {index < settingsItems.length - 1 && (
                  <Divider sx={{ my: 1, opacity: 0.5 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* 应用信息 */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          残值计算器 v1.0.0
        </Typography>
        <Typography variant="body2" color="text.secondary">
          © 2024 残值计算器团队
        </Typography>
      </Box>

      {/* 语言选择底部弹窗 */}
      <Drawer
        anchor="bottom"
        open={languageDialogOpen}
        onClose={handleLanguageDialogClose}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70vh',
            background: themeMode === 'dark'
              ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(50, 50, 50, 0.95))'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* 顶部拖拽指示器 */}
          <Box
            sx={{
              width: 40,
              height: 4,
              backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              borderRadius: 2,
              mx: 'auto',
              mb: 2,
            }}
          />
          
          {/* 标题栏 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: themeMode === 'dark'
                  ? 'linear-gradient(45deg, #6366f1, #ec4899)'
                  : 'linear-gradient(45deg, #007AFF, #FF3B30)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('selectLanguage')}
            </Typography>
            <IconButton
              onClick={handleLanguageDialogClose}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: themeMode === 'dark'
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(0, 122, 255, 0.1)',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* 语言选项 */}
          <RadioGroup
            value={selectedLanguage}
            onChange={handleLanguageChange}
            sx={{ gap: 1 }}
          >
            {languages.map((language) => (
              <FormControlLabel
                key={language.code}
                value={language.code}
                control={<Radio color="primary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                      {language.flag}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {language.name}
                    </Typography>
                  </Box>
                }
                sx={{
                  m: 0,
                  width: '100%',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  border: themeMode === 'dark'
                    ? '1px solid rgba(99, 102, 241, 0.2)'
                    : '1px solid rgba(0, 122, 255, 0.2)',
                  background: selectedLanguage === language.code
                    ? (themeMode === 'dark'
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(0, 122, 255, 0.1)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: themeMode === 'dark'
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'rgba(0, 122, 255, 0.1)',
                    transform: 'translateY(-1px)',
                    boxShadow: themeMode === 'dark'
                      ? '0 4px 12px rgba(99, 102, 241, 0.2)'
                      : '0 4px 12px rgba(0, 122, 255, 0.2)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            ))}
          </RadioGroup>

          {/* 底部按钮 */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 2 }}>
            <Button
              onClick={handleLanguageDialogClose}
              variant="outlined"
              fullWidth
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                borderColor: themeMode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(0, 122, 255, 0.5)',
                color: themeMode === 'dark' ? '#6366f1' : '#007AFF',
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleLanguageSave}
              variant="contained"
              fullWidth
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                background: themeMode === 'dark'
                  ? 'linear-gradient(45deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(45deg, #007AFF, #5AC8FA)',
                boxShadow: themeMode === 'dark'
                  ? '0 4px 12px rgba(99, 102, 241, 0.3)'
                  : '0 4px 12px rgba(0, 122, 255, 0.3)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: themeMode === 'dark'
                    ? '0 6px 16px rgba(99, 102, 241, 0.4)'
                    : '0 6px 16px rgba(0, 122, 255, 0.4)',
                },
              }}
            >
              {t('confirm')}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

export default Account;