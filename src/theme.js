import { createTheme } from '@mui/material/styles';

// Dark theme using the same palette as the CSS variables in App.css.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4f8cff' },
    secondary: { main: '#ff4f8b' },
    success: { main: '#3ecf8e' },
    warning: { main: '#f5b942' },
    error: { main: '#ff6b6b' },
    background: { default: '#0f1115', paper: '#171a21' },
    divider: '#2a2f3a',
    text: { primary: '#e8eaef', secondary: '#9097a6' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiAppBar: {
      defaultProps: { color: 'default', elevation: 0, position: 'sticky' },
      styleOverrides: { root: { borderBottom: '1px solid #2a2f3a', backgroundImage: 'none' } },
    },
  },
});

export default theme;
