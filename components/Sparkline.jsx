// components/Sparkline.jsx
export default function Sparkline({ points = [], width = 140, height = 36 }) {
  if (!points.length) return <svg width={width} height={height} />;
  const xs = points.map((_, i) => i);
  const ys = points.map(v => v ?? 0);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanY = Math.max(1, maxY - minY);
  const stepX = width / Math.max(1, xs.length - 1);

  const path = ys.map((y, i) => {
    const x = i * stepX;
    const yy = height - ((y - minY) / spanY) * (height - 4) - 2;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={width} height={height}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
