import { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { listVideos } from '../api.js';
import { onVideosChanged } from '../lib/videoEvents.js';

// Higher-order component: takes a component and returns a new one that
// fetches GET /api/videos and handles the loading, error and empty states.
// The wrapped component only renders when there are videos, and receives
//   videos    - array of filenames
//   updatedAt - Date of the last successful load
//   onRefresh - function that reloads the list
// plus whatever props the caller passed.
export default function withVideoList(WrappedComponent) {
  function WithVideoList(props) {
    const [videos, setVideos] = useState(null);
    const [error, setError] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
      let cancelled = false;
      setError(null);
      listVideos()
        .then((list) => {
          if (cancelled) return;
          setVideos(list);
          setUpdatedAt(new Date());
        })
        .catch((err) => !cancelled && setError(err.message));
      return () => {
        cancelled = true;
      };
    }, [reloadKey]);

    const refresh = () => setReloadKey((k) => k + 1);

    // Reload when a video is uploaded from the nav bar.
    useEffect(() => onVideosChanged(() => setReloadKey((k) => k + 1)), []);
    const retry = (
      <Button color="inherit" size="small" onClick={refresh}>
        Refresh
      </Button>
    );

    if (error) {
      return (
        <Alert severity="error" action={retry}>
          <strong>{error}.</strong> Is the server running on port 3000, and does the <code>videos/</code> folder exist?
        </Alert>
      );
    }

    if (videos === null) {
      return (
        <Stack direction="row" alignItems="center" gap={1.5} color="text.secondary">
          <CircularProgress size={20} />
          <Typography>Loading videos…</Typography>
        </Stack>
      );
    }

    if (videos.length === 0) {
      return (
        <Alert severity="info" action={retry}>
          No videos yet. Drop <code>.mp4</code>, <code>.mov</code>, <code>.avi</code>, <code>.mkv</code> or{' '}
          <code>.webm</code> files into the <code>videos/</code> folder at the project root, then refresh.
        </Alert>
      );
    }

    return <WrappedComponent {...props} videos={videos} updatedAt={updatedAt} onRefresh={refresh} />;
  }

  WithVideoList.displayName = `withVideoList(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithVideoList;
}
