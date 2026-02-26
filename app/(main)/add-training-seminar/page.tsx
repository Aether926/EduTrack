/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getAllProfessionalDevelopment } from "@/lib/database/professional-development";
import type { TrainingSeminarTableRow, ProfessionalDevelopment } from "@/lib/user";

import AddTrainingAndSeminar from "@/components/add-training-and-seminar";

import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "HR"] as const;

export default async function AddTrainingSeminarPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const admin = createAdminClient();
  const { data: viewer } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (viewer?.role ?? "USER").toString();
  if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

  const professionalDev = await getAllProfessionalDevelopment();

  const tableData: TrainingSeminarTableRow[] = professionalDev.map(
    (item: ProfessionalDevelopment) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      level: item.level,
      date: format(new Date(item.start_date), "MMM dd, yyyy"),
      totalHours: item.total_hours,
      sponsor: item.sponsoring_agency,
      raw: item,
    })
  );

  const total = tableData.length;
  const trainings = tableData.filter((t) => String(t.type).toUpperCase() === "TRAINING").length;
  const seminars = total - trainings;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Training & Seminar Management</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              {total} records
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <GraduationCap className="h-3.5 w-3.5" />
              {trainings} trainings
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              {seminars} seminars
            </Badge>
          </div>
        </div>
      </div>

      <AddTrainingAndSeminar data={tableData} />
    </div>
  );
}