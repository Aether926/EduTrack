'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SupabaseAuthListener() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
          router.refresh();
        }
        // PASSWORD_RECOVERY — do nothing, let reset page handle it
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  return null
}