export default function HoverTip({ hover, threshold, eyedropper }) {
  const isMatch = hover.distance < threshold;
  const flipX = hover.left > 70 ? 'flip-x' : '';
  const flipY = hover.top > 75 ? 'flip-y' : '';

  return (
    <div
      className={`hover-tip ${flipX} ${flipY}`}
      style={{ left: `${hover.left}%`, top: `${hover.top}%` }}
    >
      <span className="tip-swatch" style={{ background: `#${hover.hex}` }} />
      <span className="mono">#{hover.hex}</span>
      <span className={isMatch ? 'tip-match' : 'tip-miss'}>
        {Math.round(hover.distance)} {isMatch ? '✓ match' : '✗'}
      </span>
      {eyedropper && <span className="tip-action">click to pick</span>}
    </div>
  );
}