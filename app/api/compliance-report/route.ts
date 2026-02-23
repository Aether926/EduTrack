/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
    
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "teacher" or "admin"
  const schoolYear = searchParams.get("school_year") ?? "SY 2025-2026";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EduTrack";
  workbook.created = new Date();

  if (type === "admin") {
    // verify admin
    const { data: user } = await admin.from("User").select("role").eq("id", auth.user.id).single();
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // fetch all compliance data
    const { data: compliance } = await admin.from("TeacherTrainingCompliance").select("*");
    const teacherIds = (compliance ?? []).map((c) => c.teacher_id);
    const { data: profiles } = teacherIds.length
      ? await admin.from("Profile").select("id, firstName, lastName, email").in("id", teacherIds)
      : { data: [] };

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const sheet = workbook.addWorksheet("Compliance Report");

    // title rows
    sheet.mergeCells("A1:G1");
    sheet.getCell("A1").value = "Training Compliance Report";
    sheet.getCell("A1").font = { bold: true, size: 14, name: "Arial" };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2:G2");
    sheet.getCell("A2").value = schoolYear;
    sheet.getCell("A2").font = { size: 11, name: "Arial", italic: true };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.mergeCells("A3:G3");
    sheet.getCell("A3").value = `Generated: ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`;
    sheet.getCell("A3").font = { size: 9, name: "Arial", color: { argb: "FF888888" } };
    sheet.getCell("A3").alignment = { horizontal: "center" };

    sheet.addRow([]);

    // headers
    const headerRow = sheet.addRow([
      "Teacher Name", "Email", "Total Hours", "Required Hours", "Remaining Hours", "Status", "Last Updated"
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, name: "Arial", color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
    });

    // status color map
    const statusColors: Record<string, string> = {
      COMPLIANT: "FFD1FAE5",
      AT_RISK: "FFFEF3C7",
      NON_COMPLIANT: "FFFEE2E2",
    };

    const statusLabels: Record<string, string> = {
      COMPLIANT: "Compliant",
      AT_RISK: "At Risk",
      NON_COMPLIANT: "Non-Compliant",
    };

    // sort: NON_COMPLIANT first
    const sorted = [...(compliance ?? [])].sort((a, b) => {
      const order: Record<string, number> = { NON_COMPLIANT: 0, AT_RISK: 1, COMPLIANT: 2 };
      return (order[a.status] ?? 0) - (order[b.status] ?? 0);
    });

    sorted.forEach((c) => {
      const profile = profileMap.get(c.teacher_id);
      const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Unknown";
      const row = sheet.addRow([
        fullName,
        profile?.email ?? "—",
        c.total_hours,
        c.required_hours,
        c.remaining_hours,
        statusLabels[c.status] ?? c.status,
        new Date(c.updated_at).toLocaleDateString("en-PH"),
      ]);

      const bgColor = statusColors[c.status] ?? "FFFFFFFF";
      row.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          bottom: { style: "hair", color: { argb: "FFEEEEEE" } },
        };
      });

      // left-align name and email
      row.getCell(1).alignment = { horizontal: "left" };
      row.getCell(2).alignment = { horizontal: "left" };
    });

    // summary row
    sheet.addRow([]);
    const totalCompliant = sorted.filter((c) => c.status === "COMPLIANT").length;
    const totalAtRisk = sorted.filter((c) => c.status === "AT_RISK").length;
    const totalNonCompliant = sorted.filter((c) => c.status === "NON_COMPLIANT").length;

    const summaryRow = sheet.addRow([
      `Total: ${sorted.length} teachers`,
      "",
      `=SUM(C6:C${5 + sorted.length})`,
      "",
      "",
      `✅ ${totalCompliant} Compliant  |  ⚠️ ${totalAtRisk} At Risk  |  ❌ ${totalNonCompliant} Non-Compliant`,
      "",
    ]);
    summaryRow.eachCell((cell) => {
      cell.font = { bold: true, name: "Arial", size: 10 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    });
    sheet.mergeCells(`F${summaryRow.number}:G${summaryRow.number}`);

    // column widths
    sheet.columns = [
      { width: 28 }, // name
      { width: 30 }, // email
      { width: 14 }, // total hours
      { width: 16 }, // required
      { width: 16 }, // remaining
      { width: 18 }, // status
      { width: 16 }, // updated
    ];
    sheet.getRow(5).height = 22;

  } else {
    // teacher report
    const teacherId = auth.user.id;

    const [
      { data: compliance },
      { data: profile },
      { data: policy },
    ] = await Promise.all([
      admin.from("TeacherTrainingCompliance").select("*").eq("teacher_id", teacherId).single(),
      admin.from("Profile").select("firstName, lastName, email").eq("id", teacherId).single(),
      admin.from("TrainingCompliancePolicy").select("*").eq("school_year", schoolYear).maybeSingle(),
    ]);

    const { data: attendance } = await admin
      .from("Attendance")
      .select("id, approved_hours, status, result, training_id, ProfessionalDevelopment(title, type, start_date, end_date, total_hours, sponsoring_agency)")
      .eq("teacher_id", teacherId)
      .eq("status", "APPROVED")
      .eq("result", "PASSED");

    const periodStart = policy?.period_start ?? null;
    const periodEnd = policy?.period_end ?? null;

    const countedTrainings = (attendance ?? []).filter((t) => {
      const pd = t.ProfessionalDevelopment as any;
      if (!pd?.start_date || !pd?.end_date) return false;
      if (!periodStart || !periodEnd) return true;
      return pd.start_date >= periodStart && pd.end_date <= periodEnd;
    });

    const sheet = workbook.addWorksheet("My Compliance Report");
    const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Teacher";

    // title
    sheet.mergeCells("A1:F1");
    sheet.getCell("A1").value = "Training Compliance Report";
    sheet.getCell("A1").font = { bold: true, size: 14, name: "Arial" };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2:F2");
    sheet.getCell("A2").value = schoolYear;
    sheet.getCell("A2").font = { size: 11, italic: true, name: "Arial" };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.addRow([]);

    // teacher info
    sheet.addRow(["Teacher:", fullName]);
    sheet.addRow(["Email:", profile?.email ?? "—"]);
    sheet.addRow(["Period:", policy ? `${policy.period_start} to ${policy.period_end}` : "—"]);
    sheet.addRow(["Generated:", new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })]);
    [4, 5, 6, 7].forEach((r) => {
      sheet.getRow(r).getCell(1).font = { bold: true, name: "Arial" };
    });

    sheet.addRow([]);

    // compliance summary
    const statusLabels: Record<string, string> = {
      COMPLIANT: "Compliant",
      AT_RISK: "At Risk",
      NON_COMPLIANT: "Non-Compliant",
    };
    const statusColors: Record<string, string> = {
      COMPLIANT: "FFD1FAE5",
      AT_RISK: "FFFEF3C7",
      NON_COMPLIANT: "FFFEE2E2",
    };

    const summaryHeaderRow = sheet.addRow(["Compliance Summary"]);
    sheet.mergeCells(`A${summaryHeaderRow.number}:F${summaryHeaderRow.number}`);
    summaryHeaderRow.getCell(1).font = { bold: true, size: 11, name: "Arial", color: { argb: "FFFFFFFF" } };
    summaryHeaderRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
    summaryHeaderRow.getCell(1).alignment = { horizontal: "center" };

    const status = compliance?.status ?? "NON_COMPLIANT";
    const summaryRows = [
      ["Total Hours Completed", `${compliance?.total_hours ?? 0}h`],
      ["Required Hours", `${compliance?.required_hours ?? 0}h`],
      ["Remaining Hours", `${compliance?.remaining_hours ?? 0}h`],
      ["Compliance Status", statusLabels[status] ?? status],
    ];

    summaryRows.forEach(([label, value]) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).font = { bold: true, name: "Arial", size: 10 };
      row.getCell(2).font = { name: "Arial", size: 10 };
      if (label === "Compliance Status") {
        row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusColors[status] } };
        row.getCell(2).font = { bold: true, name: "Arial", size: 10 };
      }
    });

    sheet.addRow([]);

    // counted trainings
    const trainHeaderRow = sheet.addRow(["Title", "Type", "Sponsor", "Start Date", "End Date", "Hours Completed"]);
    trainHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, name: "Arial", color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
      cell.alignment = { horizontal: "center" };
    });

    countedTrainings.forEach((t) => {
      const pd = t.ProfessionalDevelopment as any;
      const row = sheet.addRow([
        pd?.title ?? "—",
        pd?.type ?? "—",
        pd?.sponsoring_agency ?? "—",
        pd?.start_date ?? "—",
        pd?.end_date ?? "—",
        t.approved_hours ?? pd?.total_hours ?? 0,
      ]);
      row.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
        cell.alignment = { horizontal: "center" };
        cell.border = { bottom: { style: "hair", color: { argb: "FFEEEEEE" } } };
      });
      row.getCell(1).alignment = { horizontal: "left" };
    });

    // total hours formula
    const totalRow = sheet.addRow(["", "", "", "", "Total:", `=SUM(F${trainHeaderRow.number + 1}:F${trainHeaderRow.number + countedTrainings.length})`]);
    totalRow.getCell(5).font = { bold: true, name: "Arial" };
    totalRow.getCell(6).font = { bold: true, name: "Arial" };

    sheet.columns = [
      { width: 32 }, // title
      { width: 14 }, // type
      { width: 20 }, // sponsor
      { width: 14 }, // start
      { width: 14 }, // end
      { width: 18 }, // hours
    ];
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = type === "admin"
    ? `compliance-report-${schoolYear.replace(/\s/g, "-")}.xlsx`
    : `my-compliance-${schoolYear.replace(/\s/g, "-")}.xlsx`;

  return new NextResponse(buffer as Buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
} 
