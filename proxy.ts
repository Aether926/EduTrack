import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    let response = NextResponse.next({
        request: req,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        req.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: req,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    console.log("Session in middleware:", session);

    const { pathname } = req.nextUrl;

    const protectedRoutes = ["/dashboard", "/profile"];
    const adminRoutes = ["/admin"];

    const isProtected = protectedRoutes.some((path) =>
        pathname.startsWith(path)
    );

    const isAdminRoute = adminRoutes.some((path) => pathname.startsWith(path));

    if ((isProtected || isAdminRoute) && !session) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    if (isAdminRoute && session) {
        const { data: profile } = await supabase
            .from("user")
            .select("role")
            .eq("id", session.user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
