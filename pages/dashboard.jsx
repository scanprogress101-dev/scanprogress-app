// pages/dashboard.jsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState(null)
  const [roleRow, setRoleRow] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Ensure we have a session; if not, redirect to login
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace('/login')
          return
        }

        const [{ data: storeData, error: sErr }, { data: roleData, error: rErr }] =
          await Promise.all([
            supabase.from('my_store').select('*').maybeSingle(),
            supabase.from('my_role').select('*').maybeSingle(),
          ])

        if (!ignore) {
          if (sErr || rErr) throw sErr || rErr
          setStore(storeData || null)
          setRoleRow(roleData || null)
        }
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => { ignore = true }
  }, [router])

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>Error: {error}</div>

  if (!store) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Scan Progress</h1>
        <p>You are signed in but not linked to a store yet.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>{store.name}</h1>
      <p>{store.location}</p>
      <p>
        Role: <strong>{roleRow?.role ?? 'unknown'}</strong>
      </p>
    </div>
  )
}
