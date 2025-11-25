import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '../lib/supabaseServer'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // protect /dashboard and /app routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/app')) {
    const token = req.cookies.get('sb-access-token')?.value ?? null
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/logIn'
      return NextResponse.redirect(url)
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/logIn'
      return NextResponse.redirect(url)
    }

  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/app/:path*']
}
