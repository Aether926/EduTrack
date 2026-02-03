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

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const { pathname } = req.nextUrl;

    const protectedRoutes = ["/dashboard", "/profile", "/teacher-profiles"];
    const adminRoutes = ["/account-approval", "/add-training-seminar"];
    const authRequiredRoutes = ["/fillUp", "/status"]; // Added /status here

    // Redirect to signin if not authenticated and trying to access protected routes
    if (
        [...protectedRoutes, ...adminRoutes, ...authRequiredRoutes].some(
            (path) => pathname.startsWith(path)
        ) &&
        !user
    ) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    if (user) {
        const { data: profile } = await supabase
            .from("User")
            .select("role, status")
            .eq("id", user.id)
            .single();

        // Admin route protection
        if (adminRoutes.some((path) => pathname.startsWith(path))) {
            if (profile?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // Check if user needs to complete form
        if (!profile && !pathname.startsWith("/fillUp")) {
            return NextResponse.redirect(new URL("/fillUp", req.url));
        }

        // ✅ FIXED: Check if profile exists and status is valid
        if (profile && profile.status) {
            // Check if user is pending approval - EXCLUDE status pages from this check
            if (
                profile.status !== "APPROVED" &&
                !pathname.startsWith("/status/")  // Changed to exclude ALL status pages
            ) {
                return NextResponse.redirect(
                    new URL(`/status/${profile.status}`, req.url)
                );
            }

            // Approved users trying to access fillup/pending should go to dashboard
            if (
                profile.status === "APPROVED" &&
                (pathname.startsWith("/fillUp") || pathname.startsWith("/status/"))
            ) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|signin|signUp|unauthorized).*)",
    ],
};