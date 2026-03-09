/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_cache } from "next/cache";
import { createAdminClient, createClient, getUser } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/database/dashboard";
import { getMyUpcomingEvents, getAllUpcomingEvents } from "@/lib/database/calendar";
import type { ActivityRow } from "@/lib/database/activity";
import { getTeacherSalaryEligibility } from "@/lib/database/salary-eligibility";
import { getAdminDashboardStats } from "@/lib/database/admin-dashboard";
import DashboardView from "@/features/dashboard/component/dashboard-view";
import { redirect } from "next/navigation";

function getCachedAdminStats() {
  return unstable_cache(
    async () => getAdminDashboardStats(),
    ["admin-dashboard-stats"],
    { revalidate: 300, tags: ["admin-dashboard-stats"] }
  )();
}

function getCachedAdminEvents() {
  return unstable_cache(
    async () => getAllUpcomingEvents(),
    ["admin-upcoming-events"],
    { revalidate: 300, tags: ["admin-upcoming-events"] }
  )();
}

function getCachedEligibility() {
  return unstable_cache(
    async () => getTeacherSalaryEligibility(1, 10, "eligible_first"),
    ["teacher-salary-eligibility"],
    { revalidate: 300, tags: ["teacher-salary-eligibility"] }
  )();
}

function getCachedDashboardStats(userId: string) {
  return unstable_cache(
    async () => getDashboardStats(userId),
    ["dashboard-stats", userId],
    { revalidate: 300, tags: [`dashboard-stats-${userId}`] }
  )();
}

function getCachedUpcomingEvents(userId: string) {
  return unstable_cache(
    async () => getMyUpcomingEvents(),
    ["upcoming-events", userId],
    { revalidate: 300, tags: [`upcoming-events-${userId}`] }
  )();
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPERADMIN"]);

function fmtServer(dt: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(dt));
  } catch { return dt; }
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  // Role from metadata — zero DB call
  const role = user.user_metadata?.role ?? null;
  const isAdmin = ADMIN_ROLES.has(role);
  const supabase = await createClient();

  const [stats, events, eligibility, adminStats, adminEvents] = await Promise.all([
    getCachedDashboardStats(user.id),
    getCachedUpcomingEvents(user.id),
    isAdmin ? getCachedEligibility()  : Promise.resolve({ data: [], count: 0 }),
    isAdmin ? getCachedAdminStats()   : Promise.resolve(null),
    isAdmin ? getCachedAdminEvents()  : Promise.resolve([]),
  ]);

  // ActivityLog intentionally NOT cached — must be real-time
  const db = isAdmin ? createAdminClient() : supabase;
  const q = db
    .from("ActivityLog")
    .select("id, created_at, action, message, meta, target_user_id, actor_id, entity_type, entity_id")
    .order("created_at", { ascending: false })
    .limit(40);

  if (!isAdmin) q.eq("target_user_id", user.id);

  const { data: activityRows } = await q;

  const activity: (ActivityRow & {
    display_time?: string;
    actor_id?: string | null;
  })[] = (activityRows ?? []).map((r: any) => ({
    id:             r.id,
    created_at:     r.created_at,
    display_time:   fmtServer(r.created_at),
    action:         r.action,
    message:        r.message ?? "activity updated",
    meta:           r.meta ?? null,
    actor_id:       r.actor_id ?? null,
    target_user_id: r.target_user_id,
    entity_type:    r.entity_type ?? null,
    entity_id:      r.entity_id ?? null,
  }));

  return (
    <DashboardView
      role={role}
      viewerId={user.id}
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