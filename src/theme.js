import { createTheme } from '@mui/material/styles';

// Create a custom theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#26a69a', // A nice teal shade
    },
    secondary: {
      main: '#ffc107', // Amber for accents
    },
    background: {
      default: '#121212', // Standard dark theme background
      paper: '#1e1e1e',   // Background for cards, paper, etc.
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e', // Match paper color for a sleek look
        },
      },
    },
    MuiBottomNavigation: {
        styleOverrides: {
            root: {
                backgroundColor: '#1e1e1e', // Match app bar
            }
        }
    }
  },
});

export default theme;
