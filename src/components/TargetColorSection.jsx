import { Button } from '@mui/material';
import ColorField from './ColorField.jsx';

export default function TargetColorSection({ targetColor, onColorChange, eyedropper, onToggleEyedropper }) {
  return (
    <div className="panel-section">
      <h2>1. Target color</h2>
      <div className="row">
        <Button
          variant={eyedropper ? 'contained' : 'outlined'}
          color={eyedropper ? 'warning' : 'inherit'}
          onClick={onToggleEyedropper}
          aria-pressed={eyedropper}
          title="Eyedropper (E)"
          startIcon={<span aria-hidden="true">⌖</span>}
          sx={{ flex: 'none' }}
        >
          Eyedropper
        </Button>
        <ColorField value={targetColor} onChange={onColorChange} />
      </div>
      <p className="muted small">
        {eyedropper
          ? 'Click the object in the video to sample its color.'
          : 'Turn on the eyedropper, or type a hex color.'}
      </p>
    </div>
  );
}