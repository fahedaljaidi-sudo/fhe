import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00BCD4', // Teal/Cyan
    },
    background: {
      default: '#1E1E1E', // Charcoal Black
      paper: '#2A2A2A', // Lighter Gray
    },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // Subtle shadow
        },
      },
    },
    MuiButton: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: {
          // Additional button styling if needed to match "Teal by default"
        },
      },
    },
  },
});

export default theme;
