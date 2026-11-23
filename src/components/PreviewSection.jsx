import { Alert, Checkbox, FormControlLabel, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { formatPercent } from '../lib/format.js';

const VIEW_MODES = [
  { id: 'original', label: 'Original', hint: 'The video as-is' },
  { id: 'overlay', label: 'Highlight', hint: 'Matching pixels glow, the rest is dimmed' },
  { id: 'mask', label: 'Mask', hint: 'Exactly what the processor sees: white = match' },
];

function previewHint(stats) {
  if (!stats) return null;
  if (stats.groups === 0) {
    return { level: 'error', text: 'Nothing matches in this frame. Raise the threshold or pick the color again.' };
  }
  if (stats.matchedFraction > 0.25) {
    return { level: 'warning', text: 'Over a quarter of the frame matches. Lower the threshold so only the object lights up.' };
  }
  if (stats.groups > 50 && stats.largest < stats.framePixels * 0.001) {
    return { level: 'warning', text: 'Lots of tiny specks and no clear blob. Try sampling a more typical part of the object.' };
  }
  return { level: 'success', text: 'Looks trackable. Scrub through the video to check other frames, then process the video.' };
}

export default function PreviewSection({
  view,
  onViewChange,
  showPreview,
  onShowPreviewChange,
  showTrack,
  onShowTrackChange,
  hasTrack,
  stats,
}) {
  const hint = previewHint(stats);

  return (
    <div className="panel-section">
      <h2>Preview</h2>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={view}
        onChange={(_, next) => next && onViewChange(next)}
        aria-label="View mode"
        sx={{ mb: 1 }}
      >
        {VIEW_MODES.map((m) => (
          <ToggleButton key={m.id} value={m.id} title={m.hint}>
            {m.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <FormControlLabel
        sx={{ display: 'flex' }}
        control={<Checkbox size="small" checked={showPreview} onChange={(e) => onShowPreviewChange(e.target.checked)} />}
        label={<span><i className="key-dot preview" /> Live centroid (this frame)</span>}
      />
      {hasTrack && (
        <FormControlLabel
          sx={{ display: 'flex' }}
          control={<Checkbox size="small" checked={showTrack} onChange={(e) => onShowTrackChange(e.target.checked)} />}
          label={<span><i className="key-dot track" /> Tracked path (from processor)</span>}
        />
      )}

      {stats && (
        <dl className="stats">
          <div>
            <dt>Matching</dt>
            <dd>{formatPercent(stats.matchedFraction)}</dd>
          </div>
          <div>
            <dt>Blobs</dt>
            <dd>{stats.groups.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Largest</dt>
            <dd>{stats.largest.toLocaleString()} px</dd>
          </div>
          <div>
            <dt>Centroid</dt>
            <dd className="mono">
              {stats.centroid.x < 0 ? '—' : `${stats.centroid.x}, ${stats.centroid.y}`}
            </dd>
          </div>
        </dl>
      )}
      {hint && <Alert severity={hint.level} sx={{ mt: 1.5 }}>{hint.text}</Alert>}
    </div>
  );
}