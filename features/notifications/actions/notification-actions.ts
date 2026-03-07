import { supabase } from "@/lib/supabaseClient";

async function getUserRole(): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();
  return data?.role ?? null;
}

export async function fetchNotifications() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const role = await getUserRole();
  const isPrivileged =
    role === "ADMIN" || role === "SUPERADMIN" || role === "PRINCIPAL";

  // Build the base query
  const base = supabase
    .from("ActivityLog")
    .select("id, action, message, meta, created_at, read_at, actor_id, target_user_id")
    .order("created_at", { ascending: false })
    .limit(20);

  // Privileged roles see everything; others only see their own
  const { data, error } = await (
    isPrivileged ? base : base.eq("target_user_id", auth.user.id)
  );

  if (error) return [];
  return data ?? [];
}

export async function markAllRead() {
  await supabase.rpc("mark_notifications_read");
}

export async function clearAllNotifications() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  await supabase
    .from("ActivityLog")
    .delete()
    .eq("target_user_id", auth.user.id);
}