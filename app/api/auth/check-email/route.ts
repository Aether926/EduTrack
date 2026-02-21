import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) return NextResponse.json({ exists: false });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await admin.auth.admin.listUsers();

  if (error) return NextResponse.json({ exists: false });

  const exists = data.users.some(
    (u) => u.email?.toLowerCase() === email
  );

  return NextResponse.json({ exists });
}