import { useEffect, useRef, useState } from 'react';
import { Alert } from '@mui/material';
import { thumbnailUrl } from '../api.js';
import { detect, hexToRgb } from '../lib/detection.js';
import { drawDot, paintMask } from '../lib/draw.js';

// Shows the video's first frame (GET /thumbnail/:filename) next to a
// binarized copy of it. The right-hand canvas is redrawn whenever the target
// color or threshold changes, with a dot on the largest group's centroid.
export default function PreviewPair({ filename, targetColor, threshold }) {
  const [frame, setFrame] = useState(null); // ImageData of the thumbnail
  const [error, setError] = useState(null);
  const [centroid, setCentroid] = useState(null);

  const originalRef = useRef(null);
  const binaryRef = useRef(null);

  // Load the thumbnail and read its pixels.
  useEffect(() => {
    let cancelled = false;
    setFrame(null);
    setError(null);

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = originalRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      setFrame(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    img.onerror = () => !cancelled && setError('Could not load the thumbnail.');
    img.src = thumbnailUrl(filename);

    return () => {
      cancelled = true;
    };
  }, [filename]);

  // Re-binarize whenever the settings (or the frame) change.
  useEffect(() => {
    if (!frame) return;
    const canvas = binaryRef.current;
    const { width, height } = frame;
    canvas.width = width;
    canvas.height = height;

    const result = detect(frame.data, width, height, hexToRgb(targetColor), threshold);

    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(width, height);
    paintMask(img, result.mask, 'mask');
    ctx.putImageData(img, 0, 0);
    drawDot(ctx, result.centroid, Math.max(width, height) / 900);

    setCentroid(result.centroid);
  }, [frame, targetColor, threshold]);

  return (
    <section className="preview-pair" aria-label="Thumbnail and binarized preview">
      <figure>
        <canvas ref={originalRef} aria-label="First frame" />
        <figcaption>First frame</figcaption>
      </figure>
      <figure>
        <canvas ref={binaryRef} aria-label="Binarized first frame" />
        <figcaption>
          Binarized
          {centroid && (
            <span className="muted">
              {' · '}
              {centroid.x < 0 ? 'no group found' : `centroid ${centroid.x}, ${centroid.y}`}
            </span>
          )}
        </figcaption>
      </figure>
      {!frame && !error && <p className="muted small">Loading thumbnail…</p>}
      {error && <Alert severity="error">{error}</Alert>}
    </section>
  );
}
