import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { listVideos, thumbnailUrl } from '../api.js';
import { loadSavedJob } from '../lib/savedJobs.js';

export default function VideoLibrary({ onSelect }) {
  const [videos, setVideos] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    listVideos()
      .then((list) => !cancelled && setVideos(list))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <section className="library">
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={2} mb={2.5}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Videos
          </Typography>
          <Typography color="text.secondary">
            Pick a video, click the object you want to follow, and tune the threshold until only it lights up.
          </Typography>
        </Box>
        <Button variant="outlined" color="inherit" onClick={() => setReloadKey((k) => k + 1)}>
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error">
          <strong>{error}.</strong> Is the server running on port 3000, and does the <code>videos/</code> folder exist?
        </Alert>
      )}

      {!error && videos === null && (
        <Stack direction="row" alignItems="center" gap={1.5} color="text.secondary">
          <CircularProgress size={20} />
          <Typography>Loading videos…</Typography>
        </Stack>
      )}

      {videos && videos.length === 0 && (
        <Alert severity="info">
          No videos yet. Drop <code>.mp4</code>, <code>.mov</code>, <code>.avi</code>, <code>.mkv</code> or{' '}
          <code>.webm</code> files into the <code>videos/</code> folder at the project root, then refresh.
        </Alert>
      )}

      {videos && videos.length > 0 && (
        <Grid container spacing={2.5} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {videos.map((name) => {
            const saved = loadSavedJob(name);
            return (
              <Grid key={name} component="li" size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main' } }}>
                  <CardActionArea onClick={() => onSelect(name)}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={thumbnailUrl(name)}
                        alt=""
                        loading="lazy"
                        sx={{ aspectRatio: '16 / 9', bgcolor: '#000' }}
                      />
                      {saved && (
                        <Chip
                          size="small"
                          label="Tracked"
                          title={`Last run: #${saved.targetColor}, threshold ${saved.threshold}`}
                          avatar={<Box component="span" sx={{ bgcolor: `#${saved.targetColor}`, borderRadius: '50%' }} />}
                          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)' }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ py: 1.25 }}>
                      <Typography fontWeight={500} noWrap>
                        {name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </section>
  );
}
