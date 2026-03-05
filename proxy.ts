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
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = req.nextUrl;
  const { data: { user } } = await supabase.auth.getUser();

  // ── Stale session cleanup ─────────────────────────────────────────────────
  const skipCleanup = ["/signin", "/signUp", "/forgot-password", "/reset-password", "/auth/callback"];
  if (!user && !skipCleanup.some((p) => pathname.startsWith(p))) {
    const hasStaleSession = req.cookies.getAll().some(({ name }) => name.startsWith("sb-"));
    if (hasStaleSession) {
      const cleanResponse = NextResponse.redirect(new URL("/signin", req.url));
      req.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith("sb-")) cleanResponse.cookies.delete(name);
      });
      return cleanResponse;
    }
  }

  // fully public routes
  const publicRoutes = ["/qr/", "/reset-password"];
  if (publicRoutes.some((p) => pathname.startsWith(p))) return response;

  // STATUS: always resolve based on real DB status
  if (pathname.startsWith("/status")) {
    if (!user) return NextResponse.redirect(new URL("/signin", req.url));

    const { data: urow, error } = await supabase
      .from("User")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return NextResponse.redirect(new URL("/signin", req.url));
    if (!urow) return NextResponse.redirect(new URL("/fillUp", req.url));

    const target =
      urow.status === "APPROVED" ? "/dashboard" : `/status/${urow.status}`;
    if (pathname === target) return response;

    return NextResponse.redirect(new URL(target, req.url));
  }

  const authRoutes = ["/signin", "/signUp", "/forgot-password"];
  if (authRoutes.some((p) => pathname.startsWith(p))) {
    if (!user) return response;

    const { data: urow } = await supabase
      .from("User")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();

    if (!urow) return NextResponse.redirect(new URL("/fillUp", req.url));
    if (urow.status !== "APPROVED")
      return NextResponse.redirect(new URL(`/status/${urow.status}`, req.url));

    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // fillUp: must be accessible when logged in but NO User row yet
  if (pathname.startsWith("/fillUp")) {
    if (!user) return NextResponse.redirect(new URL("/signin", req.url));

    const { data: urow, error } = await supabase
      .from("User")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return response;

    if (urow) {
      if (urow.status !== "APPROVED")
        return NextResponse.redirect(new URL(`/status/${urow.status}`, req.url));
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return response;
  }

  const protectedRoutes = ["/dashboard", "/profile", "/teacher-profiles", "/responsibilities", "/compliance", "/documents", "/settings"];
  const adminRoutes = ["/account-approval", "/add-training-seminar", "/proof-review", "/admin-actions"];

  // Routes only accessible by non-admin roles (e.g. TEACHER)
  const teacherOnlyRoutes = ["/professional-dev", "/responsibilities", "/compliance", "/documents"];

  // if route needs login
  if ([...protectedRoutes, ...adminRoutes].some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (user) {
    const { data: urow, error } = await supabase
      .from("User")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return NextResponse.redirect(new URL("/signin", req.url));
    if (!urow) return NextResponse.redirect(new URL("/fillUp", req.url));

    // Block admins from teacher-only routes (SUPERADMIN bypasses this)
    if (
      urow.role === "ADMIN" &&
      urow.role !== "SUPERADMIN" &&
      teacherOnlyRoutes.some((p) => pathname.startsWith(p))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Block non-admins from admin routes
    if (adminRoutes.some((p) => pathname.startsWith(p)) && urow.role !== "ADMIN" && urow.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (urow.status !== "APPROVED") {
      const target = `/status/${urow.status}`;
      if (!pathname.startsWith("/status") && pathname !== target) {
        return NextResponse.redirect(new URL(target, req.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};