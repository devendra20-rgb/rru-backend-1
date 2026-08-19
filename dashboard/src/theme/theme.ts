import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0D3B49',
      light: '#1A5A6E',
      dark: '#072830',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E8942B',
      light: '#F0A94F',
      dark: '#C47A1E',
      contrastText: '#172B31',
    },
    success: {
      main: '#12805C',
      light: '#1A9E72',
      dark: '#0D5C42',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#E8942B',
      light: '#F0A94F',
      dark: '#C47A1E',
      contrastText: '#172B31',
    },
    error: {
      main: '#C4451D',
      light: '#D9653F',
      dark: '#9A3313',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0D3B49',
      light: '#1A5A6E',
      dark: '#072830',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F6F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#16313A',
      secondary: '#66777D',
    },
    divider: '#DCE3E6',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontWeight: 800,
      color: '#072830',
      letterSpacing: '-1.5px',
    },
    h2: {
      fontWeight: 800,
      color: '#072830',
      letterSpacing: '-1px',
    },
    h3: {
      fontWeight: 700,
      color: '#072830',
      letterSpacing: '-0.5px',
    },
    h4: {
      fontWeight: 700,
      color: '#072830',
      letterSpacing: '-0.3px',
    },
    h5: {
      fontWeight: 700,
      color: '#072830',
    },
    h6: {
      fontWeight: 700,
      color: '#072830',
    },
    subtitle1: {
      color: '#66777D',
      fontSize: '0.95rem',
    },
    subtitle2: {
      color: '#66777D',
      fontWeight: 600,
      fontSize: '0.85rem',
    },
    body1: {
      color: '#16313A',
      fontSize: '0.925rem',
      lineHeight: 1.55,
    },
    body2: {
      color: '#66777D',
      fontSize: '0.85rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.1px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          boxShadow: 'none',
          transition: 'all 150ms ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(13, 59, 73, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(7, 40, 48, 0.04), 0 4px 12px rgba(7, 40, 48, 0.06)',
          border: '1px solid #DCE3E6',
        },
        elevation0: {
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #DCE3E6',
          boxShadow: '0 1px 3px rgba(7, 40, 48, 0.04), 0 4px 12px rgba(7, 40, 48, 0.06)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F4F6F7',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: '#072830',
            borderBottom: '1px solid #DCE3E6',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #DCE3E6',
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(13, 59, 73, 0.02) !important',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.78rem',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#DCE3E6',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0D3B49',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0D3B49',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 44,
          height: 24,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#FFFFFF',
            '& + .MuiSwitch-track': {
              backgroundColor: '#12805C',
              opacity: 1,
              border: 0,
            },
          },
        },
        thumb: {
          width: 20,
          height: 20,
        },
        track: {
          borderRadius: 12,
          backgroundColor: '#DCE3E6',
          opacity: 1,
        },
      },
    },
  },
});
