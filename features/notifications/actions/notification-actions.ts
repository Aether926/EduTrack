"use server";
import { createClient } from "@/lib/supabase/server";

export async function fetchNotifications() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ActivityLog")
    .select("id, action, message, meta, created_at, read_at, actor_id, target_user_id")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return data ?? [];
}

export async function markAllRead() {
  const supabase = await createClient();
  await supabase.rpc("mark_notifications_read");
}

export async function clearAllNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("ActivityLog")
    .delete()
    .eq("target_user_id", user.id);
}