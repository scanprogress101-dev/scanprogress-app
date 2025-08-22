// components/BrandHeader.jsx
export default function BrandHeader({ title, subtitle }) {
  return (
    <header style={{ padding: '16px 24px', borderBottom: '1px solid #e6eef3', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#0ea5e9,#14b8a6)' }} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>ScanProgress</div>
        {title ? <div style={{ fontSize: 14, color: '#64748b' }}>{title}</div> : null}
      </div>
      <div style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 14 }}>{subtitle}</div>
    </header>
  );
}
