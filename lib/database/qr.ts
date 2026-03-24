import "server-only";
import crypto from "crypto";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const QR_TTL_DAYS = 30;
const COOLDOWN_SECONDS = 60;

function addDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function makeToken() {
 
  return crypto.randomBytes(24).toString("base64url");
}

export async function rotateQRTokenForCurrentUser(): Promise<string> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const user = auth.user;
  if (!user) throw new Error("not authenticated");

  const admin = createAdminClient();


  const { data: lastRow, error: lastErr } = await admin
    .from("ProfileQRCode")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastErr) throw new Error(lastErr.message);

  if (lastRow?.created_at) {
    const lastMs = new Date(lastRow.created_at).getTime();
    const nowMs = Date.now();
    const diffSeconds = Math.floor((nowMs - lastMs) / 1000);

    if (diffSeconds < COOLDOWN_SECONDS) {
      const remaining = COOLDOWN_SECONDS - diffSeconds;
      throw new Error(`Please wait ${remaining}s before generating a new QR.`);
    }
  }

  const { error: delErr } = await admin
    .from("ProfileQRCode")
    .delete()
    .eq("user_id", user.id);

  if (delErr) throw new Error(delErr.message);

  const token = makeToken();

  const { error: insErr } = await admin.from("ProfileQRCode").insert({
    user_id: user.id,
    token,
    is_active: true,
    created_at: new Date().toISOString(),
    expires_at: addDaysIso(QR_TTL_DAYS),
    scan_count: 0,
    last_scanned_at: null,
    qr_image_url: null,
  });

  if (insErr) throw new Error(insErr.message);

  return token;
}

export async function getProfileByQRToken(token: string) {
  if (!token?.trim()) return null;

  const admin = createAdminClient();

  const { data: qrRow, error: qrErr } = await admin
    .from("ProfileQRCode")
    .select("user_id, expires_at, is_active, scan_count")
    .eq("token", token)
    .single();

  if (qrErr || !qrRow) return null;
  if (!qrRow.is_active) return null;

  const expiresAt = qrRow.expires_at ? new Date(qrRow.expires_at).getTime() : 0;
  if (!expiresAt || Date.now() > expiresAt) return null;

  const { data: profile, error: pErr } = await admin
    .from("Profile")
    .select("*")
    .eq("id", qrRow.user_id)
    .single();

  if (pErr || !profile) return null;

  await admin
    .from("ProfileQRCode")
    .update({
      scan_count: (qrRow.scan_count ?? 0) + 1,
      last_scanned_at: new Date().toISOString(),
    })
    .eq("token", token);

  return profile;
}
