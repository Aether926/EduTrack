'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function finish() {
      // get current session (supabase stores it in browser)
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) return router.push('/logIn')

      const accessToken = session.access_token

      // send token to server to upsert profile
      const res = await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      })

      if (res.ok) router.push('/dashboard')
      else {
        console.error(await res.text())
        router.push('/logIn')
      }
    }

    finish()
  }, [router])

  return <p>Finalizing sign in...</p>
}
