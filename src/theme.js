import { createTheme } from '@mui/material/styles';

// Light, editorial look: warm paper background, near-black text, a serif
// display face for headings and one strong blue accent. Keep these in step
// with the CSS variables in App.css.
const PAPER = '#f2efe8';
const INK = '#141414';
const LINE = '#cfcbc0';
const SERIF = "'Instrument Serif', 'Times New Roman', Georgia, serif";
const SANS = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const heading = { fontFamily: SERIF, fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.05 };

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2b3aff' },
    secondary: { main: '#e0336f' },
    success: { main: '#0f8f5a' },
    warning: { main: '#c99700' },
    error: { main: '#c93a3a' },
    background: { default: PAPER, paper: '#f8f6f0' },
    divider: LINE,
    text: { primary: INK, secondary: '#6b6a64' },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: SANS,
    h1: heading,
    h2: heading,
    h3: heading,
    h4: { ...heading, fontSize: '2.75rem' },
    h5: heading,
    h6: heading,
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiAppBar: {
      defaultProps: { color: 'inherit', elevation: 0, position: 'sticky' },
      styleOverrides: {
        root: { backgroundColor: PAPER, color: INK, borderBottom: `1px solid ${LINE}`, backgroundImage: 'none' },
      },
    },
    MuiCard: { styleOverrides: { root: { backgroundColor: 'transparent', backgroundImage: 'none' } } },
  },
});

export default theme;
