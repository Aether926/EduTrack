import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import PublicProfileView from "@/components/public-profile-view";

export default async function QRPublicProfilePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const admin = createAdminClient();
  const nowISO = new Date().toISOString();
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();

  const { data: qrRow, error: qrErr } = await admin
    .from("ProfileQRCode")
    .select("id, user_id, token, is_active, expires_at, scan_count, last_scanned_at")
    .eq("token", token)
    .eq("is_active", true)
    .gt("expires_at", nowISO)
    .single();

  if (qrErr || !qrRow) redirect("/qr/invalid");

  const lastMs = qrRow.last_scanned_at ? new Date(qrRow.last_scanned_at).getTime() : 0;
  const COOLDOWN_MS = 30_000; 

  if (nowMs - lastMs > COOLDOWN_MS) {
    await admin
      .from("ProfileQRCode")
      .update({
        scan_count: (qrRow.scan_count ?? 0) + 1,
        last_scanned_at: nowISO,
      })
      .eq("id", qrRow.id);
  }

  const { data: profile, error: pErr } = await admin
    .from("Profile")
    .select("*")
    .eq("id", qrRow.user_id)
    .single();

  if (pErr || !profile) redirect("/qr/invalid");

  return <PublicProfileView profile={profile} from="qr" />;
}
