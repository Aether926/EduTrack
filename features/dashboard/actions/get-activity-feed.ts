"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export type ViewerRole = "TEACHER" | "HR_ADMIN" | "ADMIN";

export type ActivityRow = {
  id: string;
  target_user_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  message: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

export async function getActivityFeed(viewerRole: ViewerRole) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];

  // admin can read all; teacher reads only own (RLS also enforces this)
  const db = viewerRole === "ADMIN" ? createAdminClient() : supabase;

  const q = db
    .from("ActivityLog")
    .select(
      "id, target_user_id, actor_id, action, entity_type, entity_id, message, meta, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (viewerRole !== "ADMIN") q.eq("target_user_id", uid);

  const { data, error } = await q;
  if (error) return [];

  return (data ?? []) as ActivityRow[];
}
