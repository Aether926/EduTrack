/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;
const PUBLIC_ROUTES = ["/qr/", "/reset-password"];
const AUTH_ROUTES = ["/signin", "/signUp", "/forgot-password"];
const SKIP_CLEANUP = ["/signin", "/signUp", "/forgot-password", "/reset-password", "/auth/callback"];
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/teacher-profiles", "/responsibilities", "/compliance", "/documents", "/settings"];
const ADMIN_ROUTES = ["/account-approval", "/add-training-seminar", "/proof-review", "/admin-actions"];
const TEACHER_ONLY_ROUTES = ["/professional-dev", "/responsibilities", "/compliance", "/documents"];

export async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) return response;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !SKIP_CLEANUP.some((p) => pathname.startsWith(p))) {
    const hasStaleSession = req.cookies.getAll().some(({ name }) => name.startsWith("sb-"));
    if (hasStaleSession) {
      const cleanResponse = NextResponse.redirect(new URL("/signin", req.url));
      req.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith("sb-")) cleanResponse.cookies.delete(name);
      });
      return cleanResponse;
    }
  }


  if (AUTH_ROUTES.some((p) => pathname.startsWith(p))) {
    if (!user) return response;
    const { data: urow } = await supabase
      .from("User")
      .select("status")
      .eq("id", user.id).maybeSingle();
    if (!urow) return NextResponse.redirect(new URL("/fillUp", req.url));
    if (urow.status !== "APPROVED")
      return NextResponse.redirect(new URL(`/status/${urow.status}`, req.url));
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/fillUp")) {
    if (!user) return NextResponse.redirect(new URL("/signin", req.url));
    const { data: urow, error } = await supabase
      .from("User")
      .select("status")
      .eq("id", user.id).maybeSingle();
    if (error) return response;
    if (!urow)  return response;
    if (urow.status !== "APPROVED")
      return NextResponse.redirect(new URL(`/status/${urow.status}`, req.url));
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

 
  if (pathname.startsWith("/status")) {
    if (!user) return NextResponse.redirect(new URL("/signin", req.url));
    const { data: urow, error } = await supabase
      .from("User")
      .select("status")
      .eq("id", user.id).maybeSingle();
    if (error) return NextResponse.redirect(new URL("/signin", req.url));
    if (!urow)  return NextResponse.redirect(new URL("/fillUp", req.url));
    const target = urow.status === "APPROVED" ? "/dashboard" : `/status/${urow.status}`;
    if (pathname === target) return response;
    return NextResponse.redirect(new URL(target, req.url));
  }

  const isProtected = [...PROTECTED_ROUTES, ...ADMIN_ROUTES].some((p) => pathname.startsWith(p));
  if (!isProtected) return response;

  if (!user) return NextResponse.redirect(new URL("/signin", req.url));

  const role = (user.user_metadata?.role ?? "TEACHER") as string;
  const isAdmin = ADMIN_ROLES.includes(role as any);

  const { data: urow, error } = await supabase
    .from("User").select("status").eq("id", user.id).maybeSingle();

  if (error) return NextResponse.redirect(new URL("/signin", req.url));
  if (!urow)  return NextResponse.redirect(new URL("/fillUp", req.url));

  if (urow.status !== "APPROVED") {
    if (!pathname.startsWith("/status"))
      return NextResponse.redirect(new URL(`/status/${urow.status}`, req.url));
    return response;
  }

  if (isAdmin && TEACHER_ONLY_ROUTES.some((p) => pathname.startsWith(p)))
    return NextResponse.redirect(new URL("/dashboard", req.url));

  if (!isAdmin && ADMIN_ROUTES.some((p) => pathname.startsWith(p)))
    return NextResponse.redirect(new URL("/dashboard", req.url));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)",
  ],
};