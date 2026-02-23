/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/database/dashboard";
import { getMyUpcomingEvents } from "@/lib/database/calendar";
import type { ActivityRow } from "@/lib/database/activity";

import DashboardView from "@/features/dashboard/component/dashboard-view";

export const dynamic = "force-dynamic";

function fmtServer(dt: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dt));
  } catch {
    return dt;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return <div className="p-6">not authenticated</div>;

  const { data: userRow } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  const role = userRow?.role ?? null;

  const [stats, events] = await Promise.all([
    getDashboardStats(auth.user.id),
    getMyUpcomingEvents(),
  ]);

  const db = role === "ADMIN" ? createAdminClient() : supabase;

  const q = db
    .from("ActivityLog")
    .select(
      "id, created_at, action, message, meta, target_user_id, actor_id, entity_type, entity_id"
    )
    .order("created_at", { ascending: false })
    .limit(40);

  if (role !== "ADMIN") q.eq("target_user_id", auth.user.id);

  const { data: activityRows } = await q;

  const activity: (ActivityRow & { display_time?: string; actor_id?: string | null })[] =
    (activityRows ?? []).map((r: any) => ({
      id: r.id,
      created_at: r.created_at,
      display_time: fmtServer(r.created_at),
      action: r.action,
      message: r.message ?? "activity updated",
      meta: r.meta ?? null,
      actor_id: r.actor_id ?? null,
      target_user_id: r.target_user_id,
      entity_type: r.entity_type ?? null,
      entity_id: r.entity_id ?? null,
    })) ?? [];

  return (
    <DashboardView
      role={role}
      viewerId={auth.user.id}
      stats={stats}
      events={events}
      activity={activity as any}
    />
  );
}