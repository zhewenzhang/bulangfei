import { createTheme } from '@mui/material/styles';

// Create a modern, beautiful theme with iOS-style neumorphism
export const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#6366f1' : '#007AFF',
      light: mode === 'dark' ? '#818cf8' : '#5AC8FA',
      dark: mode === 'dark' ? '#4f46e5' : '#0051D5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'dark' ? '#ec4899' : '#FF3B30',
      light: mode === 'dark' ? '#f472b6' : '#FF6B6B',
      dark: mode === 'dark' ? '#db2777' : '#D70015',
    },
    success: {
      main: mode === 'dark' ? '#10b981' : '#34C759',
      light: mode === 'dark' ? '#34d399' : '#63E6BE',
      dark: mode === 'dark' ? '#059669' : '#248A3D',
    },
    warning: {
      main: mode === 'dark' ? '#f59e0b' : '#FF9500',
      light: mode === 'dark' ? '#fbbf24' : '#FFB340',
      dark: mode === 'dark' ? '#d97706' : '#CC7700',
    },
    error: {
      main: mode === 'dark' ? '#ef4444' : '#FF3B30',
      light: mode === 'dark' ? '#f87171' : '#FF6B6B',
      dark: mode === 'dark' ? '#dc2626' : '#D70015',
    },
    background: {
      default: mode === 'dark' 
        ? 'linear-gradient(135deg, #000000 0%, #1c1c1e 50%, #2c2c2e 100%)'
        : 'linear-gradient(135deg, #f2f2f7 0%, #ffffff 50%, #f9f9f9 100%)',
      paper: mode === 'dark' 
        ? 'rgba(28, 28, 30, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#000000',
      secondary: mode === 'dark' ? '#8e8e93' : '#6d6d70',
    },
    divider: mode === 'dark' ? 'rgba(84, 84, 88, 0.6)' : 'rgba(60, 60, 67, 0.29)',
  },
  typography: {
    fontFamily: mode === 'dark' 
      ? '"SF Pro Display", "Inter", "Roboto", "Helvetica", "Arial", sans-serif'
      : '"SF Pro Text", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: 'clamp(3rem, 8vw, 6rem)',
      fontWeight: 900,
      letterSpacing: '-0.02em',
      background: mode === 'dark'
        ? 'linear-gradient(45deg, #6366f1, #ec4899)'
        : 'linear-gradient(45deg, #007AFF, #FF3B30)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      position: 'relative',
      display: 'inline-block',
      animation: 'glitch 2s infinite',
      '&::before, &::after': {
        content: 'attr(data-text)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: mode === 'dark'
          ? 'linear-gradient(45deg, #6366f1, #ec4899)'
          : 'linear-gradient(45deg, #007AFF, #FF3B30)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      '&::before': {
        animation: 'glitch-1 0.5s infinite',
        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
        transform: 'translate(-2px, -2px)',
        opacity: 0.8,
      },
      '&::after': {
        animation: 'glitch-2 0.5s infinite',
        clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
        transform: 'translate(2px, 2px)',
        opacity: 0.8,
      },
      '&:hover': {
        animation: 'glitch 0.3s infinite',
        '&::before': {
          animation: 'glitch-1 0.2s infinite',
        },
        '&::after': {
          animation: 'glitch-2 0.2s infinite',
        },
      },
      '@keyframes glitch': {
        '0%, 100%': {
          transform: 'translate(0)',
        },
        '20%': {
          transform: 'translate(-2px, 2px)',
        },
        '40%': {
          transform: 'translate(-2px, -2px)',
        },
        '60%': {
          transform: 'translate(2px, 2px)',
        },
        '80%': {
          transform: 'translate(2px, -2px)',
        },
      },
      '@keyframes glitch-1': {
        '0%, 100%': {
          transform: 'translate(0)',
          filter: 'hue-rotate(0deg)',
        },
        '20%': {
          transform: 'translate(-2px, 2px)',
          filter: 'hue-rotate(90deg)',
        },
        '40%': {
          transform: 'translate(-2px, -2px)',
          filter: 'hue-rotate(180deg)',
        },
        '60%': {
          transform: 'translate(2px, 2px)',
          filter: 'hue-rotate(270deg)',
        },
        '80%': {
          transform: 'translate(2px, -2px)',
          filter: 'hue-rotate(360deg)',
        },
      },
      '@keyframes glitch-2': {
        '0%, 100%': {
          transform: 'translate(0)',
          filter: 'hue-rotate(0deg)',
        },
        '20%': {
          transform: 'translate(2px, -2px)',
          filter: 'hue-rotate(45deg)',
        },
        '40%': {
          transform: 'translate(2px, 2px)',
          filter: 'hue-rotate(135deg)',
        },
        '60%': {
          transform: 'translate(-2px, -2px)',
          filter: 'hue-rotate(225deg)',
        },
        '80%': {
          transform: 'translate(-2px, 2px)',
          filter: 'hue-rotate(315deg)',
        },
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      background: mode === 'dark'
        ? 'linear-gradient(45deg, #6366f1, #ec4899)'
        : 'linear-gradient(45deg, #007AFF, #FF3B30)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '-0.003em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '-0.003em',
    },
  },
  shape: {
    borderRadius: mode === 'dark' ? 16 : 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #000000 0%, #1c1c1e 50%, #2c2c2e 100%)'
            : 'linear-gradient(135deg, #f2f2f7 0%, #ffffff 50%, #f9f9f9 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'rgba(28, 28, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: mode === 'dark'
            ? '1px solid rgba(84, 84, 88, 0.6)'
            : '1px solid rgba(60, 60, 67, 0.29)',
          boxShadow: mode === 'dark'
            ? '0 1px 0 rgba(84, 84, 88, 0.6), 0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 1px 0 rgba(60, 60, 67, 0.29), 0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'rgba(28, 28, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: mode === 'dark'
            ? '1px solid rgba(84, 84, 88, 0.6)'
            : '1px solid rgba(60, 60, 67, 0.29)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'rgba(28, 28, 30, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: mode === 'dark'
            ? '1px solid rgba(84, 84, 88, 0.6)'
            : '1px solid rgba(60, 60, 67, 0.29)',
          borderRadius: mode === 'dark' ? 20 : 16,
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: mode === 'dark'
              ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 16px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)',
            border: mode === 'dark'
              ? '1px solid rgba(99, 102, 241, 0.4)'
              : '1px solid rgba(0, 122, 255, 0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: mode === 'dark' ? 12 : 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '1rem',
          letterSpacing: '-0.003em',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            transform: 'translateY(-1px) scale(1.02)',
          },
        },
        contained: {
          background: mode === 'dark'
            ? 'linear-gradient(45deg, #6366f1, #8b5cf6)'
            : 'linear-gradient(45deg, #007AFF, #5AC8FA)',
          boxShadow: mode === 'dark'
            ? '0 4px 16px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 4px 16px rgba(0, 122, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          '&:hover': {
            background: mode === 'dark'
              ? 'linear-gradient(45deg, #5b21b6, #7c3aed)'
              : 'linear-gradient(45deg, #0051D5, #007AFF)',
            boxShadow: mode === 'dark'
              ? '0 8px 24px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
              : '0 8px 24px rgba(0, 122, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 1)',
          },
        },
        outlined: {
          borderColor: mode === 'dark' ? 'rgba(84, 84, 88, 0.6)' : 'rgba(60, 60, 67, 0.29)',
          background: mode === 'dark'
            ? 'rgba(28, 28, 30, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderColor: mode === 'dark' ? '#6366f1' : '#007AFF',
            background: mode === 'dark'
              ? 'rgba(99, 102, 241, 0.1)'
              : 'rgba(0, 122, 255, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: mode === 'dark' ? 12 : 10,
            background: mode === 'dark'
              ? 'rgba(28, 28, 30, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            fontSize: '1rem',
            letterSpacing: '-0.003em',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '& fieldset': {
              borderColor: mode === 'dark'
                ? 'rgba(84, 84, 88, 0.6)'
                : 'rgba(60, 60, 67, 0.29)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark'
                ? 'rgba(99, 102, 241, 0.5)'
                : 'rgba(0, 122, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'dark' ? '#6366f1' : '#007AFF',
              boxShadow: mode === 'dark'
                ? '0 0 0 3px rgba(99, 102, 241, 0.1)'
                : '0 0 0 3px rgba(0, 122, 255, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '1rem',
            letterSpacing: '-0.003em',
            '&.Mui-focused': {
              color: mode === 'dark' ? '#6366f1' : '#007AFF',
            },
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: mode === 'dark' ? 16 : 12,
          background: mode === 'dark'
            ? 'rgba(28, 28, 30, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: mode === 'dark'
            ? '1px solid rgba(84, 84, 88, 0.6)'
            : '1px solid rgba(60, 60, 67, 0.29)',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
            : 'linear-gradient(45deg, rgba(0, 122, 255, 0.1), rgba(90, 200, 250, 0.1))',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '-0.003em',
            color: mode === 'dark' ? '#ffffff' : '#000000',
            borderBottom: mode === 'dark'
              ? '2px solid rgba(99, 102, 241, 0.3)'
              : '2px solid rgba(0, 122, 255, 0.3)',
            '&:hover': {
              background: mode === 'dark'
                ? 'rgba(99, 102, 241, 0.1)'
                : 'rgba(0, 122, 255, 0.1)',
            },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            background: mode === 'dark'
              ? 'rgba(99, 102, 241, 0.05)'
              : 'rgba(0, 122, 255, 0.05)',
          },
          '&:hover': {
            background: mode === 'dark'
              ? 'rgba(99, 102, 241, 0.1)'
              : 'rgba(0, 122, 255, 0.1)',
            transform: 'scale(1.005)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          },
        },
      },
    },
  },
});

// Default theme (dark mode)
const theme = createAppTheme('dark');

export default theme;
