import { useEffect, useState } from 'react';
import { Alert, Button, Chip, LinearProgress } from '@mui/material';
import { resultUrl } from '../api.js';
import { formatPercent } from '../lib/format.js';

const STATUS_LABELS = { processing: 'Processing', done: 'Done', error: 'Error' };
const STATUS_COLORS = { processing: 'primary', done: 'success', error: 'error' };

export default function JobCard({ job, run, summary, trackError, settingsChanged, onRestore }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (job.status !== 'processing') return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [job.status]);

  const elapsed = run.startedAt ? Math.max(0, Math.round((now - run.startedAt) / 1000)) : null;

  return (
    <div className={`job-card ${job.status}`}>
      <div className="job-head">
        <Chip
          size="small"
          variant="outlined"
          color={STATUS_COLORS[job.status] ?? 'error'}
          label={STATUS_LABELS[job.status] ?? 'Error'}
        />
        <span className="job-params">
          <span className="dot" style={{ background: `#${run.targetColor}` }} />
          <span className="mono">#{run.targetColor}</span> · {run.threshold}
        </span>
      </div>

      {job.status === 'processing' && (
        <>
          <LinearProgress sx={{ mt: 1.5 }} />
          <p className="muted small">
            The processor is working through every frame{elapsed !== null ? ` (${elapsed}s so far)` : ''}. You can keep tuning while you wait.
          </p>
        </>
      )}

      {job.status === 'error' && (
        <Alert severity="error" sx={{ mt: 1.5 }}>{job.error || 'Processing failed.'}</Alert>
      )}

      {job.status === 'done' && (
        <>
          {trackError && <Alert severity="error" sx={{ mt: 1.5 }}>{trackError}</Alert>}
          {summary && (
            <dl className="stats">
              <div>
                <dt>Frames</dt>
                <dd>{summary.frames.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Found in</dt>
                <dd>{formatPercent(summary.foundFraction, 0)}</dd>
              </div>
            </dl>
          )}
          <Button variant="outlined" color="inherit" fullWidth href={resultUrl(job.result)} download sx={{ mt: 1.5 }}>
            Download CSV
          </Button>
        </>
      )}

      {settingsChanged && (
        <p className="small changed">
          Your settings changed since this run.{' '}
          <Button size="small" onClick={onRestore} sx={{ p: 0, minWidth: 0, verticalAlign: 'baseline' }}>
            Use the run's settings
          </Button>
        </p>
      )}
    </div>
  );
}