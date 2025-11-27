import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "./lib/supabaseServer";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard"];
  const adminRoutes = ["/admin"]; // <-- put admin-only paths here

  const isProtected = protectedRoutes.some((path) =>
    pathname.startsWith(path)
  );

  const isAdminRoute = adminRoutes.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/logIn";
    return NextResponse.redirect(url);
  }

  // get supabase auth user
  const { data: auth, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !auth?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/logIn";
    return NextResponse.redirect(url);
  }

  const userId = auth.user.id;

  // get user role from your custom table
  const { data: profile } = await supabaseAdmin
    .from("user")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile) {
    const url = req.nextUrl.clone();
    url.pathname = "/logIn";
    return NextResponse.redirect(url);
  }

  // admin route check
  if (isAdminRoute && profile.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/unauthorized"; // create this page
    return NextResponse.redirect(url);
  } 

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*","/dashboard", "/app/:path*", "/admin/:path*"],
};
