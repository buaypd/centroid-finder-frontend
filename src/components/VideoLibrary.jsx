import { Alert, Box, Button, Card, CardActionArea, CardMedia, Grid, Stack, Typography } from '@mui/material';
import { thumbnailUrl } from '../api.js';
import withVideoList from '../hoc/withVideoList.jsx';
import { loadSavedJob } from '../lib/savedJobs.js';

// Small uppercase label used throughout the editorial layout.
const labelSx = { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' };

const formatOf = (name) => (name.includes('.') ? name.split('.').pop().toUpperCase() : 'VIDEO');
const stemOf = (name) => (name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name);

// Presentational: draws the grid for the `videos` it is given. Fetching and
// the loading / error / empty states live in the withVideoList HOC.
function VideoLibrary({ videos: allVideos, query = '', updatedAt, onSelect, onRefresh }) {
  const needle = query.trim().toLowerCase();
  const videos = needle ? allVideos.filter((name) => name.toLowerCase().includes(needle)) : allVideos;

  return (
    <section className="library">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        gap={2}
        sx={{ borderTop: 1, borderColor: 'text.primary', pt: 1.5, mb: 3 }}
      >
        <Typography sx={labelSx}>
          {needle
            ? `${videos.length} of ${allVideos.length} match “${query.trim()}”`
            : `${allVideos.length} ${allVideos.length === 1 ? 'item' : 'items'}`}
        </Typography>
        <Stack direction="row" alignItems="baseline" gap={2}>
          {updatedAt && <Typography sx={labelSx}>Updated {updatedAt.toLocaleTimeString([], { timeStyle: 'short' })}</Typography>}
          <Button size="small" color="inherit" onClick={onRefresh} sx={{ textDecoration: 'underline', minWidth: 0, p: 0 }}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {videos.length === 0 && <Alert severity="info">No videos match your search.</Alert>}

      <Grid container spacing={4} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {videos.map((name, i) => {
          const saved = loadSavedJob(name);
          return (
            <Grid key={name} component="li" size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                elevation={0}
                square
                sx={{ '&:hover .open-btn': { opacity: 1, transform: 'none' }, '&:hover img': { transform: 'scale(1.02)' } }}
              >
                <CardActionArea onClick={() => onSelect(name)} sx={{ borderRadius: 0 }}>
                  <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#000' }}>
                    <CardMedia
                      component="img"
                      image={thumbnailUrl(name)}
                      alt=""
                      loading="lazy"
                      sx={{ aspectRatio: '16 / 9', transition: 'transform 0.4s' }}
                    />
                    <Typography
                      sx={{ ...labelSx, color: '#fff', position: 'absolute', top: 10, left: 12, fontWeight: 600 }}
                    >
                      {String(i + 1).padStart(2, '0')} / {String(videos.length).padStart(2, '0')}
                    </Typography>
                    <Box
                      className="open-btn"
                      aria-hidden="true"
                      sx={{
                        position: 'absolute',
                        right: 14,
                        bottom: 14,
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        bgcolor: 'background.default',
                        color: 'primary.main',
                        display: 'grid',
                        placeItems: 'center',
                        opacity: 0,
                        transform: 'translateY(4px)',
                        transition: 'opacity 0.2s, transform 0.2s',
                      }}
                    >
                      ↗
                    </Box>
                  </Box>

                  <Box sx={{ pt: 1.5, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography sx={{ ...labelSx, mb: 0.5 }} noWrap title={name}>
                      {stemOf(name)}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                      <Typography variant="body2">{formatOf(name)}</Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.75}
                        title={saved ? `Last run: #${saved.targetColor}, threshold ${saved.threshold}` : undefined}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: saved ? `#${saved.targetColor}` : 'transparent',
                            border: 1,
                            borderColor: saved ? 'text.primary' : 'text.secondary',
                          }}
                        />
                        <Typography variant="body2" color={saved ? 'primary' : 'text.secondary'}>
                          {saved ? 'Tracked' : 'Not tracked'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </section>
  );
}

export default withVideoList(VideoLibrary);
