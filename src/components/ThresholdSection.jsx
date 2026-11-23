import { Slider, TextField } from '@mui/material';
import { MAX_DISTANCE } from '../lib/detection.js';

export default function ThresholdSection({ threshold, onChange }) {
  function handleInputChange(e) {
    const v = Math.round(Number(e.target.value));
    if (Number.isFinite(v)) onChange(Math.min(MAX_DISTANCE, Math.max(0, v)));
  }

  return (
    <div className="panel-section">
      <h2>2. Threshold</h2>
      <div className="row">
        <Slider
          min={0}
          max={MAX_DISTANCE}
          value={threshold}
          onChange={(_, value) => onChange(value)}
          aria-label="Threshold"
          sx={{ flex: 1, mx: 1 }}
        />
        <TextField
          type="number"
          size="small"
          value={threshold}
          onChange={handleInputChange}
          slotProps={{
            htmlInput: { min: 0, max: MAX_DISTANCE, 'aria-label': 'Threshold value', style: { textAlign: 'right' } },
          }}
          sx={{ width: 84, flex: 'none' }}
        />
      </div>
      <p className="muted small">
        How far a pixel's color can be from the target and still count. Lower is stricter.
      </p>
    </div>
  );
}