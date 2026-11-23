import { IconButton, Slider } from '@mui/material';
import { formatTime } from '../lib/format.js';

export default function Transport({ playing, currentTime, duration, onTogglePlay, onStep, onSeek }) {
  return (
    <div className="transport">
      <IconButton onClick={() => onStep(-1)} title="Previous frame (←)" aria-label="Previous frame">⏮</IconButton>
      <IconButton
        color="primary"
        onClick={onTogglePlay}
        title="Play / pause (space)"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '❚❚' : '▶'}
      </IconButton>
      <IconButton onClick={() => onStep(1)} title="Next frame (→)" aria-label="Next frame">⏭</IconButton>
      <Slider
        size="small"
        min={0}
        max={duration || 1}
        step={0.01}
        value={Math.min(currentTime, duration || 0)}
        onChange={(_, value) => onSeek(value)}
        disabled={!duration}
        aria-label="Seek"
        sx={{ flex: 1, mx: 1 }}
      />
      <span className="time mono">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}