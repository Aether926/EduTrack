import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    let response = NextResponse.next({ request: req });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        req.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request: req });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const { pathname } = req.nextUrl;

        

    const protectedRoutes = ["/dashboard", "/profile"];
    const adminRoutes = ["/account-approval"];
    const authRequiredRoutes = ["/fillUp", "/pending-approval"];

    // Redirect to signin if not authenticated and trying to access protected routes
    if ([...protectedRoutes, ...adminRoutes, ...authRequiredRoutes].some(path => pathname.startsWith(path)) && !session) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    if (session) {
        const { data: profile } = await supabase
            .from("User")
            .select("role, status")
            .eq("id", session.user.id)
            .single();

        // Admin route protection
        if (adminRoutes.some(path => pathname.startsWith(path))) {
            if (profile?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // Check if user needs to complete form
        if (!profile && !pathname.startsWith("/fillUp")) {
            return NextResponse.redirect(new URL("/fillUp", req.url));
        }

        // Check if user is pending approval
        if (profile?.status === "PENDING" && !pathname.startsWith("/pending-approval")) {
            return NextResponse.redirect(new URL("/pending-approval", req.url));
        }

        // Approved users trying to access fillup/pending should go to dashboard
        if (profile?.status === "APPROVED" && (pathname.startsWith("/fillUp") || pathname.startsWith("/pending-approval"))) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|signin|signUp|unauthorized).*)",
    ],
};