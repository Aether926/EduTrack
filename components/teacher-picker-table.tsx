/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";

import type { TeacherTableRow } from "@/lib/user";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";

import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUpDown,
    Search,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import UserAvatar from "@/components/ui-elements/user-avatar";
import { PositionBadge } from "@/components/ui-elements/badges";
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

import { fmtContact } from "@/components/formatter/contact-format";
import { fmtEmployeeId } from "@/components/formatter/employee-id-format";

const fmtPhone = fmtContact;

/** Collapses accidental double-dots (e.g. "C.. IBARRA" → "C. IBARRA"). */
function fixDoubleDots(name: string): string {
    return name.replace(/\.{2,}/g, ".");
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TeacherPickerTableProps {
    data: TeacherTableRow[];
    onAssign: (rows: TeacherTableRow[]) => Promise<void>;
}

export default function TeacherPickerTable({
    data,
    onAssign,
}: TeacherPickerTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
    const [positionFilter, setPositionFilter] = useState<string | null>(null);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
        {},
    );
    const [assigning, setAssigning] = useState(false);

    const subjectOptions = useMemo(() => {
        const set = new Set<string>();
        for (const row of data) {
            const val = (row as any).subjectSpecialization;
            if (val) set.add(val);
        }
        return Array.from(set).sort();
    }, [data]);

    const positionOptions = useMemo(() => {
        const set = new Set<string>();
        for (const row of data) {
            if (row.position) set.add(row.position);
        }
        return Array.from(set).sort();
    }, [data]);

    const columns = useMemo<ColumnDef<TeacherTableRow>[]>(
        () => [
            // Checkbox select
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected()
                                ? true
                                : table.getIsSomePageRowsSelected()
                                  ? "indeterminate"
                                  : false
                        }
                        onCheckedChange={(v) =>
                            table.toggleAllPageRowsSelected(!!v)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(v) => row.toggleSelected(!!v)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },

            // Employee ID
            {
                accessorKey: "employeeid",
                header: ({ column }) => (
                    <button
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold hover:text-foreground transition-colors"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Employee ID <ArrowUpDown className="h-3 w-3" />
                    </button>
                ),
                cell: ({ row }) => (
                    <div className="font-mono text-xs text-muted-foreground">
                        {fmtEmployeeId(
                            String(row.getValue("employeeid") ?? ""),
                        )}
                    </div>
                ),
            },

            // Full Name + avatar
            {
                accessorKey: "fullname",
                header: ({ column }) => (
                    <button
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold hover:text-foreground transition-colors"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Full Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                ),
                cell: ({ row }) => {
                    const fullname = row.getValue("fullname") as string;
                    const displayName = fixDoubleDots(fullname);
                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                                name={fullname}
                                src={row.original.profileImage}
                                className="h-8 w-8 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-foreground">
                                    {displayName}
                                </div>
                                {row.original.position && (
                                    <div className="md:hidden mt-0.5">
                                        <PositionBadge
                                            position={row.original.position}
                                            size="xs"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            },

            // Position
            {
                accessorKey: "position",
                header: () => (
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                        Position
                    </span>
                ),
                cell: ({ row }) => (
                    <PositionBadge
                        position={row.getValue("position") as string}
                    />
                ),
            },

            // Contact
            {
                accessorKey: "contact",
                header: () => (
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                        Contact Number
                    </span>
                ),
                cell: ({ row }) => (
                    <div className="font-mono text-xs text-muted-foreground">
                        {fmtPhone(String(row.getValue("contact") ?? "")) ?? "—"}
                    </div>
                ),
            },
        ],
        [],
    );

    const filteredData = useMemo(() => {
        return data.filter((row) => {
            if (
                subjectFilter &&
                (row as any).subjectSpecialization !== subjectFilter
            )
                return false;
            if (positionFilter && row.position !== positionFilter) return false;
            return true;
        });
    }, [data, subjectFilter, positionFilter]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, globalFilter, rowSelection },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        globalFilterFn: (row, _columnId, filterValue) => {
            const v = String(filterValue ?? "")
                .toLowerCase()
                .trim();
            if (!v) return true;
            const full = String(row.original.fullname ?? "").toLowerCase();
            const emp = String(row.original.employeeid ?? "").toLowerCase();
            const pos = String(row.original.position ?? "").toLowerCase();
            const contact = String(row.original.contact ?? "").toLowerCase();
            return (
                full.includes(v) ||
                emp.includes(v) ||
                pos.includes(v) ||
                contact.includes(v)
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
    }, [globalFilter, subjectFilter, positionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    const selectedRows = table
        .getSelectedRowModel()
        .rows.map((r) => r.original);
    const selectedCount = selectedRows.length;

    const handleAssign = async () => {
        if (selectedCount === 0) return;
        setAssigning(true);
        try {
            await onAssign(selectedRows);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="border border-border/60 shadow-lg w-full overflow-hidden rounded-xl bg-card">
            {/* ── Header band ── */}
            <div className="relative px-6 py-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-violet-400/4 pointer-events-none" />
                <div className="relative flex flex-col gap-3">
                    {/* Title row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 shrink-0">
                                <Users className="h-5 w-5 text-violet-400" />
                            </div>
                            <div>
                                <span className="text-base font-semibold tracking-tight text-foreground">
                                    Select Teachers
                                </span>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    {filteredCount} result
                                    {filteredCount === 1 ? "" : "s"} • 10 per
                                    page
                                    {selectedCount > 0 && (
                                        <span className="ml-2 text-violet-400 font-medium">
                                            · {selectedCount} selected
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Right: search + assign */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Desktop search */}
                            <div className="hidden md:block">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                    <Input
                                        value={globalFilter ?? ""}
                                        onChange={(e) =>
                                            setGlobalFilter(e.target.value)
                                        }
                                        placeholder="Search name, id, position, contact..."
                                        className="pl-8 h-9 w-[280px] text-sm bg-white/5 border-white/10 focus:border-violet-500/40"
                                    />
                                </div>
                            </div>

                            {/* Mobile search toggle */}
                            <div className="flex md:hidden items-center gap-2">
                                <button
                                    onClick={() => setSearchOpen((v) => !v)}
                                    className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                                >
                                    {searchOpen ? (
                                        <X className="h-4 w-4" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </button>
                                <AnimatePresence initial={false}>
                                    {searchOpen && (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{
                                                width: "min(200px, 50vw)",
                                                opacity: 1,
                                            }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="overflow-hidden"
                                        >
                                            <Input
                                                value={globalFilter ?? ""}
                                                onChange={(e) =>
                                                    setGlobalFilter(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Search..."
                                                className="h-9 text-sm bg-white/5 border-white/10"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Assign button */}
                            <Button
                                onClick={handleAssign}
                                disabled={selectedCount === 0 || assigning}
                                size="sm"
                                className="gap-2 bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40"
                            >
                                {assigning ? (
                                    <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <UserCheck className="h-3.5 w-3.5" />
                                )}
                                Assign selected
                                {selectedCount > 0 && (
                                    <span className="ml-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                                        {selectedCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Filter dropdowns */}
                    <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground min-w-[140px] justify-between">
                                    <span className="truncate">
                                        {subjectFilter ?? "All Subjects"}
                                    </span>
                                    <ChevronDown className="h-3 w-3 shrink-0" />
                                </button>
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground min-w-[140px] justify-between">
                                    <span className="truncate">
                                        {positionFilter ?? "All Positions"}
                                    </span>
                                    <ChevronDown className="h-3 w-3 shrink-0" />
                                </button>
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

                        {(subjectFilter || positionFilter) && (
                            <button
                                onClick={() => {
                                    setSubjectFilter(null);
                                    setPositionFilter(null);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                            >
                                <X className="h-3 w-3" /> Clear filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="px-6 py-5">
                <div className="rounded-md border border-white/8 overflow-hidden overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((hg) => (
                                <TableRow
                                    key={hg.id}
                                    className="border-white/8 hover:bg-transparent"
                                >
                                    {hg.headers.map((header) => {
                                        const colId = header.column.id;
                                        const hideOnSmall =
                                            colId === "position" ||
                                            colId === "contact"
                                                ? "hidden md:table-cell"
                                                : "";
                                        const selectCol =
                                            colId === "select" ? "w-10" : "";
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={`${hideOnSmall} ${selectCol}`}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
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
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.14,
                                            delay: Math.min(idx * 0.01, 0.12),
                                        }}
                                        data-state={
                                            row.getIsSelected()
                                                ? "selected"
                                                : undefined
                                        }
                                        className="border-b border-white/8 last:border-b-0 cursor-pointer hover:bg-white/3 data-[state=selected]:bg-violet-500/8 transition-colors"
                                        onClick={() => row.toggleSelected()}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const colId = cell.column.id;
                                            const hideOnSmall =
                                                colId === "position" ||
                                                colId === "contact"
                                                    ? "hidden md:table-cell"
                                                    : "";
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={`py-3 ${hideOnSmall}`}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
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
                                        className="h-24 text-center text-sm text-muted-foreground"
                                    >
                                        No teachers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* ── Pagination ── */}
                {pageCount > 1 && (
                    <div className="flex flex-col items-center gap-2 mt-3 px-1">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] text-muted-foreground">
                                Page {pageIndex + 1} of {pageCount}
                            </span>
                        </div>
                        <div className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto w-full pb-1">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {(() => {
                                const page = pageIndex + 1;
                                const delta = 1;
                                const range: (number | "…")[] = [];
                                const left = Math.max(2, page - delta);
                                const right = Math.min(
                                    pageCount - 1,
                                    page + delta,
                                );

                                range.push(1);
                                if (left > 2) range.push("…");
                                for (let i = left; i <= right; i++)
                                    range.push(i);
                                if (right < pageCount - 1) range.push("…");
                                if (pageCount > 1) range.push(pageCount);

                                return range.map((p, idx) =>
                                    p === "…" ? (
                                        <span
                                            key={`ellipsis-${idx}`}
                                            className="inline-flex h-6 w-6 items-center justify-center text-[11px] text-muted-foreground"
                                        >
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() =>
                                                table.setPageIndex(
                                                    (p as number) - 1,
                                                )
                                            }
                                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-medium transition ${
                                                p === page
                                                    ? "border-violet-500/40 bg-violet-500/20 text-violet-400"
                                                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                );
                            })()}
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
