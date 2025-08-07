import React from 'react';
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
} from '@mui/material';
import {
  Palette,
  Info,
  Security,
  Notifications,
  Logout,
  Email,
} from '@mui/icons-material';
import { useTheme } from '../App';
import { useAuth } from '../contexts/AuthContext';

function Account() {
  const { themeMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

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
      primary: '深色模式',
      secondary: '切换应用主题外观',
      action: (
        <Switch
          checked={themeMode === 'dark'}
          onChange={toggleTheme}
          color="primary"
        />
      ),
    },
    {
      icon: <Notifications />,
      primary: '通知设置',
      secondary: '管理应用通知偏好',
    },
    {
      icon: <Security />,
      primary: '隐私与安全',
      secondary: '数据保护和安全设置',
    },
    {
      icon: <Info />,
      primary: '关于应用',
      secondary: '版本信息和帮助',
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
            欢迎回来！
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Chip 
            label="已认证用户" 
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
              退出登录
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
              ⚙️ 应用设置
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
    </Box>
  );
}

export default Account;