import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../lib/supabaseServer";
import { PrismaClient } from "@prisma/client";

const prisma =
  // reuse existing PrismaClient in dev to avoid exhausting connections
  // @ts-ignore
  globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  // @ts-ignore
  globalThis.prisma = prisma;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // pages that need login
  const protectedPages = [
    "/dashboard",
    "/dashboard/",
    "/dashboard/*",
    "/profile",
    "/profile/*",
    "/fillUp",
  ];

  // pages only admin can open
  const adminPages = [
    "/admin",
    "/admin/*",
  ];

  const needsAuth = protectedPages.some((p) => path.startsWith(p));
  const needsAdmin = adminPages.some((p) => path.startsWith(p));

  if (!needsAuth && !needsAdmin) {
    return NextResponse.next();
  }

  // get token from Supabase cookie
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/logIn", req.url));
  }

  // validate token with supabaseAdmin
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/auth/logIn", req.url));
  }

  const authUser = data.user;

  // get role from Prisma User table
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email ?? "" },
    select: { role: true },
  });

  if (!dbUser) {
    return NextResponse.redirect(new URL("/auth/logIn", req.url));
  }

  // RBAC check
  if (needsAdmin && dbUser.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/fillUp",
    "/admin/:path*",
  ],
};
