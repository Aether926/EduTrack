/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const id = user.id
    const email = user.email ?? null

    const profile = await prisma.profile.upsert({
      where: { id },
      update: { email },
      create: { id, email, contactNumber: "" },
    })

    return NextResponse.json({ profile })
  } catch (err) {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}