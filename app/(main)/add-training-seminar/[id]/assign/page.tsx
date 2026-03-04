/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import TeacherPickerClient from "./teacher-picker-client";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  getAssignedTeacherIds,
  getProfessionalDevelopmentAdmin,
  getTeachersForPicker,
} from "@/lib/database/assignments";
import type { TeacherTableRow } from "@/lib/user";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";



const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "HR"] as const;

export default async function AssignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id: trainingId } = await params;

  const [training, teachers, assignedIds] = await Promise.all([
    getProfessionalDevelopmentAdmin(trainingId),
    getTeachersForPicker(),
    getAssignedTeacherIds(trainingId),
  ]);

  if (!training) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Training/Seminar not found.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Assign Teachers</Badge>
          </div>
        </div>
      </div>

      {/* sub header / details card */}
      <Card className="min-w-0">
        <CardContent className="p-4 md:p-6 space-y-2">
          <div className="text-lg md:text-xl font-semibold leading-tight">
            {training.title}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-2">
              <GraduationCap className="h-3.5 w-3.5" />
              {training.type}
            </Badge>
            <Badge variant="outline">{training.level}</Badge>
            <Badge variant="outline">{training.total_hours} hrs</Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            {training.sponsoring_agency}
            {training.venue ? ` • ${training.venue}` : ""}
          </div>

          {training.description ? (
            <div className="text-sm text-muted-foreground">
              {training.description}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* teacher picker handles rendering */}
      <TeacherPickerClient
        trainingId={trainingId}
        teachers={(teachers ?? []) as TeacherTableRow[]}
        assignedIds={(assignedIds ?? []) as string[]}
      />
    </div>
  );
}