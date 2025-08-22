// pages/scans.jsx
import { useEffect, useMemo, useState } from 'react';
import BrandHeader from '../components/BrandHeader';
import Sparkline from '../components/Sparkline';

export default function ScansPage() {
  const [scans, setScans] = useState([]);
  const [demo, setDemo]   = useState(false);
  const [mode, setMode]   = useState('modern'); // 'modern' or 'inbody'

  useEffect(() => {
    fetch('/api/scans').then(r=>r.json()).then(d => {
      setDemo(Boolean(d?.demo));
      setScans(d?.items ?? []);
    });
  }, []);

  const series = useMemo(() => {
    const byMember = new Map();
    for (const s of scans) {
      const key = String(s.member_id ?? 'unknown');
      if (!byMember.has(key)) byMember.set(key, []);
      byMember.get(key).push(s);
    }
    for (const arr of byMember.values()) {
      arr.sort((a,b)=> new Date(a.scan_time) - new Date(b.scan_time));
    }
    return byMember;
  }, [scans]);

  const firstKey = [...series.keys()][0];

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <BrandHeader title="Customer Scan History" subtitle={demo ? 'Demo data active' : 'Live data'} />
      <main style={{ maxWidth:1100, margin:'24px auto', padding:'0 16px', display:'grid', gap:16 }}>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setMode('modern')} style={tab(mode==='modern')}>ScanProgress Style</button>
          <button onClick={()=>setMode('inbody')} style={tab(mode==='inbody')}>InBody Style</button>
        </div>

        {mode === 'modern' ? (
          <Modern scans={scans} series={series} activeKey={firstKey} />
        ) : (
          <InBodyLike scans={scans} series={series} activeKey={firstKey} />
        )}
      </main>
    </div>
  );
}

function Modern({ scans, series, activeKey }) {
  const arr = series.get(activeKey) ?? [];
  const weights = arr.map(s => s.weight);
  const fats    = arr.map(s => s.bodyFatPct);
  const smm     = arr.map(s => s.smm);

  return (
    <section style={{ background:'#fff', border:'1px solid #e6eef3', borderRadius:12 }}>
      <div style={{ padding:16, borderBottom:'1px solid #e6eef3', display:'flex', justifyContent:'space-between' }}>
        <div style={{ fontWeight:700 }}>Member: {activeKey ?? '—'}</div>
      </div>
      <div style={{ display:'grid', gap:16, padding:16 }}>
        <Card title="Weight">
          <Sparkline points={weights} width={300} height={56} />
        </Card>
        <Card title="Body Fat %">
          <Sparkline points={fats} width={300} height={56} />
        </Card>
        <Card title="Skeletal Muscle Mass">
          <Sparkline points={smm} width={300} height={56} />
        </Card>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#f1f5f9' }}>
              <th style={th()}>Date</th><th style={th()}>Weight</th><th style={th()}>Body Fat %</th><th style={th()}>SMM</th><th style={th()}>BMI</th>
            </tr></thead>
            <tbody>
              {arr.map((s, i) => (
                <tr key={i} style={{ background: i%2 ? '#fff' : '#fbfdff' }}>
                  <td style={td()}>{fmt(s.scan_time)}</td>
                  <td style={td()}>{num(s.weight)}</td>
                  <td style={td()}>{num(s.bodyFatPct)}</td>
                  <td style={td()}>{num(s.smm)}</td>
                  <td style={td()}>{num(s.bmi)}</td>
                </tr>
              ))}
              {!arr.length && <tr><td colSpan={5} style={{ padding:16 }}>No scans yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function InBodyLike({ scans, series, activeKey }) {
  const arr = series.get(activeKey) ?? [];
  return (
    <section style={{ background:'#fff', border:'1px solid #e6eef3', borderRadius:12 }}>
      <div style={{ padding:16, borderBottom:'1px solid #e6eef3', display:'flex', justifyContent:'space-between' }}>
        <div style={{ fontWeight:700 }}>InBody‑Style Report — Member: {activeKey ?? '—'}</div>
      </div>
      <div style={{ padding:16 }}>
        <div style={{ marginBottom:12, fontSize:13, color:'#475569' }}>
          Classic table-first layout with trend emphasis, familiar to InBody users.
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#e2e8f0' }}>
                <th style={th()}>Date</th>
                <th style={th()}>Weight</th>
                <th style={th()}>SMM</th>
                <th style={th()}>Body Fat %</th>
                <th style={th()}>BMI</th>
              </tr>
            </thead>
            <tbody>
              {arr.map((s, i) => (
                <tr key={i} style={{ background:'#fff' }}>
                  <td style={td()}>{fmt(s.scan_time)}</td>
                  <td style={td()}>{num(s.weight)}</td>
                  <td style={td()}>{num(s.smm)}</td>
                  <td style={td()}>{num(s.bodyFatPct)}</td>
                  <td style={td()}>{num(s.bmi)}</td>
                </tr>
              ))}
              {!arr.length && <tr><td colSpan={5} style={{ padding:16 }}>No scans yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ border:'1px solid #e6eef3', borderRadius:12, padding:16, background:'#fff' }}>
      <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>{title}</div>
      {children}
    </div>
  );
}

const th = () => ({ textAlign:'left', fontSize:12, color:'#334155', padding:10, borderBottom:'1px solid #e6eef3' });
const td = () => ({ padding:10, borderBottom:'1px solid #eef4f8', fontSize:14, color:'#0f172a' });
const tab = (active) => ({
  padding:'8px 12px', borderRadius:10, border:'1px solid #0ea5e9',
  background: active ? 'linear-gradient(135deg,#0ea5e9,#14b8a6)' : 'transparent',
  color: active ? '#fff' : '#0ea5e9', fontWeight:700
});
const fmt = v => v ? new Date(v).toLocaleString() : '—';
const num = v => (v == null || Number.isNaN(v)) ? '—' : Number(v).toFixed(1);
