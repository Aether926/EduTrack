/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { pdf } from "@react-pdf/renderer";
import { ServiceRecordDocument } from "@/features/profiles/lib/pdf/service-record-pdf";
import React from "react";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teacherId = auth.user.id;
  const admin = createAdminClient(); // ← use admin for all data fetches

  const [
    { data: profile },
    { data: hr },
    { data: appointments },
    { data: attendance },
  ] = await Promise.all([
    admin.from("Profile").select("firstName, middleInitial, lastName, dateOfBirth, gender, civilStatus, nationality, address, email, contactNumber, pagibigNo, philHealthNo, gsisNo, tinNo, bachelorsDegree, postGraduate, subjectSpecialization").eq("id", teacherId).single(),
    admin.from("ProfileHR").select("employeeId, plantillaNo, position, dateOfOriginalAppointment, dateOfLatestAppointment").eq("id", teacherId).single(),
    admin.from("AppointmentHistory").select("id, appointment_type, position, start_date, end_date, memo_no, remarks").eq("teacher_id", teacherId).eq("status", "APPROVED").order("start_date", { ascending: true }),
    admin.from("Attendance").select("id, status, training_id").eq("teacher_id", teacherId).eq("status", "APPROVED"),
  ]);

  const trainingIds = (attendance ?? []).map((a) => a.training_id);
  const { data: pdRows } = trainingIds.length
    ? await admin.from("ProfessionalDevelopment").select("id, title, type, start_date, end_date, total_hours, sponsoring_agency").in("id", trainingIds)
    : { data: [] };

  const pdMap = new Map((pdRows ?? []).map((p) => [p.id, p]));
  const trainings = (attendance ?? []).map((a) => {
    const pd = pdMap.get(a.training_id);
    return {
      title: pd?.title ?? "—",
      type: pd?.type ?? "—",
      startDate: pd?.start_date ?? "",
      endDate: pd?.end_date ?? "",
      totalHours: pd?.total_hours ? String(pd.total_hours) : "—",
      sponsor: pd?.sponsoring_agency ?? "—",
      status: a.status ?? "—",
    };
  });

  const data = {
    profile: profile ?? {} as any,
    hr: hr ?? {} as any,
    appointments: appointments ?? [],
    trainings,
    schoolName: "Valencia National High School",
    division: "Schools Division of Ormoc City",
    region: "Region VIII",
    generatedAt: new Date().toLocaleDateString("en-PH", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
  };
  const buffer = await pdf(
    React.createElement(ServiceRecordDocument, { data })
  ).toBuffer();

  const lastName = profile?.lastName ?? "teacher";
  const year = new Date().getFullYear();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="service-record-${lastName}-${year}.pdf"`,
    },
  });
}