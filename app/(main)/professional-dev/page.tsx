import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

import TrainingsSeminars from "@/components/trainings-seminars";
import { getMyTrainingSeminars } from "@/lib/database/trainings";

import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2 } from "lucide-react";

export default async function ProfessionalDevelopmentPage() {
  // auth user
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  // role (use admin client so it works even if RLS is strict)
  const admin = createAdminClient();
  const { data: userRow } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (userRow?.role ?? "USER").toString();

  // training rows
  const rows = await getMyTrainingSeminars();

  const total = rows.length;
  const approved = rows.filter(
    (r) => String(r.status).toUpperCase() === "APPROVED"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header (same layout as Teacher Profiles) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Training / Seminar Records</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              {total} record{total === 1 ? "" : "s"}
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {approved} approved
            </Badge>
          </div>
        </div>
      </div>

      <TrainingsSeminars data={rows} />
    </div>
  );
}