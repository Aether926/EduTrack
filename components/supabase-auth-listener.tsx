// /components/supabase-auth-listener.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient' // Your createBrowserClient import

// This component lives in your root layout and ensures the session token is fresh.
export default function SupabaseAuthListener() {
  const router = useRouter()

  useEffect(() => {
    // onAuthStateChange fires on every login, logout, and token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Force a soft page refresh on relevant auth events to sync state
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            router.refresh();
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null // This component doesn't render anything
}