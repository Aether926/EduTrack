import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AppointmentHistoryClient } from "@/features/admin-actions/appointment-history/components/appointment-history-client";

export const dynamic = "force-dynamic";

export default async function AppointmentHistoryPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: viewer } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (viewer?.role !== "ADMIN") redirect("/");

  const admin = createAdminClient();

  const { data: history } = await admin
    .from("AppointmentHistory")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .order("lastName", { ascending: true });

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const merged = (history ?? []).map((row) => ({
    ...row,
    teacher: profileMap.get(row.teacher_id) ?? null,
  }));

  const teachers = (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
  }));

  return (
    <AppointmentHistoryClient
      rows={merged}
      teachers={teachers}
    />
  );
}