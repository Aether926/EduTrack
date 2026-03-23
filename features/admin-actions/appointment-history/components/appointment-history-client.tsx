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

    // Header row
    ws.columns = [
        { header: "Teacher", key: "teacher", width: 28 },
        { header: "Employee ID", key: "empid", width: 16 },
        { header: "Type", key: "type", width: 16 },
        { header: "Position", key: "position", width: 24 },
        { header: "Start Date", key: "start", width: 20 },
        { header: "End Date", key: "end", width: 20 },
        { header: "Memo No.", key: "memo", width: 16 },
        { header: "Remarks", key: "remarks", width: 36 },
        { header: "School", key: "school", width: 30 },
    ];

    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1E3A5F" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = {
            bottom: { style: "thin", color: { argb: "FF94A3B8" } },
        };
    });
    headerRow.height = 22;

    // Add data rows
    rows.forEach((r, i) => {
        const row = ws.addRow({
            teacher: r.teacherName ?? "",
            empid: r.teacher?.employeeId ?? "—",
            type: r.appointment_type ?? "",
            position: r.position ?? "",
            start: fmtExport(r.start_date),
            end: fmtExport(r.end_date),
            memo: r.memo_no ?? "",
            remarks: r.remarks ?? "",
            school: r.school_name ?? "",
        });
        // Alternate row background
        if (i % 2 === 1) {
            row.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFF1F5F9" },
                };
            });
        }
        row.height = 18;
    });

    // Download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointment-history-${new Date().toISOString().slice(0, 10)}.xlsx`;
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
