/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/database/dashboard";
import { ActivityRow } from "@/lib/database/activity";

import { getMyUpcomingEvents } from "@/lib/database/calendar";

import ActivityFeed from "@/features/dashboard/component/activity-feed";
import TrainingCalendar from "@/features/dashboard/component/training-calendar";

import { GraduationCap, Users, Calendar as CalendarIcon } from "lucide-react";

export default async function DashboardScreen() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) return <div className="p-6">not authenticated</div>;

  const { data: userRow } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  const userRole = userRow?.role ?? null;

  const userName =
    (auth.user.user_metadata as { name?: string } | null)?.name ||
    auth.user.email?.split("@")[0] ||
    "User";

  const [stats, events] = await Promise.all([
    getDashboardStats(auth.user.id),
    getMyUpcomingEvents(),
  ]);

  const db = userRole === "ADMIN" ? createAdminClient() : supabase;

  const activityQuery = db
    .from("ActivityLog")
    .select("id, created_at, action, message, meta, target_user_id, actor_id, entity_type, entity_id")
    .order("created_at", { ascending: false })
    .limit(30);

  if (userRole !== "ADMIN") {
    activityQuery.eq("target_user_id", auth.user.id);

  }

  const { data: activityRows } = await activityQuery;

  const activity: ActivityRow[] =
    (activityRows ?? []).map((r: any) => ({
      id: r.id,
      created_at: r.created_at,
      action: r.action,
      message: r.message ?? "activity updated",
      meta: r.meta ?? null,
      actor_id: r.actor_id ?? null,
      target_user_id: r.target_user_id,
      entity_type: r.entity_type ?? null,
      entity_id: r.entity_id ?? null,
    })) ?? [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Welcome to EduTrack, {userName}! 👋
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Your comprehensive education management platform
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* LEFT */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {stats.totalProfiles}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Profiles
                </h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {stats.totalTrainings}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Training Records
                </h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow sm:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {stats.totalSeminars}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Seminar Records
                </h3>
              </div>
            </div>

            {/* Quick Actions - Admin Only */}
            {userRole === "ADMIN" && (
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                  Quick Actions
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <a
                    href="/account-approval"
                    className="block p-3 sm:p-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-left"
                  >
                    <h3 className="text-sm sm:text-base font-medium mb-1">
                      Review Pending Requests
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90">
                      Approve or deny account requests
                    </p>
                  </a>

                  <a
                    href="/add-training-seminar"
                    className="block p-3 sm:p-4 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity text-left"
                  >
                    <h3 className="text-sm sm:text-base font-medium mb-1">
                      Manage Trainings/Seminars
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90">
                      Create trainings and assign teachers
                    </p>
                  </a>
                </div>
              </div>
            )}

            {/* ✅ Activity Feed */}
            <ActivityFeed rows={activity} role={userRole} viewerId={auth.user.id} />

          </div>

          {/* RIGHT */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-6">
            <TrainingCalendar events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
