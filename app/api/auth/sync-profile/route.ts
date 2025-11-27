import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json()
    if (!accessToken) return NextResponse.json({ error: 'no token' }, { status: 400 })


    const { data, error } = await supabaseAdmin.auth.getUser(accessToken)
    if (error || !data.user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    }

    const user = data.user
    const supabaseId = user.id
    const email = user.email ?? null
    const name = (user.user_metadata as any)?.full_name ?? (user.user_metadata as any)?.name ?? null
    const avatarUrl = (user.user_metadata as any)?.avatar_url ?? null

 
    const profile = await prisma.profile.upsert({
      where: { id: supabaseId },
      update: { email, name, avatarUrl },
      create: { supabaseId, email, name, avatarUrl }
    })


    return NextResponse.json({ profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
