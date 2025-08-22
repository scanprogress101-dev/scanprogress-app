// components/MetricCard.jsx
export default function MetricCard({ label, value, hint }) {
  return (
    <div style={{
      padding: 16, border: '1px solid #e6eef3', borderRadius: 12, background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {hint ? <div style={{ marginTop: 4, fontSize: 12, color: '#94a3b8' }}>{hint}</div> : null}
    </div>
  );
}
