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
  const type = searchParams.get("type");
  const schoolYear = searchParams.get("school_year") ?? "SY 2025-2026";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EduTrack";
  workbook.created = new Date();

  // ── Palette ─────────────────────────────────────────────────────────────────
  const C = {
    white:       "FFFFFFFF",
    offWhite:    "FFF9F9F9",
    rowAlt:      "FFF5F7FA",
    headerBg:    "FFFFFFFF",   
    headerFg:    "FF1A1A1A",
    subBg:       "FFFFFFFF", 
    subFg:       "FF1A1A1A",
    borderMed:   "FFAAAAAA",
    borderLight: "FFBBBBBB",
    textDark:    "FF1A1A1A",
    textMid:     "FF444444",
    textMuted:   "FF888888",
    compliantBg: "FFE6F4EA", compliantFg: "FF1E6B2E",
    atRiskBg:    "FFFEF3CD", atRiskFg:    "FF7D5A00",
    nonCompBg:   "FFFCE8E8", nonCompFg:   "FF8B0000",
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const solid = (argb: string): ExcelJS.Fill =>
    ({ type: "pattern", pattern: "solid", fgColor: { argb } });

  const fnt = (size = 10, bold = false, argb = C.textDark, italic = false): Partial<ExcelJS.Font> =>
    ({ name: "Arial", size, bold, italic, color: { argb } });

  const aln = (
    h: ExcelJS.Alignment["horizontal"] = "left",
    v: ExcelJS.Alignment["vertical"]   = "middle",
    wrap = false
  ): Partial<ExcelJS.Alignment> => ({ horizontal: h, vertical: v, wrapText: wrap });

  const hairBorder = (): Partial<ExcelJS.Borders> => {
    const s = { style: "thin" as const, color: { argb: C.borderLight } };
    return { top: s, bottom: s, left: s, right: s };
  };

  const thickBorder = (): Partial<ExcelJS.Borders> => {
    const s = { style: "medium" as const, color: { argb: C.borderMed } };
    return { top: s, bottom: s, left: s, right: s };
  };

  const statusStyle = (status: string) => {
    if (status === "COMPLIANT") return { bg: C.compliantBg, fg: C.compliantFg, label: "Compliant"     };
    if (status === "AT_RISK")   return { bg: C.atRiskBg,    fg: C.atRiskFg,    label: "At Risk"       };
    return                             { bg: C.nonCompBg,   fg: C.nonCompFg,   label: "Non-Compliant" };
  };

  // ── Letterhead (rows 1–8) ────────────────────────────────────────────────────
  const buildLetterhead = (sheet: ExcelJS.Worksheet, colCount: number, lastCol: string, title: string) => {
    const merge = (r: number) => sheet.mergeCells(`A${r}:${lastCol}${r}`);
    const c     = (r: number) => sheet.getCell(`A${r}`);

    sheet.getRow(1).height = 13;
    merge(1);
    c(1).border = hairBorder();
    c(1).value     = "Republic of the Philippines";
    c(1).font      = fnt(9, false, C.textMuted, true) as ExcelJS.Font;
    c(1).alignment = aln("center");

    sheet.getRow(2).height = 20;
    merge(2);
    c(2).border = hairBorder();
    c(2).value     = "Department of Education";
    c(2).font      = fnt(14, true, C.textDark) as ExcelJS.Font;
    c(2).alignment = aln("center");

    sheet.getRow(3).height = 15;
    merge(3);
    c(3).border = hairBorder();
    c(3).value     = "Valencia National High School";
    c(3).font      = fnt(11, true, C.textDark) as ExcelJS.Font;
    c(3).alignment = aln("center");

    // thin navy rule
    sheet.getRow(4).height = 3;
    for (let col = 1; col <= colCount; col++) sheet.getCell(4, col).fill = solid(C.headerBg);

    // report title bar
    sheet.getRow(5).height = 22;
    merge(5);
    c(5).border = hairBorder();
    c(5).value     = title;
    c(5).font      = fnt(12, true, C.headerFg) as ExcelJS.Font;
    c(5).fill      = solid(C.headerBg);
    c(5).alignment = aln("center");

    // thin navy rule
    sheet.getRow(6).height = 3;
    for (let col = 1; col <= colCount; col++) sheet.getCell(6, col).fill = solid(C.headerBg);

    // meta row
    sheet.getRow(7).height = 15;
    merge(7);
    c(7).border = hairBorder();
    const dateStr  = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    c(7).value     = `School Year: ${schoolYear}     |     Date Generated: ${dateStr}`;
    c(7).font      = fnt(9, false, C.textMuted) as ExcelJS.Font;
    c(7).fill      = solid(C.offWhite);
    c(7).alignment = aln("center");

    sheet.getRow(8).height = 5;

    for (let col = 1; col <= colCount; col++) {
      sheet.getCell(1, col).border = { top: { style: "thin", color: { argb: C.borderMed } } };
      sheet.getCell(7, col).border = { bottom: { style: "thin", color: { argb: C.borderMed } } };
      }

      for (let row = 1; row <= 7; row++) {
        sheet.getCell(row, 1).border        = { ...sheet.getCell(row, 1).border, left:  { style: "thin", color: { argb: C.borderMed } } };
        sheet.getCell(row, colCount).border = { ...sheet.getCell(row, colCount).border, right: { style: "thin", color: { argb: C.borderMed } } };
      }
  };

  // ── Column headers ───────────────────────────────────────────────────────────
  const buildColHeaders = (sheet: ExcelJS.Worksheet, rowNum: number, headers: string[]) => {
    sheet.getRow(rowNum).height = 26;
    headers.forEach((h, i) => {
      const cell     = sheet.getCell(rowNum, i + 1);
      cell.value     = h;
      cell.font      = fnt(10, true, C.headerFg) as ExcelJS.Font;
      cell.fill      = solid(C.headerBg);
      cell.alignment = aln("center", "middle", true);
      cell.border    = {
        top:    { style: "medium", color: { argb: C.headerBg } },
        bottom: { style: "medium", color: { argb: C.headerBg } },
        left:   { style: "thin",   color: { argb: "FF2A5298"  } },
        right:  { style: "thin",   color: { argb: "FF2A5298"  } },
      };
    });
  };

  // ── Section title ────────────────────────────────────────────────────────────
  const buildSectionTitle = (sheet: ExcelJS.Worksheet, rowNum: number, title: string, lastCol: string) => {
    sheet.getRow(rowNum).height = 17;
    sheet.mergeCells(`A${rowNum}:${lastCol}${rowNum}`);
    const cell     = sheet.getCell(`A${rowNum}`);
    cell.value     = title;
    cell.font      = fnt(10, true, C.subFg) as ExcelJS.Font;
    cell.fill      = solid(C.subBg);
    cell.alignment = aln("left", "middle");
    cell.border    = hairBorder();
  };

  // ── Signature footer ─────────────────────────────────────────────────────────
  const buildFooter = (sheet: ExcelJS.Worksheet, startRow: number, lastCol: string) => {
    sheet.getRow(startRow).height = 12; // spacer

    const r1 = startRow + 1, r2 = startRow + 2, r3 = startRow + 3, r4 = startRow + 4;
    [r1, r2, r3, r4].forEach((r) => { sheet.getRow(r).height = 16; });
    sheet.getRow(r2).height = 22;

    sheet.mergeCells(`A${r1}:D${r1}`);
    const p1 = sheet.getCell(`A${r1}`);
    p1.value = "Prepared by:"; p1.font = fnt(9, true, C.textMuted) as ExcelJS.Font;

    sheet.mergeCells(`F${r1}:${lastCol}${r1}`);
    const n1 = sheet.getCell(`F${r1}`);
    n1.value = "Noted by:"; n1.font = fnt(9, true, C.textMuted) as ExcelJS.Font;

    sheet.mergeCells(`A${r3}:D${r3}`);
    const p3 = sheet.getCell(`A${r3}`);
    p3.value = "________________________________";
    p3.font  = fnt(10) as ExcelJS.Font; p3.alignment = aln("center");

    sheet.mergeCells(`F${r3}:${lastCol}${r3}`);
    const n3 = sheet.getCell(`F${r3}`);
    n3.value = "________________________________";
    n3.font  = fnt(10) as ExcelJS.Font; n3.alignment = aln("center");

    sheet.mergeCells(`A${r4}:D${r4}`);
    const p4 = sheet.getCell(`A${r4}`);
    p4.value = "School Records Officer / Registrar";
    p4.font  = fnt(9, false, C.textMuted, true) as ExcelJS.Font; p4.alignment = aln("center");

    sheet.mergeCells(`F${r4}:${lastCol}${r4}`);
    const n4 = sheet.getCell(`F${r4}`);
    n4.value = "School Principal";
    n4.font  = fnt(9, false, C.textMuted, true) as ExcelJS.Font; n4.alignment = aln("center");
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // ADMIN REPORT
  // ══════════════════════════════════════════════════════════════════════════════
  if (type === "admin") {
    const { data: user } = await admin.from("User").select("role").eq("id", auth.user.id).single();
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: compliance } = await admin.from("TeacherTrainingCompliance").select("*");
    const teacherIds = (compliance ?? []).map((c) => c.teacher_id);

    const [{ data: profiles }, { data: profileHRs }] = await (teacherIds.length
      ? Promise.all([
          admin.from("Profile").select("id, firstName, lastName, email").in("id", teacherIds),
          admin.from("ProfileHR").select("id, employeeId, position").in("id", teacherIds),
        ])
      : Promise.all([{ data: [] }, { data: [] }]));

    const profileMap   = new Map((profiles   ?? []).map((p) => [p.id, p]));
    const profileHRMap = new Map((profileHRs ?? []).map((p) => [p.id, p]));

    const sorted = [...(compliance ?? [])].sort((a, b) => {
      const order: Record<string, number> = { NON_COMPLIANT: 0, AT_RISK: 1, COMPLIANT: 2 };
      return (order[a.status] ?? 0) - (order[b.status] ?? 0);
    });

    const sheet = workbook.addWorksheet("Compliance Report");
    sheet.columns = [
      { width: 6  }, // No.
      { width: 14 }, // Employee ID
      { width: 30 }, // Teacher Name
      { width: 24 }, // Position
      { width: 14 }, // Training Hours
      { width: 14 }, // Required Hours
      { width: 15 }, // Remaining Hours
      { width: 18 }, // Status
      { width: 16 }, // Last Updated
    ];

    buildLetterhead(sheet, 9, "I", "TRAINING COMPLIANCE REPORT");
    buildColHeaders(sheet, 9, [
      "No.", "Employee ID", "Teacher Name", "Position",
      "Training Hours", "Required Hours", "Remaining Hours",
      "Compliance Status", "Last Updated",
    ]);

    const DATA_START = 10;
    sorted.forEach((c, idx) => {
      const p        = profileMap.get(c.teacher_id);
      const hr       = profileHRMap.get(c.teacher_id);
      const fullName = p ? `${p.lastName}, ${p.firstName}` : "—";
      const ss       = statusStyle(c.status);
      const bg       = idx % 2 === 0 ? C.white : C.rowAlt;
      const r        = DATA_START + idx;

      sheet.getRow(r).height = 18;

      const values: [ExcelJS.CellValue, ExcelJS.Alignment["horizontal"]][] = [
        [idx + 1,                                             "center"],
        [hr?.employeeId  ?? "—",                             "center"],
        [fullName,                                            "left"  ],
        [hr?.position    ?? "—",                             "left"  ],
        [c.total_hours,                                       "center"],
        [c.required_hours,                                    "center"],
        [c.remaining_hours,                                   "center"],
        [ss.label,                                            "center"],
        [new Date(c.updated_at).toLocaleDateString("en-PH"), "center"],
      ];

      values.forEach(([val, h], ci) => {
        const cell     = sheet.getCell(r, ci + 1);
        cell.value     = val;
        cell.font      = fnt(10, false, C.textDark) as ExcelJS.Font;
        cell.fill      = solid(bg);
        cell.alignment = aln(h, "middle");
        cell.border    = hairBorder();
      });

      // Status cell only gets color
      const sc  = sheet.getCell(r, 8);
      sc.font   = fnt(10, true, ss.fg) as ExcelJS.Font;
      sc.fill   = solid(ss.bg);
    });

    // Totals row
    const TOTAL_ROW = DATA_START + sorted.length;
    sheet.getRow(TOTAL_ROW).height = 20;

    const totalHrs = sorted.reduce((s, c) => s + (c.total_hours ?? 0), 0);
    const nC       = sorted.filter((c) => c.status === "COMPLIANT").length;
    const nA       = sorted.filter((c) => c.status === "AT_RISK").length;
    const nN       = sorted.filter((c) => c.status === "NON_COMPLIANT").length;

    sheet.mergeCells(`A${TOTAL_ROW}:D${TOTAL_ROW}`);
    const setTotalCell = (col: string, val: ExcelJS.CellValue, h: ExcelJS.Alignment["horizontal"] = "center") => {
      const cell     = sheet.getCell(`${col}${TOTAL_ROW}`);
      cell.value     = val;
      cell.font      = fnt(10, true, C.headerFg) as ExcelJS.Font;
      cell.fill      = solid(C.headerBg);
      cell.alignment = aln(h, "middle");
      cell.border    = thickBorder();
    };
    setTotalCell("A", `TOTAL — ${sorted.length} Teacher(s)`);
    setTotalCell("E", totalHrs);
    ["F", "G"].forEach((col) => {
      sheet.getCell(`${col}${TOTAL_ROW}`).fill   = solid(C.headerBg);
      sheet.getCell(`${col}${TOTAL_ROW}`).border = thickBorder();
    });
    sheet.mergeCells(`H${TOTAL_ROW}:I${TOTAL_ROW}`);
    setTotalCell("H", `${nC} Compliant   ${nA} At Risk   ${nN} Non-Compliant`);

    buildFooter(sheet, TOTAL_ROW + 1, "I");

    sheet.pageSetup.orientation    = "landscape";
    sheet.pageSetup.paperSize      = 5;
    sheet.pageSetup.fitToPage      = true;
    sheet.pageSetup.fitToWidth     = 1;
    sheet.pageSetup.fitToHeight    = 0;
    sheet.pageSetup.printTitlesRow = "1:9";
    sheet.views = [{ state: "frozen", ySplit: 9, xSplit: 0, topLeftCell: "A10", activeCell: "A10" }];

  // ══════════════════════════════════════════════════════════════════════════════
  // TEACHER SELF-REPORT
  // ══════════════════════════════════════════════════════════════════════════════
  } else {
    const teacherId = auth.user.id;

    const [
      { data: compliance },
      { data: profile },
      { data: profileHR },
      { data: policy },
    ] = await Promise.all([
      admin.from("TeacherTrainingCompliance").select("*").eq("teacher_id", teacherId).single(),
      admin.from("Profile").select("firstName, lastName, email").eq("id", teacherId).single(),
      admin.from("ProfileHR").select("employeeId, position").eq("id", teacherId).single(),
      admin.from("TrainingCompliancePolicy").select("*").eq("school_year", schoolYear).maybeSingle(),
    ]);

    const { data: attendance } = await admin
      .from("Attendance")
      .select("id, approved_hours, status, result, training_id, ProfessionalDevelopment(title, type, start_date, end_date, total_hours, sponsoring_agency)")
      .eq("teacher_id", teacherId)
      .eq("status", "APPROVED")
      .eq("result", "PASSED");

    const periodStart = policy?.period_start ?? null;
    const periodEnd   = policy?.period_end   ?? null;

    const countedTrainings = (attendance ?? []).filter((t) => {
      const pd = t.ProfessionalDevelopment as any;
      if (!pd?.start_date || !pd?.end_date) return false;
      if (!periodStart || !periodEnd) return true;
      return pd.start_date >= periodStart && pd.end_date <= periodEnd;
    });

    const sheet    = workbook.addWorksheet("My Compliance Report");
    const fullName = profile ? `${profile.lastName}, ${profile.firstName}` : "—";
    const ss       = statusStyle(compliance?.status ?? "NON_COMPLIANT");

    sheet.columns = [
      { width: 22 }, // A — label
      { width: 30 }, // B — value (merged B:F)
      { width: 18 }, // C
      { width: 16 }, // D
      { width: 22 }, // E
      { width: 14 }, // F
    ];

    buildLetterhead(sheet, 6, "F", "TRAINING COMPLIANCE REPORT");

    // ── Teacher info block rows 9–13 ─────────────────────────────────────────
    const infoRows: [string, string][] = [
      ["Teacher Name:", fullName],
      ["Employee ID:",  profileHR?.employeeId ?? "—"],
      ["Position:",     profileHR?.position   ?? "—"],
      ["Email:",        profile?.email        ?? "—"],
      ["Period:",       policy ? `${policy.period_start}  to  ${policy.period_end}` : "—"],
    ];

    infoRows.forEach(([label, value], i) => {
      const r  = 9 + i;
      const bg = i % 2 === 0 ? C.white : C.rowAlt;
      sheet.getRow(r).height = 17;
      for (let col = 1; col <= 6; col++) sheet.getCell(r, col).fill = solid(bg);

      const lc     = sheet.getCell(r, 1);
      lc.value     = label;
      lc.font      = fnt(10, true, C.textMid) as ExcelJS.Font;
      lc.alignment = aln("right", "middle");
      lc.fill      = solid(bg);

      sheet.mergeCells(`B${r}:F${r}`);
      const vc     = sheet.getCell(r, 2);
      vc.value     = value;
      vc.font      = fnt(10, false, C.textDark) as ExcelJS.Font;
      vc.alignment = aln("left", "middle");
      vc.fill      = solid(bg);
    });

    // ── Compliance summary ───────────────────────────────────────────────────
    const SUM_TITLE = 9 + infoRows.length + 1;
    buildSectionTitle(sheet, SUM_TITLE, "COMPLIANCE SUMMARY", "F");

    const summaryItems: [string, string | number, boolean][] = [
      ["Total Hours Completed", compliance?.total_hours     ?? 0, false],
      ["Required Hours",        compliance?.required_hours  ?? 0, false],
      ["Remaining Hours",       compliance?.remaining_hours ?? 0, false],
      ["Compliance Status",     ss.label,                          true ],
    ];

    summaryItems.forEach(([label, value, isStatus], i) => {
      const r  = SUM_TITLE + 1 + i;
      const bg = i % 2 === 0 ? C.white : C.rowAlt;
      sheet.getRow(r).height = 17;

      const lc     = sheet.getCell(r, 1);
      lc.value     = label as string;
      lc.font      = fnt(10, true, C.textMid) as ExcelJS.Font;
      lc.fill      = solid(bg);
      lc.alignment = aln("right", "middle");
      lc.border    = hairBorder();

      sheet.mergeCells(`B${r}:F${r}`);
      const vc     = sheet.getCell(r, 2);
      vc.value     = value;
      vc.font      = fnt(10, isStatus, isStatus ? ss.fg : C.textDark) as ExcelJS.Font;
      vc.fill      = solid(isStatus ? ss.bg : bg);
      vc.alignment = aln("left", "middle");
      vc.border    = hairBorder();
    });

    // ── Trainings table ──────────────────────────────────────────────────────
    const TRAIN_TITLE = SUM_TITLE + summaryItems.length + 2;
    buildSectionTitle(sheet, TRAIN_TITLE, "TRAININGS COUNTED TOWARD COMPLIANCE", "F");
    buildColHeaders(sheet, TRAIN_TITLE + 1, [
      "Title", "Sponsoring Agency", "Type", "Start Date", "End Date", "Hours",
    ]);

    const TRAIN_START = TRAIN_TITLE + 2;
    countedTrainings.forEach((t, idx) => {
      const pd  = t.ProfessionalDevelopment as any;
      const bg  = idx % 2 === 0 ? C.white : C.rowAlt;
      const r   = TRAIN_START + idx;
      sheet.getRow(r).height = 18;

      const rowData: [ExcelJS.CellValue, ExcelJS.Alignment["horizontal"]][] = [
        [pd?.title             ?? "—", "left"  ],
        [pd?.sponsoring_agency ?? "—", "left"  ],
        [pd?.type              ?? "—", "center"],
        [pd?.start_date        ?? "—", "center"],
        [pd?.end_date          ?? "—", "center"],
        [t.approved_hours ?? pd?.total_hours ?? 0, "center"],
      ];

      rowData.forEach(([val, h], ci) => {
        const cell     = sheet.getCell(r, ci + 1);
        cell.value     = val;
        cell.font      = fnt(10, false, C.textDark) as ExcelJS.Font;
        cell.fill      = solid(bg);
        cell.alignment = aln(h, "middle");
        cell.border    = hairBorder();
      });
    });

    // Total row
    const totalHrs  = countedTrainings.reduce(
      (s, t) => s + (t.approved_hours ?? (t.ProfessionalDevelopment as any)?.total_hours ?? 0), 0
    );
    const TOTAL_ROW = TRAIN_START + countedTrainings.length;
    sheet.getRow(TOTAL_ROW).height = 18;
    sheet.mergeCells(`A${TOTAL_ROW}:E${TOTAL_ROW}`);

    const tc     = sheet.getCell(`A${TOTAL_ROW}`);
    tc.value     = "TOTAL TRAINING HOURS";
    tc.font      = fnt(10, true, C.headerFg) as ExcelJS.Font;
    tc.fill      = solid(C.headerBg);
    tc.alignment = aln("center", "middle");
    tc.border    = thickBorder();

    const hc     = sheet.getCell(`F${TOTAL_ROW}`);
    hc.value     = totalHrs;
    hc.font      = fnt(10, true, C.headerFg) as ExcelJS.Font;
    hc.fill      = solid(C.headerBg);
    hc.alignment = aln("center", "middle");
    hc.border    = thickBorder();

    buildFooter(sheet, TOTAL_ROW + 1, "F");

    sheet.pageSetup.orientation    = "portrait";
    sheet.pageSetup.paperSize      = 5;
    sheet.pageSetup.fitToPage      = true;
    sheet.pageSetup.fitToWidth     = 1;
    sheet.pageSetup.fitToHeight    = 0;
    sheet.pageSetup.printTitlesRow = "1:8";
  }

  const buffer   = await workbook.xlsx.writeBuffer();
  const fileName = type === "admin"
    ? `compliance-report-${schoolYear.replace(/\s/g, "-")}.xlsx`
    : `my-compliance-${schoolYear.replace(/\s/g, "-")}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}