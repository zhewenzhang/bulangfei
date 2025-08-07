import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import { Box, Paper, Typography } from '@mui/material';

const AuthComponent = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 1,
          }}
        >
          用的明明白白
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            marginBottom: 3,
          }}
        >
          物品残值管理
        </Typography>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#667eea',
                  brandAccent: '#764ba2',
                }
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '登录',
                loading_button_label: '登录中...',
                social_provider_text: '使用{{provider}}登录',
                link_text: '已有账户？点击登录',
              },
              sign_up: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '注册',
                loading_button_label: '注册中...',
                social_provider_text: '使用{{provider}}注册',
                link_text: '没有账户？点击注册',
                confirmation_text: '请检查您的邮箱并点击确认链接',
              },
              forgotten_password: {
                email_label: '邮箱地址',
                button_label: '发送重置链接',
                loading_button_label: '发送中...',
                link_text: '忘记密码？',
                confirmation_text: '请检查您的邮箱获取密码重置链接',
              },
            },
          }}
          providers={['google']}
        />
      </Paper>
    </Box>
  );
};

export default AuthComponent;