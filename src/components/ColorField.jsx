import { useEffect, useState } from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';

// Swatch (opens the native color picker) plus a hex text box.
// `value` is 6 hex digits without '#'.
export default function ColorField({ value, onChange }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  function commit(text) {
    const clean = text.trim().replace(/^#/, '').toLowerCase();
    if (/^[0-9a-f]{6}$/.test(clean)) onChange(clean);
    else setDraft(value);
  }

  return (
    <TextField
      size="small"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && commit(e.target.value)}
      spellCheck={false}
      sx={{ flex: 1, minWidth: 0 }}
      slotProps={{
        htmlInput: { maxLength: 7, 'aria-label': 'Target color hex', className: 'mono' },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Box
                component="label"
                title="Choose a color"
                sx={{
                  position: 'relative',
                  width: 24,
                  height: 24,
                  borderRadius: 0.75,
                  border: '1px solid rgba(255,255,255,0.25)',
                  bgcolor: `#${value}`,
                  cursor: 'pointer',
                  mr: 0.5,
                }}
              >
                <input
                  type="color"
                  value={`#${value}`}
                  onChange={(e) => onChange(e.target.value.slice(1).toLowerCase())}
                  aria-label="Target color picker"
                  style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </Box>
              #
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
