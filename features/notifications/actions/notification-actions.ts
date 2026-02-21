import { supabase } from "@/lib/supabaseClient";

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from("ActivityLog")
    .select("id, action, message, meta, created_at, read_at, actor_id, target_user_id")
    .order("created_at", { ascending: false })
    .limit(20);

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