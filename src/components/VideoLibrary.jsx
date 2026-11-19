import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { thumbnailUrl } from '../api.js';
import withVideoList from '../hoc/withVideoList.jsx';
import { loadSavedJob } from '../lib/savedJobs.js';

// Presentational: draws the grid for the `videos` it is given. Fetching and
// the loading / error / empty states live in the withVideoList HOC.
function VideoLibrary({ videos, onSelect, onRefresh }) {
  return (
    <section className="library">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography color="text.secondary">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </Typography>
        <Button variant="outlined" color="inherit" onClick={onRefresh}>
          Refresh
        </Button>
      </Stack>

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
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff' }}
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
    </section>
  );
}

export default withVideoList(VideoLibrary);
