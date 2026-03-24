"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUpDown,
    Plus,
    Search,
    X,
    ChevronDown,
    Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import UserAvatar from "@/components/ui-elements/avatars/user-avatar";
import {
    AppointmentTypeBadge,
    PositionBadge,
} from "@/components/ui-elements/badges";

import { AddAppointmentSheet } from "@/features/admin-actions/appointment-history/components/add-appointment-modal";
import { AppointmentDetailSheet } from "@/features/admin-actions/appointment-history/components/appointment-details-sheet";
import type { AppointmentHistoryRow } from "@/features/admin-actions/appointment-history/types/appointment-history";

const APPOINTMENT_TYPES = [
    "Original",
    "Promotion",
    "Reappointment",
    "Transfer",
    "Reinstatement",
];

function fmt(d?: string | null) {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleDateString();
    } catch {
        return String(d);
    }
}

function fmtExport(d?: string | null) {
    if (!d) return "";
    try {
        return new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return String(d);
    }
}

async function exportToXLSX(rows: any[]) {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Appointment History");

    // ── Palette ──────────────────────────────────────────────────────────────
    const C = {
        white:       "FFFFFFFF",
        offWhite:    "FFF9F9F9",
        rowAlt:      "FFFFFFFF",
        headerBg:    "FF1A3C6E",
        headerFg:    "FFFFFFFF",
        subBg:       "FFE8EDF5",
        subFg:       "FF1A3C6E",
        borderMed:   "FFAAAAAA",
        borderLight: "FFBBBBBB",
        textDark:    "FF1A1A1A",
        textMid:     "FF444444",
        textMuted:   "FF888888",
    };

    const solid = (argb: string) =>
        ({ type: "pattern" as const, pattern: "solid" as const, fgColor: { argb } });

    const fnt = (size = 10, bold = false, argb = C.textDark, italic = false) =>
        ({ name: "Arial", size, bold, italic, color: { argb } });

    const aln = (h: string = "left", v: string = "middle", wrap = false) =>
        ({ horizontal: h, vertical: v, wrapText: wrap });

    const hairBorder = () => {
        const s = { style: "thin" as const, color: { argb: C.borderLight } };
        return { top: s, bottom: s, left: s, right: s };
    };

    const colCount = 9;
    const lastCol  = "I";

    ws.columns = [
        { width: 6  }, // A — No.
        { width: 28 }, // B — Teacher Name
        { width: 14 }, // C — Employee ID
        { width: 16 }, // D — Type
        { width: 24 }, // E — Position
        { width: 20 }, // F — Start Date
        { width: 20 }, // G — End Date
        { width: 16 }, // H — Memo No.
        { width: 36 }, // I — Remarks
    ];

    // ── Letterhead ────────────────────────────────────────────────────────────
    const merge = (r: number) => ws.mergeCells(`A${r}:${lastCol}${r}`);
    const lc    = (r: number) => ws.getCell(`A${r}`);

    ws.getRow(1).height = 13;
    merge(1);
    lc(1).value     = "Republic of the Philippines";
    lc(1).font      = fnt(9, false, C.textMuted, true) as any;
    lc(1).alignment = aln("center") as any;

    ws.getRow(2).height = 20;
    merge(2);
    lc(2).value     = "Department of Education";
    lc(2).font      = fnt(14, true, C.textDark) as any;
    lc(2).alignment = aln("center") as any;

    ws.getRow(3).height = 15;
    merge(3);
    lc(3).value     = "Valencia National High School";
    lc(3).font      = fnt(11, true, C.textDark) as any;
    lc(3).alignment = aln("center") as any;

    // thin rule — white (invisible divider, keeps row spacing)
    ws.getRow(4).height = 3;
    for (let col = 1; col <= colCount; col++) ws.getCell(4, col).fill = solid(C.white);

    // title bar — plain white, dark text
    ws.getRow(5).height = 22;
    merge(5);
    lc(5).value     = "APPOINTMENT HISTORY REPORT";
    lc(5).font      = fnt(12, true, C.textDark) as any;
    lc(5).fill      = solid(C.white);
    lc(5).alignment = aln("center") as any;

    // thin rule — white
    ws.getRow(6).height = 3;
    for (let col = 1; col <= colCount; col++) ws.getCell(6, col).fill = solid(C.white);

    // meta row
    ws.getRow(7).height = 15;
    merge(7);
    const dateStr = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    lc(7).value     = `Date Generated: ${dateStr}`;
    lc(7).font      = fnt(9, false, C.textMuted) as any;
    lc(7).fill      = solid(C.offWhite);
    lc(7).alignment = aln("center") as any;

    // spacer
    ws.getRow(8).height = 5;

    // outer border around letterhead
    for (let col = 1; col <= colCount; col++) {
        ws.getCell(1, col).border = { top: { style: "thin", color: { argb: C.borderMed } } };
        ws.getCell(7, col).border = { bottom: { style: "thin", color: { argb: C.borderMed } } };
    }
    for (let row = 1; row <= 7; row++) {
        const left  = ws.getCell(row, 1);
        const right = ws.getCell(row, colCount);
        left.border  = { ...left.border,  left:  { style: "thin", color: { argb: C.borderMed } } };
        right.border = { ...right.border, right: { style: "thin", color: { argb: C.borderMed } } };
    }

    // ── Column headers (row 9) ────────────────────────────────────────────────
    ws.getRow(9).height = 26;
    const headers = ["No.", "Teacher Name", "Employee ID", "Type", "Position", "Start Date", "End Date", "Memo No.", "Remarks"];
    headers.forEach((h, i) => {
        const cell     = ws.getCell(9, i + 1);
        cell.value     = h;
        cell.font      = fnt(10, true, C.textDark) as any;
        cell.fill      = solid(C.subBg);
        cell.alignment = aln("center", "middle", true) as any;
        cell.border    = {
            top:    { style: "medium", color: { argb: C.borderMed } },
            bottom: { style: "medium", color: { argb: C.borderMed } },
            left:   { style: "thin",   color: { argb: C.borderLight } },
            right:  { style: "thin",   color: { argb: C.borderLight } },
        };
    });

    // ── Data rows ─────────────────────────────────────────────────────────────
    const DATA_START = 10;
    rows.forEach((r, idx) => {
        const rowNum = DATA_START + idx;
        const bg     = idx % 2 === 0 ? C.white : C.rowAlt;
        ws.getRow(rowNum).height = 18;

        const values: [any, string][] = [
            [idx + 1,                     "center"],
            [r.teacherName ?? "—",        "left"  ],
            [r.teacher?.employeeId ?? "—","center"],
            [r.appointment_type ?? "—",   "center"],
            [r.position ?? "—",           "left"  ],
            [fmtExport(r.start_date),     "center"],
            [fmtExport(r.end_date),       "center"],
            [r.memo_no ?? "—",            "center"],
            [r.remarks ?? "—",            "left"  ],
        ];

        values.forEach(([val, h], ci) => {
            const cell     = ws.getCell(rowNum, ci + 1);
            cell.value     = val;
            cell.font      = fnt(10, false, C.textDark) as any;
            cell.fill      = solid(bg);
            cell.alignment = aln(h, "middle") as any;
            cell.border    = hairBorder();
        });
    });

    // ── Total row ─────────────────────────────────────────────────────────────
    const TOTAL_ROW = DATA_START + rows.length;
    ws.getRow(TOTAL_ROW).height = 20;
    ws.mergeCells(`A${TOTAL_ROW}:${lastCol}${TOTAL_ROW}`);
    const tc     = ws.getCell(`A${TOTAL_ROW}`);
    tc.value     = `TOTAL — ${rows.length} Record(s)`;
    tc.font      = fnt(10, true, C.textDark) as any;
    tc.fill      = solid(C.white);
    tc.alignment = aln("center", "middle") as any;
    const thickS = { style: "medium" as const, color: { argb: C.borderMed } };
    tc.border    = { top: thickS, bottom: thickS, left: thickS, right: thickS };

    // ── Signature footer ──────────────────────────────────────────────────────
    const fs = TOTAL_ROW + 2;
    ws.getRow(fs).height = 16;
    ws.mergeCells(`A${fs}:D${fs}`);
    ws.getCell(`A${fs}`).value = "Prepared by:";
    ws.getCell(`A${fs}`).font  = fnt(9, true, C.textMuted) as any;
    ws.mergeCells(`F${fs}:${lastCol}${fs}`);
    ws.getCell(`F${fs}`).value = "Noted by:";
    ws.getCell(`F${fs}`).font  = fnt(9, true, C.textMuted) as any;

    ws.getRow(fs + 1).height = 22;
    ws.getRow(fs + 2).height = 16;
    ws.mergeCells(`A${fs + 2}:D${fs + 2}`);
    ws.getCell(`A${fs + 2}`).value     = "________________________________";
    ws.getCell(`A${fs + 2}`).font      = fnt(10) as any;
    ws.getCell(`A${fs + 2}`).alignment = aln("center") as any;
    ws.mergeCells(`F${fs + 2}:${lastCol}${fs + 2}`);
    ws.getCell(`F${fs + 2}`).value     = "________________________________";
    ws.getCell(`F${fs + 2}`).font      = fnt(10) as any;
    ws.getCell(`F${fs + 2}`).alignment = aln("center") as any;

    ws.getRow(fs + 3).height = 14;
    ws.mergeCells(`A${fs + 3}:D${fs + 3}`);
    ws.getCell(`A${fs + 3}`).value     = "School Records Officer / Registrar";
    ws.getCell(`A${fs + 3}`).font      = fnt(9, false, C.textMuted, true) as any;
    ws.getCell(`A${fs + 3}`).alignment = aln("center") as any;
    ws.mergeCells(`F${fs + 3}:${lastCol}${fs + 3}`);
    ws.getCell(`F${fs + 3}`).value     = "School Principal";
    ws.getCell(`F${fs + 3}`).font      = fnt(9, false, C.textMuted, true) as any;
    ws.getCell(`F${fs + 3}`).alignment = aln("center") as any;

    // ── Page setup ────────────────────────────────────────────────────────────
    ws.pageSetup.orientation    = "landscape";
    ws.pageSetup.paperSize      = 5;
    ws.pageSetup.fitToPage      = true;
    ws.pageSetup.fitToWidth     = 1;
    ws.pageSetup.fitToHeight    = 0;
    ws.pageSetup.printTitlesRow = "1:9";
    ws.views = [{ state: "frozen", ySplit: 9, xSplit: 0, topLeftCell: "A10", activeCell: "A10" }];

    // ── Download ──────────────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href       = url;
    a.download   = `appointment-history-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
}

export function AppointmentHistoryClient(props: {
    rows: AppointmentHistoryRow[];
    teachers: { id: string; fullName: string }[];
}) {
    const { rows } = props;
    const router = useRouter();

    const [sheetOpen, setSheetOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedRow, setSelectedRow] =
        useState<AppointmentHistoryRow | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [positionFilter, setPositionFilter] = useState<string | null>(null);
    const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
    const [yearFilter, setYearFilter] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    // Derive filter options
    const positionOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of rows) {
            if (r.position) set.add(r.position);
        }
        return Array.from(set).sort();
    }, [rows]);

    const subjectOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of rows) {
            const sub = (r.teacher as any)?.subjectSpecialization;
            if (sub) set.add(sub);
        }
        return Array.from(set).sort();
    }, [rows]);

    const yearOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of rows) {
            if (r.start_date) {
                const y = new Date(r.start_date).getFullYear();
                if (!isNaN(y)) set.add(String(y));
            }
        }
        return Array.from(set).sort((a, b) => Number(b) - Number(a));
    }, [rows]);

    const hasFilters =
        typeFilter ||
        positionFilter ||
        subjectFilter ||
        yearFilter ||
        globalFilter;

    const filteredData = useMemo(() => {
        return (rows ?? [])
            .filter((r) => {
                if (typeFilter && r.appointment_type !== typeFilter)
                    return false;
                if (positionFilter && r.position !== positionFilter)
                    return false;
                if (
                    subjectFilter &&
                    (r.teacher as any)?.subjectSpecialization !== subjectFilter
                )
                    return false;
                if (yearFilter && r.start_date) {
                    const y = new Date(r.start_date).getFullYear();
                    if (String(y) !== yearFilter) return false;
                }
                return true;
            })
            .map((r) => ({
                ...r,
                teacherName: r.teacher
                    ? `${r.teacher.firstName} ${r.teacher.lastName}`
                    : "Unknown",
                teacherProfileImage: (r.teacher as any)?.profileImage ?? null,
            }));
    }, [rows, typeFilter, positionFilter, subjectFilter, yearFilter]);

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "teacherName",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-2"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Teacher <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const t = row.original.teacher;
                    const name = row.original.teacherName;
                    const type = row.original.appointment_type;
                    const position = row.original.position;
                    const start = row.original.start_date;
                    const end = row.original.end_date;
                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                                name={name}
                                src={row.original.teacherProfileImage}
                                className="h-8 w-8 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium">
                                    {name}
                                </div>
                                <div className="truncate text-xs text-muted-foreground hidden md:block">
                                    {t?.email ?? "—"}
                                </div>
                                <div className="md:hidden mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <AppointmentTypeBadge
                                        type={type}
                                        size="xs"
                                    />
                                    <span className="truncate">
                                        {position || "—"}
                                    </span>
                                    <span className="font-mono">
                                        {fmt(start)}
                                        {end ? ` → ${fmt(end)}` : ""}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "appointment_type",
                header: "Type",
                cell: ({ row }) => (
                    <AppointmentTypeBadge
                        type={row.original.appointment_type}
                    />
                ),
            },
            {
                accessorKey: "position",
                header: "Position",
                cell: ({ row }) => (
                    <PositionBadge
                        position={row.original.position || ""}
                        size="xs"
                    />
                ),
            },
            {
                accessorKey: "start_date",
                header: "Start",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground font-mono">
                        {fmt(row.original.start_date)}
                    </span>
                ),
            },
            {
                accessorKey: "end_date",
                header: "End",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground font-mono">
                        {fmt(row.original.end_date)}
                    </span>
                ),
            },
            {
                accessorKey: "memo_no",
                header: "Memo No.",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.memo_no ?? "—"}
                    </span>
                ),
            },
            {
                accessorKey: "remarks",
                header: "Remarks",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground line-clamp-1">
                        {row.original.remarks ?? "—"}
                    </span>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue) => {
            const q = String(filterValue ?? "")
                .toLowerCase()
                .trim();
            if (!q) return true;
            return (
                String(row.original.teacherName ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.teacher?.email ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.appointment_type ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.position ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.memo_no ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.remarks ?? "")
                    .toLowerCase()
                    .includes(q)
            );
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    useEffect(() => {
        table.setPageIndex(0);
    }, [globalFilter, typeFilter, positionFilter, subjectFilter, yearFilter]); // eslint-disable-line

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    const clearFilters = () => {
        setTypeFilter(null);
        setPositionFilter(null);
        setSubjectFilter(null);
        setYearFilter(null);
        setGlobalFilter("");
    };

    return (
        <div className="space-y-4">
            <Card className="min-w-0 overflow-hidden">
                <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div>
                        <CardTitle className="text-base">Records</CardTitle>
                        <CardDescription>
                            {filteredCount} result
                            {filteredCount === 1 ? "" : "s"} • 10 per page
                        </CardDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <div className="hidden md:block w-[280px]">
                            <Input
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search teacher, type, memo..."
                            />
                        </div>

                        {/* Export CSV */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 shrink-0"
                            onClick={() => exportToXLSX(filteredData)}
                            disabled={filteredData.length === 0}
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Export Excel
                            </span>
                        </Button>

                        <Button
                            className="gap-2 shrink-0"
                            onClick={() => setSheetOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> Add Entry
                        </Button>

                        <div className="flex md:hidden items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSearchOpen((v) => !v)}
                                aria-label="Search"
                            >
                                {searchOpen ? (
                                    <X className="h-4 w-4" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                            <AnimatePresence initial={false}>
                                {searchOpen && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: "200px", opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="overflow-hidden"
                                    >
                                        <Input
                                            value={globalFilter ?? ""}
                                            onChange={(e) =>
                                                setGlobalFilter(e.target.value)
                                            }
                                            placeholder="Search..."
                                            className="h-9"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Type */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 min-w-[130px] justify-between"
                                >
                                    <span className="truncate">
                                        {typeFilter ?? "All Types"}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onClick={() => setTypeFilter(null)}
                                >
                                    All Types
                                </DropdownMenuItem>
                                {APPOINTMENT_TYPES.map((t) => (
                                    <DropdownMenuItem
                                        key={t}
                                        onClick={() => setTypeFilter(t)}
                                    >
                                        {t}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Position */}
                        {positionOptions.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 min-w-[140px] justify-between"
                                    >
                                        <span className="truncate">
                                            {positionFilter ?? "All Positions"}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="max-h-60 overflow-y-auto"
                                >
                                    <DropdownMenuItem
                                        onClick={() => setPositionFilter(null)}
                                    >
                                        All Positions
                                    </DropdownMenuItem>
                                    {positionOptions.map((p) => (
                                        <DropdownMenuItem
                                            key={p}
                                            onClick={() => setPositionFilter(p)}
                                        >
                                            {p}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Subject */}
                        {subjectOptions.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 min-w-[140px] justify-between"
                                    >
                                        <span className="truncate">
                                            {subjectFilter ?? "All Subjects"}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="max-h-60 overflow-y-auto"
                                >
                                    <DropdownMenuItem
                                        onClick={() => setSubjectFilter(null)}
                                    >
                                        All Subjects
                                    </DropdownMenuItem>
                                    {subjectOptions.map((s) => (
                                        <DropdownMenuItem
                                            key={s}
                                            onClick={() => setSubjectFilter(s)}
                                        >
                                            {s}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Year */}
                        {yearOptions.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 min-w-[110px] justify-between"
                                    >
                                        <span className="truncate">
                                            {yearFilter ?? "All Years"}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="max-h-60 overflow-y-auto"
                                >
                                    <DropdownMenuItem
                                        onClick={() => setYearFilter(null)}
                                    >
                                        All Years
                                    </DropdownMenuItem>
                                    {yearOptions.map((y) => (
                                        <DropdownMenuItem
                                            key={y}
                                            onClick={() => setYearFilter(y)}
                                        >
                                            {y}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground gap-1"
                            >
                                <X className="h-3.5 w-3.5" /> Clear filters
                            </Button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border border-border/60 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((hg) => (
                                    <TableRow
                                        key={hg.id}
                                        className="hover:bg-transparent border-border/60"
                                    >
                                        {hg.headers.map((header) => {
                                            const id = header.column.id;
                                            const hide = [
                                                "appointment_type",
                                                "position",
                                                "start_date",
                                                "end_date",
                                                "memo_no",
                                                "remarks",
                                            ].includes(id)
                                                ? "hidden md:table-cell"
                                                : "";
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={`${hide} bg-muted/30`}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column
                                                                  .columnDef
                                                                  .header,
                                                              header.getContext(),
                                                          )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length ? (
                                    table.getRowModel().rows.map((row, idx) => (
                                        <motion.tr
                                            key={row.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.16,
                                                delay: Math.min(
                                                    idx * 0.01,
                                                    0.15,
                                                ),
                                            }}
                                            className="border-b border-border/40 last:border-b-0 hover:bg-accent/40 transition-colors cursor-pointer"
                                            suppressHydrationWarning
                                            onClick={() => {
                                                const orig =
                                                    rows.find(
                                                        (r) =>
                                                            r.id ===
                                                            row.original.id,
                                                    ) ?? null;
                                                setSelectedRow(orig);
                                                setDetailOpen(true);
                                            }}
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => {
                                                    const id = cell.column.id;
                                                    const hide = [
                                                        "appointment_type",
                                                        "position",
                                                        "start_date",
                                                        "end_date",
                                                        "memo_no",
                                                        "remarks",
                                                    ].includes(id)
                                                        ? "hidden md:table-cell"
                                                        : "";
                                                    return (
                                                        <TableCell
                                                            key={cell.id}
                                                            className={`${hide} py-3`}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="text-xs text-muted-foreground">
                            Page {pageIndex + 1} of {pageCount || 1}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AddAppointmentSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onSuccess={() => router.refresh()}
            />

            <AppointmentDetailSheet
                open={detailOpen}
                onOpenChange={setDetailOpen}
                row={selectedRow}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
