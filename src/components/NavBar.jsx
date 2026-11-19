import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AppBar, Box, Button, InputAdornment, TextField, Toolbar, Typography } from '@mui/material';
import { notifyVideosChanged } from '../lib/videoEvents.js';
import UploadDialog from './UploadDialog.jsx';

// Top navigation: brand, a Library tab, the open video's name, and a search
// box. Typing in the search box goes to /videos?q=<text>, and the library
// filters its cards by that text.
export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const onLibrary = location.pathname === '/videos';
  const match = location.pathname.match(/^\/preview\/([^/]+)$/);
  const selected = match ? decodeURIComponent(match[1]) : null;

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [uploadOpen, setUploadOpen] = useState(false);

  // Keep the box in step with the URL (back/forward, links, clearing).
  useEffect(() => {
    if (onLibrary) setQuery(searchParams.get('q') ?? '');
  }, [onLibrary, searchParams]);

  // After an upload, show the library (unfiltered) with the new video in it.
  function handleUploaded() {
    setUploadOpen(false);
    setQuery('');
    notifyVideosChanged();
    navigate('/videos');
  }

  function search(text) {
    setQuery(text);
    const q = text.trim();
    // Replace history while typing in the library so Back isn't flooded.
    navigate(q ? `/videos?q=${encodeURIComponent(q)}` : '/videos', { replace: onLibrary });
  }

  return (
    <AppBar>
      <Toolbar sx={{ gap: { xs: 1, sm: 3 }, flexWrap: 'wrap', py: 0.5 }}>
        <Button
          component={RouterLink}
          to="/videos"
          color="inherit"
          title="Back to library"
          startIcon={
            <Box component="span" aria-hidden="true" sx={{ color: 'primary.main', fontSize: '1.4rem' }}>
              ◎
            </Box>
          }
          sx={{ fontWeight: 600, fontSize: '1.05rem', px: 0 }}
        >
          Centroid
        </Button>

        <Box component="nav" aria-label="Main" sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/videos"
            color="inherit"
            aria-current={onLibrary || selected ? 'page' : undefined}
            sx={{
              borderRadius: 0,
              px: 0.5,
              borderBottom: 2,
              borderColor: onLibrary || selected ? 'primary.main' : 'transparent',
            }}
          >
            Library
          </Button>
        </Box>

        {selected && (
          <Typography color="text.secondary" noWrap sx={{ minWidth: 0, maxWidth: 260 }}>
            / {selected}
          </Typography>
        )}

        <TextField
          size="small"
          type="search"
          placeholder="Search videos"
          value={query}
          onChange={(e) => search(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && search('')}
          sx={{ ml: 'auto', width: { xs: '100%', sm: 260 } }}
          slotProps={{
            htmlInput: { 'aria-label': 'Search videos' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <span aria-hidden="true">⌕</span>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button variant="outlined" color="inherit" onClick={() => setUploadOpen(true)}>
          Upload <span aria-hidden="true">&nbsp;↑</span>
        </Button>
      </Toolbar>

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />
    </AppBar>
  );
}
