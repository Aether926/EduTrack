import { createClient } from "@/lib/supabase/server";

export type ActivityRow = {
  id: string;
  created_at: string;
  actor_id: string | null;
  target_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  message: string;
  meta: Record<string, unknown> | null;
};

async function getRole(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("User").select("role").eq("id", userId).single();
  return data?.role ?? null;
}

export async function getDashboardActivity(limit = 10): Promise<ActivityRow[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const role = await getRole(auth.user.id);

  const q = supabase
    .from("ActivityLog")
    .select("id,created_at,actor_id,target_user_id,action,entity_type,entity_id,message,meta")
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } =
    role === "ADMIN"
      ? await q
      : await q.eq("target_user_id", auth.user.id);

  if (error || !data) return [];
  return data as ActivityRow[];
}
