import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value ?? null;
  if (!token) return NextResponse.json({ error: 'no token' }, { status: 401 })

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })

  return NextResponse.json({ user: data.user })
}
