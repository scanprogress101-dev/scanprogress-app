// pages/index.js
import Link from 'next/link';
import BrandHeader from '../components/BrandHeader';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <BrandHeader title="Welcome" subtitle="scanprogress.com" />
      <main style={{ maxWidth: 1000, margin: '24px auto', padding: '0 16px' }}>
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, border: '1px solid #e6eef3' }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>ScanProgress</h1>
          <p style={{ color: '#475569', marginBottom: 16 }}>
            Track body composition changes from your InBody scans. This is a live prototype.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/login" style={btn()}>Login</Link>
            <Link href="/dashboard" style={btn('ghost')}>Store Dashboard</Link>
            <Link href="/scans" style={btn('ghost')}>Customer Scan History</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function btn(variant) {
  const base = {
    display: 'inline-block',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #0ea5e9',
    color: '#fff',
    background: 'linear-gradient(135deg,#0ea5e9,#14b8a6)',
    textDecoration: 'none',
    fontWeight: 600
  };
  if (variant === 'ghost') {
    return { ...base, background: 'transparent', color: '#0ea5e9' };
  }
  return base;
}
