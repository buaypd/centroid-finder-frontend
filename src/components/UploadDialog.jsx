import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@mui/material';
import { uploadVideo } from '../api.js';

// Keep in step with the backend's list of accepted video types.
const EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

const extensionOf = (name) => (name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : '');

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Pick (or drop) a video, send it to POST /api/videos, and report back the
// saved filename through `onUploaded`.
export default function UploadDialog({ open, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Start fresh every time the dialog opens.
  useEffect(() => {
    if (open) {
      setFile(null);
      setError(null);
      setProgress(0);
      setUploading(false);
    }
  }, [open]);

  function choose(picked) {
    setError(null);
    if (!picked) return;
    if (!EXTENSIONS.includes(extensionOf(picked.name))) {
      setFile(null);
      setError(`Unsupported file type. Use ${EXTENSIONS.join(', ')}.`);
      return;
    }
    setFile(picked);
  }

  async function submit() {
    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const filename = await uploadVideo(file, setProgress, controller.signal);
      onUploaded(filename);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      abortRef.current = null;
      setUploading(false);
    }
  }

  function close() {
    abortRef.current?.abort();
    onClose();
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" aria-labelledby="upload-title">
      <DialogTitle
        id="upload-title"
        sx={(theme) => ({ fontFamily: theme.typography.h4.fontFamily, fontSize: '1.9rem', fontWeight: 400 })}
      >
        Upload a video
      </DialogTitle>

      <DialogContent>
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!uploading) choose(e.dataTransfer.files[0]);
          }}
          sx={{
            border: 1,
            borderStyle: 'dashed',
            borderColor: dragging ? 'primary.main' : 'divider',
            bgcolor: dragging ? 'action.hover' : 'transparent',
            p: 4,
            textAlign: 'center',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={EXTENSIONS.join(',')}
            aria-label="Video file"
            onChange={(e) => {
              choose(e.target.files[0]);
              e.target.value = ''; // allow picking the same file again
            }}
          />

          {file ? (
            <>
              <Typography fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatSize(file.size)}
              </Typography>
            </>
          ) : (
            <Typography color="text.secondary">Drop a video here, or</Typography>
          )}

          <Button
            variant="outlined"
            color="inherit"
            disabled={uploading}
            onClick={() => inputRef.current.click()}
            sx={{ mt: 1.5 }}
          >
            {file ? 'Choose a different file' : 'Choose a file'}
          </Button>
          <Typography variant="caption" display="block" color="text.secondary" mt={1.5}>
            {EXTENSIONS.join('  ')}
          </Typography>
        </Box>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} aria-label="Upload progress" />
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Uploading… {progress}%
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={close}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!file || uploading} onClick={submit}>
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
