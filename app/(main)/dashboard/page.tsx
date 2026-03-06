/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/database/dashboard";
import { getMyUpcomingEvents, getAllUpcomingEvents } from "@/lib/database/calendar";
import type { ActivityRow } from "@/lib/database/activity";
import { getTeacherSalaryEligibility } from "@/lib/database/salary-eligibility";
import { getAdminDashboardStats } from "@/lib/database/admin-dashboard";

import DashboardView from "@/features/dashboard/component/dashboard-view";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;

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
    if (!auth.user) redirect("/signin");

    const { data: userRow } = await supabase
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .single();

  const role = userRow?.role ?? null;
  const isAdmin = ADMIN_ROLES.includes(role as any);

  const [stats, events, eligibility, adminStats, adminEvents] = await Promise.all([
    getDashboardStats(auth.user.id),
    getMyUpcomingEvents(),
    isAdmin
      ? getTeacherSalaryEligibility(1, 10, "eligible_first")
      : Promise.resolve({ data: [], count: 0 }),
    isAdmin
      ? getAdminDashboardStats()
      : Promise.resolve(null),
    isAdmin
      ? getAllUpcomingEvents()
      : Promise.resolve([]),
  ]);

  const db = isAdmin ? createAdminClient() : supabase;

    const q = db
        .from("ActivityLog")
        .select(
            "id, created_at, action, message, meta, target_user_id, actor_id, entity_type, entity_id",
        )
        .order("created_at", { ascending: false })
        .limit(40);

  if (!isAdmin) q.eq("target_user_id", auth.user.id);

    const { data: activityRows } = await q;

  const activity: (ActivityRow & {
    display_time?: string;
    actor_id?: string | null;
  })[] = (activityRows ?? []).map((r: any) => ({
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
  }));

  return (
    <DashboardView
      role={role}
      viewerId={auth.user.id}
      stats={stats}
      events={events}
      activity={activity as any}
      eligibilityData={eligibility.data}
      eligibilityCount={eligibility.count}
      adminStats={adminStats}
      adminEvents={adminEvents}
    />
  );
}
