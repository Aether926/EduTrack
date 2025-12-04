// /components/supabase-auth-listener.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient' 


export default function SupabaseAuthListener() {
  const router = useRouter()

  useEffect(() => {
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
       
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            router.refresh();
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null 
}