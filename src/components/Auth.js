import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import { Box, Paper, IconButton, Container, useTheme as useMuiTheme, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

const AuthComponent = ({ onClose, isDialog = false }) => {
  const muiTheme = useMuiTheme();
  const { themeMode } = useTheme();
  const { t } = useLanguage();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isDark = themeMode === 'dark';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && onClose) {
        onClose();
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose]);

  // 动态localization配置
  const localizationConfig = {
    variables: {
      sign_in: {
        email_label: t('emailLabel'),
        password_label: t('passwordLabel'),
        button_label: t('signInButton'),
        loading_button_label: t('signInLoading'),
        social_provider_text: t('socialProviderText'),
        link_text: t('signInLinkText'),
      },
      sign_up: {
        email_label: t('emailLabel'),
        password_label: t('passwordLabel'),
        button_label: t('signUpButton'),
        loading_button_label: t('signUpLoading'),
        social_provider_text: t('socialProviderSignUpText'),
        link_text: t('signUpLinkText'),
        confirmation_text: t('signUpConfirmationText'),
      },
      forgotten_password: {
        email_label: t('emailLabel'),
        button_label: t('forgotPasswordButton'),
        loading_button_label: t('forgotPasswordLoading'),
        link_text: t('forgotPasswordLinkText'),
        confirmation_text: t('forgotPasswordConfirmationText'),
      },
    },
  };

  const isDialogMode = isDialog || onClose;

  const containerStyle = isDialogMode ? {
    padding: 0,
    minHeight: 'auto',
    background: 'transparent',
  } : {
    minHeight: '100vh',
    backgroundColor: isDark ? '#000000' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? 1 : 2,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDark 
        ? `
          radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.4) 0%, rgba(120, 119, 198, 0.1) 30%, transparent 70%),
          radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, rgba(255, 119, 198, 0.08) 30%, transparent 70%),
          radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.35) 0%, rgba(99, 102, 241, 0.1) 30%, transparent 70%)
        `
        : `
          radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.08) 30%, transparent 70%),
          radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.06) 30%, transparent 70%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0.07) 30%, transparent 70%)
        `,
      animation: 'veilFloat 6s ease-in-out infinite',
      filter: 'blur(1px)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDark
        ? `
          conic-gradient(from 0deg at 30% 30%, rgba(120, 119, 198, 0.15) 0deg, transparent 60deg, rgba(255, 119, 198, 0.12) 120deg, transparent 180deg, rgba(99, 102, 241, 0.18) 240deg, transparent 300deg, rgba(120, 119, 198, 0.15) 360deg),
          linear-gradient(45deg, transparent 20%, rgba(120, 119, 198, 0.08) 50%, transparent 80%),
          linear-gradient(-45deg, transparent 20%, rgba(255, 119, 198, 0.06) 50%, transparent 80%)
        `
        : `
          conic-gradient(from 0deg at 30% 30%, rgba(99, 102, 241, 0.1) 0deg, transparent 60deg, rgba(236, 72, 153, 0.08) 120deg, transparent 180deg, rgba(139, 92, 246, 0.12) 240deg, transparent 300deg, rgba(99, 102, 241, 0.1) 360deg),
          linear-gradient(45deg, transparent 20%, rgba(99, 102, 241, 0.05) 50%, transparent 80%),
          linear-gradient(-45deg, transparent 20%, rgba(236, 72, 153, 0.04) 50%, transparent 80%)
        `,
      animation: 'veilRotate 20s linear infinite, veilShift 8s ease-in-out infinite reverse',
      filter: 'blur(2px)',
    },
    '@keyframes veilFloat': {
      '0%, 100%': {
        transform: 'translateY(0px) scale(1)',
        opacity: 0.7,
      },
      '33%': {
        transform: 'translateY(-10px) scale(1.05)',
        opacity: 0.9,
      },
      '66%': {
        transform: 'translateY(5px) scale(0.95)',
        opacity: 0.8,
      },
    },
    '@keyframes veilShift': {
       '0%, 100%': {
         transform: 'translateX(0px) rotate(0deg)',
       },
       '25%': {
         transform: 'translateX(10px) rotate(1deg)',
       },
       '50%': {
         transform: 'translateX(-5px) rotate(-0.5deg)',
       },
       '75%': {
         transform: 'translateX(8px) rotate(0.8deg)',
       },
     },
     '@keyframes veilRotate': {
       '0%': {
         transform: 'rotate(0deg)',
       },
       '100%': {
         transform: 'rotate(360deg)',
       },
     },
  };

  // 添加动态粒子效果
  const particleStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '2px',
      height: '2px',
      backgroundColor: isDark ? 'rgba(120, 119, 198, 0.8)' : 'rgba(99, 102, 241, 0.6)',
      borderRadius: '50%',
      top: '20%',
      left: '10%',
      animation: 'particleFloat1 6s ease-in-out infinite',
      boxShadow: `
         0 0 10px ${isDark ? 'rgba(120, 119, 198, 1)' : 'rgba(99, 102, 241, 0.8)'},
         20px 30px 0 ${isDark ? 'rgba(255, 119, 198, 0.7)' : 'rgba(236, 72, 153, 0.5)'},
         40px 70px 0 ${isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.6)'},
         90px 40px 0 ${isDark ? 'rgba(120, 119, 198, 0.6)' : 'rgba(99, 102, 241, 0.4)'},
         130px 80px 0 ${isDark ? 'rgba(255, 119, 198, 0.9)' : 'rgba(236, 72, 153, 0.7)'},
         160px 30px 0 ${isDark ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.5)'},
         200px 60px 0 ${isDark ? 'rgba(120, 119, 198, 0.8)' : 'rgba(99, 102, 241, 0.6)'},
         240px 90px 0 ${isDark ? 'rgba(255, 119, 198, 0.6)' : 'rgba(236, 72, 153, 0.4)'},
         280px 20px 0 ${isDark ? 'rgba(139, 92, 246, 0.9)' : 'rgba(139, 92, 246, 0.7)'},
         320px 70px 0 ${isDark ? 'rgba(120, 119, 198, 0.7)' : 'rgba(99, 102, 241, 0.5)'},
         360px 50px 0 ${isDark ? 'rgba(255, 119, 198, 0.8)' : 'rgba(236, 72, 153, 0.6)'},
         400px 80px 0 ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)'},
         440px 10px 0 ${isDark ? 'rgba(120, 119, 198, 0.9)' : 'rgba(99, 102, 241, 0.7)'},
         480px 60px 0 ${isDark ? 'rgba(255, 119, 198, 0.7)' : 'rgba(236, 72, 153, 0.5)'},
         520px 35px 0 ${isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.6)'},
         560px 75px 0 ${isDark ? 'rgba(120, 119, 198, 0.6)' : 'rgba(99, 102, 241, 0.4)'},
         600px 45px 0 ${isDark ? 'rgba(255, 119, 198, 0.9)' : 'rgba(236, 72, 153, 0.7)'},
         640px 85px 0 ${isDark ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.5)'},
         680px 25px 0 ${isDark ? 'rgba(120, 119, 198, 0.8)' : 'rgba(99, 102, 241, 0.6)'},
         720px 65px 0 ${isDark ? 'rgba(255, 119, 198, 0.6)' : 'rgba(236, 72, 153, 0.4)'},
         760px 15px 0 ${isDark ? 'rgba(139, 92, 246, 0.9)' : 'rgba(139, 92, 246, 0.7)'},
         800px 55px 0 ${isDark ? 'rgba(120, 119, 198, 0.7)' : 'rgba(99, 102, 241, 0.5)'},
         840px 95px 0 ${isDark ? 'rgba(255, 119, 198, 0.8)' : 'rgba(236, 72, 153, 0.6)'},
         880px 35px 0 ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)'},
         920px 75px 0 ${isDark ? 'rgba(120, 119, 198, 0.9)' : 'rgba(99, 102, 241, 0.7)'},
         960px 5px 0 ${isDark ? 'rgba(255, 119, 198, 0.7)' : 'rgba(236, 72, 153, 0.5)'},
         1000px 85px 0 ${isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.6)'},
         1040px 45px 0 ${isDark ? 'rgba(120, 119, 198, 0.6)' : 'rgba(99, 102, 241, 0.4)'},
         1080px 25px 0 ${isDark ? 'rgba(255, 119, 198, 0.9)' : 'rgba(236, 72, 153, 0.7)'},
         1120px 65px 0 ${isDark ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.5)'},
         1160px 95px 0 ${isDark ? 'rgba(120, 119, 198, 0.8)' : 'rgba(99, 102, 241, 0.6)'},
         1200px 15px 0 ${isDark ? 'rgba(255, 119, 198, 0.6)' : 'rgba(236, 72, 153, 0.4)'},
         1240px 55px 0 ${isDark ? 'rgba(139, 92, 246, 0.9)' : 'rgba(139, 92, 246, 0.7)'},
         1280px 75px 0 ${isDark ? 'rgba(120, 119, 198, 0.7)' : 'rgba(99, 102, 241, 0.5)'},
         1320px 35px 0 ${isDark ? 'rgba(255, 119, 198, 0.8)' : 'rgba(236, 72, 153, 0.6)'},
         1360px 85px 0 ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)'},
         1400px 5px 0 ${isDark ? 'rgba(120, 119, 198, 0.9)' : 'rgba(99, 102, 241, 0.7)'},
         1440px 65px 0 ${isDark ? 'rgba(255, 119, 198, 0.7)' : 'rgba(236, 72, 153, 0.5)'},
         1480px 45px 0 ${isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.6)'},
         1520px 25px 0 ${isDark ? 'rgba(120, 119, 198, 0.6)' : 'rgba(99, 102, 241, 0.4)'},
         1560px 95px 0 ${isDark ? 'rgba(255, 119, 198, 0.9)' : 'rgba(236, 72, 153, 0.7)'},
         1600px 55px 0 ${isDark ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.5)'},
         1640px 15px 0 ${isDark ? 'rgba(120, 119, 198, 0.8)' : 'rgba(99, 102, 241, 0.6)'},
         1680px 75px 0 ${isDark ? 'rgba(255, 119, 198, 0.6)' : 'rgba(236, 72, 153, 0.4)'},
         1720px 85px 0 ${isDark ? 'rgba(139, 92, 246, 0.9)' : 'rgba(139, 92, 246, 0.7)'},
         1760px 35px 0 ${isDark ? 'rgba(120, 119, 198, 0.7)' : 'rgba(99, 102, 241, 0.5)'},
         1800px 65px 0 ${isDark ? 'rgba(255, 119, 198, 0.8)' : 'rgba(236, 72, 153, 0.6)'},
         1840px 45px 0 ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)'},
         1880px 5px 0 ${isDark ? 'rgba(120, 119, 198, 0.9)' : 'rgba(99, 102, 241, 0.7)'},
         1920px 95px 0 ${isDark ? 'rgba(255, 119, 198, 0.7)' : 'rgba(236, 72, 153, 0.5)'}
       `,
    },
    '@keyframes particleFloat1': {
      '0%, 100%': {
        transform: 'translateY(0px) translateX(0px)',
        opacity: 1,
      },
      '25%': {
        transform: 'translateY(-20px) translateX(10px)',
        opacity: 0.8,
      },
      '50%': {
        transform: 'translateY(-40px) translateX(-5px)',
        opacity: 0.6,
      },
      '75%': {
        transform: 'translateY(-20px) translateX(15px)',
        opacity: 0.9,
      },
    },
  };

  const paperStyle = {
    padding: isDialogMode 
      ? (isMobile ? 2 : 3)
      : (isMobile ? 3 : isTablet ? 4 : 5),
    maxWidth: isDialogMode 
      ? '100%'
      : (isMobile ? '100%' : isTablet ? 450 : 500),
    width: '100%',
    borderRadius: isDialogMode ? 0 : 3,
    position: 'relative',
    background: isDialogMode 
      ? isDark
        ? 'rgba(28, 28, 30, 0.95)'
        : 'rgba(255, 255, 255, 0.95)'
      : isDark
        ? 'rgba(28, 28, 30, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: isDialogMode 
      ? isDark
        ? '1px solid rgba(84, 84, 88, 0.6)'
        : '1px solid rgba(255, 255, 255, 0.2)'
      : isDark
        ? '1px solid rgba(84, 84, 88, 0.6)'
        : '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: isDialogMode 
      ? isDark
        ? '0 10px 30px rgba(0, 0, 0, 0.8)'
        : '0 10px 30px rgba(0, 0, 0, 0.15)'
      : isDark
        ? '0 20px 60px rgba(0, 0, 0, 0.5)'
        : '0 20px 60px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: isDialogMode ? 'none' : 'translateY(-5px)',
      boxShadow: isDialogMode 
        ? isDark
          ? '0 15px 40px rgba(0, 0, 0, 0.9)'
          : '0 15px 40px rgba(0, 0, 0, 0.2)'
        : isDark
          ? '0 25px 70px rgba(0, 0, 0, 0.6)'
          : '0 25px 70px rgba(0, 0, 0, 0.25)',
    },
  };

  return (
    <Box sx={containerStyle}>
      {!isDialogMode && <Box sx={particleStyle} />}
      {!isDialogMode && (
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3))',
            borderRadius: '50%',
            animation: 'float 4s ease-in-out infinite',
            zIndex: 0,
          }}
        />
      )}
      {!isDialogMode && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))',
            borderRadius: '50%',
            animation: 'float 5s ease-in-out infinite reverse',
            zIndex: 0,
          }}
        />
      )}
      
      {isDialogMode ? (
        <Box sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Paper elevation={0} sx={paperStyle}>
            {onClose && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                pt: 1
              }}>
                <Box sx={{ width: 40 }} />
                <Box sx={{ 
                  width: 40, 
                  height: 4, 
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', 
                  borderRadius: 2,
                  cursor: 'pointer'
                }} onClick={onClose} />
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            

            
            <Box
              sx={{
                '& .supabase-auth-ui_ui-container': {
                  gap: '1rem',
                },
                '& .supabase-auth-ui_ui-button': {
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  },
                  '&[data-supabase-button-type="default"]': {
                    backgroundColor: isDark ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    color: isDark ? '#ffffff' : '#000000',
                    border: isDark ? '1px solid rgba(84, 84, 88, 0.6)' : '1px solid rgba(0, 0, 0, 0.1)',
                  },
                },
                '& .supabase-auth-ui_ui-input': {
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '0.95rem',
                border: isDark ? '1.5px solid rgba(84, 84, 88, 0.6)' : '1.5px solid rgba(0, 0, 0, 0.1)',
                backgroundColor: isDark ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                color: isDark ? '#ffffff' : '#000000',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                },
              },
              '& .supabase-auth-ui_ui-label': {
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#374151',
                marginBottom: '6px',
              },
                '& .supabase-auth-ui_ui-anchor': {
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#764ba2',
                    textDecoration: 'underline',
                  },
                },
                '& .supabase-auth-ui_ui-divider': {
                  margin: '1.5rem 0',
                  opacity: 0.3,
                },
              }}
            >
              <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#667eea',
                      brandAccent: '#764ba2',
                      brandButtonText: 'white',
                      defaultButtonBackground: isDark ? '#44444a' : '#f8f9fa',
                      defaultButtonBackgroundHover: isDark ? '#5a5a62' : '#e9ecef',
                      inputBackground: isDark ? 'rgba(44, 44, 46, 0.9)' : 'white',
                      inputBorder: isDark ? 'rgba(84, 84, 88, 0.6)' : 'rgba(0, 0, 0, 0.1)',
                      inputBorderHover: '#667eea',
                      inputBorderFocus: '#667eea',
                      inputText: isDark ? '#ffffff' : '#000000',
                    inputLabelText: isDark ? '#ffffff' : '#374151',
                    defaultButtonText: isDark ? '#ffffff' : '#000000',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1.5px',
                      inputBorderWidth: '1.5px',
                    },
                    radii: {
                      borderRadiusButton: '12px',
                      buttonBorderRadius: '12px',
                      inputBorderRadius: '10px',
                    },
                  },
                },
              }}
                localization={localizationConfig}
                providers={['google']}
              />
            </Box>
          </Paper>
        </Box>
      ) : (
         <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
           <Paper elevation={0} sx={paperStyle}>
          {onClose && (
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 12,
                top: 12,
                color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
          

          
          <Box
            sx={{
              '& .supabase-auth-ui_ui-container': {
                gap: '1.5rem',
              },
              '& .supabase-auth-ui_ui-button': {
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                },
                '&[data-supabase-button-type="default"]': {
                  backgroundColor: isDark ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  color: isDark ? '#ffffff' : '#000000',
                  border: isDark ? '1px solid rgba(84, 84, 88, 0.6)' : '1px solid rgba(0, 0, 0, 0.1)',
                },
              },
              '& .supabase-auth-ui_ui-input': {
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '1rem',
              border: isDark ? '2px solid rgba(84, 84, 88, 0.6)' : '2px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: isDark ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              color: isDark ? '#ffffff' : '#000000',
              transition: 'all 0.3s ease',
              '&:focus': {
                borderColor: '#667eea',
                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
              },
            },
            '& .supabase-auth-ui_ui-label': {
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isDark ? '#ffffff' : '#374151',
              marginBottom: '8px',
            },
              '& .supabase-auth-ui_ui-anchor': {
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#764ba2',
                  textDecoration: 'underline',
                },
              },
              '& .supabase-auth-ui_ui-divider': {
                margin: '2rem 0',
                opacity: 0.3,
              },
            }}
          >
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#667eea',
                      brandAccent: '#764ba2',
                      brandButtonText: 'white',
                      defaultButtonBackground: isDark ? '#44444a' : '#f8f9fa',
                      defaultButtonBackgroundHover: isDark ? '#5a5a62' : '#e9ecef',
                      inputBackground: isDark ? 'rgba(44, 44, 46, 0.9)' : 'white',
                      inputBorder: isDark ? 'rgba(84, 84, 88, 0.6)' : 'rgba(0, 0, 0, 0.1)',
                      inputBorderHover: '#667eea',
                      inputBorderFocus: '#667eea',
                      inputText: isDark ? '#ffffff' : '#000000',
                    inputLabelText: isDark ? '#ffffff' : '#374151',
                    defaultButtonText: isDark ? '#ffffff' : '#000000',
                    },
                    borderWidths: {
                      buttonBorderWidth: '2px',
                      inputBorderWidth: '2px',
                    },
                    radii: {
                      borderRadiusButton: '12px',
                      buttonBorderRadius: '12px',
                      inputBorderRadius: '12px',
                    },
                  },
                },
              }}
              localization={localizationConfig}
              providers={['google']}
            />
           </Box>
         </Paper>
         </Container>
       )}
     </Box>
   );
};

export default AuthComponent;