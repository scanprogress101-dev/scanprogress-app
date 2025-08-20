import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
export default function Dashboard(){
  const router=useRouter();
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser(); if(!user){router.replace('/login');return;} setUser(user);
    const {data}=await supabase.from('user_profiles').select('first_name,last_name,role,store_id, stores:store_id (name)').eq('user_id',user.id).single();
    setProfile(data||null);})();},[router]);
  const signOut=async()=>{await supabase.auth.signOut(); router.replace('/login');};
  if(!user) return null;
  return (<div style={{maxWidth:720,margin:'48px auto',padding:16}}>
    <h1>Dashboard</h1>
    <p><b>Email:</b> {user.email}</p>
    {profile? (<>
      <p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
      <p><b>Role:</b> {profile.role}</p>
      <p><b>Store:</b> {profile.stores?.name || '—'}</p>
    </>): (<p>No profile found yet.</p>)}
    <button onClick={signOut} style={{marginTop:16}}>Sign out</button>
  </div>);
}
