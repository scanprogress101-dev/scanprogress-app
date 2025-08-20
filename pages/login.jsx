import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { supabase } from '../lib/supabaseClient';
export default function Login(){
  const router = useRouter();
  useEffect(()=>{ const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>{ if(s?.user) router.replace('/dashboard');}); return ()=>{try{sub.subscription.unsubscribe()}catch{}};},[router]);
  return (<div style={{maxWidth:420,margin:'64px auto'}}>
    <h1 style={{textAlign:'center'}}>Scan Progress — Sign in</h1>
    <Auth supabaseClient={supabase} appearance={{theme:default}} providers={[]} redirectTo={typeof window!=='undefined'?window.location.origin+'/dashboard':undefined}/>
  </div>);
}
