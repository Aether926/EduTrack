import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? requestUrl.origin;

    if (code) {
        const cookieStore = await cookies();
        
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            
            return NextResponse.redirect(new URL('/signin', baseUrl));
        }

        // Success — session established, go to fillUp
        return NextResponse.redirect(new URL('/fillUp', baseUrl));
    }

    // No code present — back to signin
    return NextResponse.redirect(new URL('/signin', baseUrl));
}