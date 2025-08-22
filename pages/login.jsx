// pages/login.jsx
import { useState } from 'react';
import BrandHeader from '../components/BrandHeader';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [msg, setMsg]     = useState('');

  async function onLogin(e) {
    e.preventDefault();
    setMsg('Signing in…');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setMsg(error.message);
    else setMsg('Signed in. Go to Dashboard.');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f0f9ff,#ecfeff)' }}>
      <BrandHeader title="Login" subtitle="Secure access" />
      <main style={{ display:'grid', placeItems:'center', padding: 24 }}>
        <div style={{
          width: 420, background:'#fff', border:'1px solid #e6eef3', borderRadius: 12, padding: 24,
          boxShadow:'0 10px 30px rgba(2,132,199,0.08)'
        }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Welcome back</h1>
          <form onSubmit={onLogin} style={{ display:'grid', gap: 12 }}>
            <label style={lbl()}>
              Email
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={inp()} />
            </label>
            <label style={lbl()}>
              Password
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required style={inp()} />
            </label>
            <button type="submit" style={cta()}>Sign in</button>
          </form>
          <div style={{ marginTop: 12, fontSize: 12, color:'#64748b' }}>{msg}</div>
        </div>
      </main>
    </div>
  );
}

const lbl = () => ({ display:'grid', gap:6, fontSize:13, color:'#475569' });
const inp = () => ({
  padding:'10px 12px', borderRadius:10, border:'1px solid #cbd5e1', outline:'none'
});
const cta = () => ({
  padding:'10px 14px', borderRadius:10, border:'1px solid #0ea5e9',
  background:'linear-gradient(135deg,#0ea5e9,#14b8a6)', color:'#fff', fontWeight:700
});
