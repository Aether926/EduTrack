import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClipboardList, Users, FileCheck } from "lucide-react";
import Link from "next/link";

export default async function AdminActionsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login");

  const { data: userRow } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (userRow?.role !== "ADMIN") redirect("/");

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Admin Actions
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Manage teacher profiles, HR records, and pending requests
          </p>
        </header>

        {/* Action Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <Link
            href="/admin-actions/queue"
            className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow block"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
              HR Change Requests
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review and approve pending employment info change requests from teachers
            </p>
          </Link>

          <Link
            href="/admin-actions/teachers"
            className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow block"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
              Teacher Profiles
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View and directly edit HR records for all teachers
            </p>
          </Link>

          <Link
            href="/admin-actions/appointment-history"
            className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow block sm:col-span-2 xl:col-span-1"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
              Appointment History
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review appointment change requests and manage promotion timelines
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}