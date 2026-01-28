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

    const protectedRoutes = ["/dashboard", "/profile"];
    const adminRoutes = ["/account-approval"];
    const authRequiredRoutes = ["/fillUp", "/pending-approval"];

    
    if (
        [...protectedRoutes, ...adminRoutes, ...authRequiredRoutes].some(
            (path) => pathname.startsWith(path)
        ) &&
        !user
    ) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    if (user) {
        const { data: userRecord } = await supabase
            .from("User")
            .select("role, status")
            .eq("id", user.id)
            .single();

        const { data: profileRecord } = await supabase
            .from("Profile")
            .select("id")
            .eq("id", user.id)
            .single();
            
            if (adminRoutes.some((path) => pathname.startsWith(path))) {
                if (userRecord?.role !== "ADMIN") {
                    return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        if (!userRecord && !pathname.startsWith("/fillUp")) {
            return NextResponse.redirect(new URL("/fillUp", req.url));
        }

       
        if (userRecord && !profileRecord && !pathname.startsWith("/fillUp")) {
            return NextResponse.redirect(new URL("/fillUp", req.url));
        }

        if (
            userRecord?.status != "APPROVED" &&
            !pathname.startsWith(`/status/${userRecord?.status}`)
        ) {
            return NextResponse.redirect(
                new URL("/status/" + userRecord?.status, req.url)
            );
        }

       
        if (
            userRecord?.status === "APPROVED" &&
            profileRecord &&
            !pathname.startsWith("/dashboard") &&
            (pathname.startsWith("/fillUp") || pathname.startsWith("/status/"))
        ) {
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
