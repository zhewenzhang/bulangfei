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
        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
        opacity: 0.8,
      },
      '&::after': {
        clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
        opacity: 0.8,
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
          '&:hover': {
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
          '&:hover': {
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
            : '#ffffff',
          backdropFilter: 'blur(20px)',
          border: mode === 'dark'
            ? '1px solid rgba(84, 84, 88, 0.6)'
            : '1px solid rgba(203, 213, 225, 0.6)',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
            : 'linear-gradient(45deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '-0.003em',
            color: mode === 'dark' ? '#ffffff' : '#1e293b',
            borderBottom: mode === 'dark'
              ? '2px solid rgba(99, 102, 241, 0.3)'
              : '2px solid rgba(148, 163, 184, 0.4)',
            '&:hover': {
              background: mode === 'dark'
                ? 'rgba(99, 102, 241, 0.1)'
                : 'rgba(226, 232, 240, 0.6)',
            },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'transparent'
            : '#ffffff !important',
          borderBottom: mode === 'dark'
            ? '1px solid rgba(84, 84, 88, 0.3)'
            : '1px solid rgba(226, 232, 240, 0.5)',
          '&:nth-of-type(odd)': {
            background: mode === 'dark'
              ? 'rgba(99, 102, 241, 0.05)'
              : '#ffffff !important',
          },
          '&:nth-of-type(even)': {
            background: mode === 'dark'
              ? 'transparent'
              : '#ffffff !important',
          },
          '&:hover': {
            background: mode === 'dark'
              ? 'rgba(99, 102, 241, 0.1)'
              : 'rgba(59, 130, 246, 0.08) !important',
            boxShadow: mode === 'dark'
              ? '0 2px 8px rgba(99, 102, 241, 0.2)'
              : '0 2px 8px rgba(59, 130, 246, 0.1)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: mode === 'dark' ? '#ffffff' : '#1e293b',
          borderBottom: mode === 'dark'
            ? '1px solid rgba(84, 84, 88, 0.4)'
            : '1px solid rgba(226, 232, 240, 0.6)',
          fontSize: '0.95rem',
          fontWeight: 500,
          letterSpacing: '-0.003em',
          padding: '16px',
        },
        head: {
          fontWeight: 700,
          fontSize: '1rem',
          color: mode === 'dark' ? '#ffffff' : '#0f172a',
        },
      },
    },
  },
});

// Default theme (dark mode)
const theme = createAppTheme('dark');

export default theme;
