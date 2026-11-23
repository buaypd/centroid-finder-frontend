import { Alert, Button } from '@mui/material';
import JobCard from './JobCard.jsx';

export default function ProcessSection({
  job,
  jobRun,
  starting,
  startError,
  targetColor,
  threshold,
  summary,
  trackError,
  settingsChanged,
  onRun,
  onRestore,
}) {
  const isProcessing = job.status === 'processing';
  const buttonLabel = isProcessing ? 'Processing…' : starting ? 'Starting…' : 'Process Video with These Settings';

  return (
    <div className="panel-section">
      <h2>3. Track the whole video</h2>
      <Button variant="contained" fullWidth onClick={onRun} disabled={starting || isProcessing}>
        {buttonLabel}
      </Button>
      <p className="muted small">
        Sends <span className="mono">#{targetColor}</span> and threshold{' '}
        <span className="mono">{threshold}</span> to the Java processor, which finds the largest blob in every frame.
      </p>
      {startError && <Alert severity="error" sx={{ mt: 1.5 }}>{startError}</Alert>}

      {jobRun && (
        <JobCard
          job={job}
          run={jobRun}
          summary={summary}
          trackError={trackError}
          settingsChanged={settingsChanged}
          onRestore={onRestore}
        />
      )}
    </div>
  );
}