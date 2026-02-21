import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import PublicProfileView from "@/components/public-profile-view";

import type { ViewerRole } from "@/features/profiles/types/viewer-role";
import type { TrainingRow } from "@/features/profiles/types/trainings";

function isPublicSafeTraining(a: { status: string; result: string | null }) {
  const s = (a.status ?? "").toUpperCase();
  const r = (a.result ?? "").toUpperCase();
  return s === "APPROVED" && r === "PASSED";
}

export default async function QRPublicProfilePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1) Admin client = validate QR + fetch target profile (works for guests)
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

  const { data: profileHR, error: hrError } = await admin
    .from("ProfileHR")
    .select("*")
    .eq("id", qrRow.user_id)
    .single();

// Merge them
const fullProfile = { ...profile, ...profileHR };


  // 2) Server client = detect viewer session + role
  const viewerClient = await createClient();
  const { data: auth } = await viewerClient.auth.getUser();

  let viewerRole: ViewerRole = "GUEST";

  if (auth.user?.id) {
    const { data: viewer } = await viewerClient
      .from("User")
      .select("role")
      .eq("id", auth.user.id)
      .single();

    viewerRole = viewer?.role === "ADMIN" ? "ADMIN" : "GUEST";
  }

  const adminMode = viewerRole === "ADMIN";

  // 3) Trainings
  const { data: attendanceRows, error: aErr } = await admin
    .from("Attendance")
    .select("id, training_id, status, result, proof_url, proof_path, created_at")
    .eq("teacher_id", qrRow.user_id)
    .order("created_at", { ascending: false });

  const serializedProfile = JSON.parse(JSON.stringify(fullProfile));

  if (aErr || !attendanceRows || attendanceRows.length === 0) {
    return (
      <PublicProfileView
        profile={JSON.parse(JSON.stringify(fullProfile))}
        trainings={[]}
        from="qr"
        viewerRole={viewerRole}
      />
    );
  }

  const attendance = attendanceRows as Array<{
    id: string;
    training_id: string;
    status: string;
    result: string | null;
    proof_url: string | null;
    proof_path: string | null;
    created_at: string;
  }>;

  const filtered = adminMode ? attendance : attendance.filter(isPublicSafeTraining);

  if (filtered.length === 0) {
    return (
      <PublicProfileView
        profile={JSON.parse(JSON.stringify(fullProfile))}
        trainings={[]}
        from="qr"
        viewerRole={viewerRole}
      />
    );
  }

  const trainingIds = Array.from(new Set(filtered.map((r) => r.training_id)));

  const { data: pdRows } = await admin
    .from("ProfessionalDevelopment")
    .select("id, title, type, level, start_date, end_date, total_hours, sponsoring_agency")
    .in("id", trainingIds.length ? trainingIds : ["__none__"]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdMap = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdRows ?? []).forEach((r: any) => pdMap.set(String(r.id), r));

  const trainings: TrainingRow[] = filtered.map((a) => {
    const pd = pdMap.get(String(a.training_id));

    return {
      attendanceId: String(a.id),
      trainingId: String(a.training_id),

      title: pd?.title ?? "(missing title)",
      type: pd?.type ?? "",
      level: pd?.level ?? "",
      startDate: pd?.start_date ?? "",
      endDate: pd?.end_date ?? "",
      totalHours: pd?.total_hours != null ? String(pd.total_hours) : "",
      sponsor: pd?.sponsoring_agency ?? "",

      status: a.status ?? "",
      result: a.result ?? null,

      // only admins get proof data
      proof_url: adminMode ? a.proof_url ?? null : null,
      proof_path: adminMode ? a.proof_path ?? null : null,

      created_at: a.created_at ?? "",
    };
  });

  return (
    <PublicProfileView
      profile={JSON.parse(JSON.stringify(fullProfile))}
      trainings={trainings}
      from="qr"
      viewerRole={viewerRole}
    />
  );
}
