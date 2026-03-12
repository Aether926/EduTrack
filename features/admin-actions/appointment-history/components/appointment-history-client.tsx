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
import { ArrowUpDown, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Combobox } from "@/components/combobox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { AddAppointmentModal } from "@/features/admin-actions/appointment-history/components/add-appointment-modal";
import type { AppointmentHistoryRow } from "@/features/admin-actions/appointment-history/types/appointment-history";

const TYPE_STYLE: Record<string, string> = {
    Original: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    Promotion: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    Reappointment: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    Transfer: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    Reinstatement: "bg-pink-500/10 text-pink-700 border-pink-500/20",
};

function fmt(d?: string | null) {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleDateString();
    } catch {
        return String(d);
    }
}

export function AppointmentHistoryClient(props: {
    rows: AppointmentHistoryRow[];
    teachers: { id: string; fullName: string }[];
}) {
    const { rows, teachers } = props;
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);

    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedType, setSelectedType] = useState("");

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    const teacherOptions = useMemo(
        () => teachers.map((t) => ({ value: t.id, label: t.fullName })),
        [teachers],
    );

    const typeOptions = useMemo(
        () => [
            { value: "Original", label: "Original" },
            { value: "Promotion", label: "Promotion" },
            { value: "Reappointment", label: "Reappointment" },
            { value: "Transfer", label: "Transfer" },
            { value: "Reinstatement", label: "Reinstatement" },
        ],
        [],
    );

    const filteredByDropdowns = useMemo(() => {
        return (rows ?? [])
            .filter((r) => {
                const matchTeacher = selectedTeacher
                    ? r.teacher_id === selectedTeacher
                    : true;
                const matchType = selectedType
                    ? r.appointment_type === selectedType
                    : true;
                return matchTeacher && matchType;
            })
            .map((r) => ({
                ...r,
                teacherName: r.teacher
                    ? `${r.teacher.firstName} ${r.teacher.lastName}`
                    : "Unknown",
            }));
    }, [rows, selectedTeacher, selectedType]);

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
                    const type = row.original.appointment_type;
                    const position = row.original.position;
                    const start = row.original.start_date;
                    const end = row.original.end_date;

                    return t ? (
                        <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{`${t.firstName} ${t.lastName}`}</div>
                            <div className="truncate text-xs text-muted-foreground">
                                {t.email ?? "—"}
                            </div>

                            {/* mobile meta */}
                            <div className="md:hidden mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge
                                    variant="outline"
                                    className={
                                        TYPE_STYLE[type] ??
                                        "bg-muted text-muted-foreground border-border"
                                    }
                                >
                                    {type}
                                </Badge>
                                <span className="truncate">
                                    {position || "—"}
                                </span>
                                <span className="font-mono">
                                    {fmt(start)}
                                    {end ? ` → ${fmt(end)}` : ""}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm">
                            Unknown
                        </span>
                    );
                },
            },
            {
                accessorKey: "appointment_type",
                header: "Type",
                cell: ({ row }) => (
                    <Badge
                        variant="outline"
                        className={
                            TYPE_STYLE[row.original.appointment_type] ??
                            "bg-muted text-muted-foreground border-border"
                        }
                    >
                        {row.original.appointment_type}
                    </Badge>
                ),
            },
            {
                accessorKey: "position",
                header: "Position",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.position || "—"}
                    </span>
                ),
            },
            {
                accessorKey: "start_date",
                header: "Start",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {fmt(row.original.start_date)}
                    </span>
                ),
            },
            {
                accessorKey: "end_date",
                header: "End",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
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
        data: filteredByDropdowns,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue) => {
            const q = String(filterValue ?? "")
                .toLowerCase()
                .trim();
            if (!q) return true;

            const teacher = String(
                row.original.teacherName ?? "",
            ).toLowerCase();
            const email = String(
                row.original.teacher?.email ?? "",
            ).toLowerCase();
            const type = String(
                row.original.appointment_type ?? "",
            ).toLowerCase();
            const pos = String(row.original.position ?? "").toLowerCase();
            const memo = String(row.original.memo_no ?? "").toLowerCase();
            const remarks = String(row.original.remarks ?? "").toLowerCase();

            return (
                teacher.includes(q) ||
                email.includes(q) ||
                type.includes(q) ||
                pos.includes(q) ||
                memo.includes(q) ||
                remarks.includes(q)
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
    }, [globalFilter, selectedTeacher, selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    const clearFilters = () => {
        setSelectedTeacher("");
        setSelectedType("");
        setGlobalFilter("");
    };

    return (
        <div className="space-y-4">
            {/* toolbar card (no duplicate page header) */}
            <Card>
                <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base">Records</CardTitle>
                        <CardDescription>
                            {filteredCount} result
                            {filteredCount === 1 ? "" : "s"} • 10 per page
                        </CardDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        {/* desktop search */}
                        <div className="hidden md:block w-[360px]">
                            <Input
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search teacher, email, type, memo..."
                            />
                        </div>

                        <Button
                            className="gap-2"
                            onClick={() => setModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Entry
                        </Button>

                        {/* mobile search toggle */}
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
                                {searchOpen ? (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: "240px", opacity: 1 }}
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
                                ) : null}
                            </AnimatePresence>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* filters */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Combobox
                                label="Teacher"
                                options={teacherOptions}
                                onChangeValue={setSelectedTeacher}
                            />
                            <Combobox
                                label="Type"
                                options={typeOptions}
                                onChangeValue={setSelectedType}
                            />
                        </div>

                        {(selectedTeacher || selectedType || globalFilter) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* table */}
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((hg) => (
                                    <TableRow key={hg.id}>
                                        {hg.headers.map((header) => {
                                            const id = header.column.id;

                                            // hide columns on small screens (shown under teacher cell)
                                            const hideOnSmall =
                                                id === "appointment_type" ||
                                                id === "position" ||
                                                id === "start_date" ||
                                                id === "end_date" ||
                                                id === "memo_no" ||
                                                id === "remarks"
                                                    ? "hidden md:table-cell"
                                                    : "";

                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={hideOnSmall}
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
                                            className="border-b last:border-b-0 hover:bg-accent/40"
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => {
                                                    const id = cell.column.id;
                                                    const hideOnSmall =
                                                        id ===
                                                            "appointment_type" ||
                                                        id === "position" ||
                                                        id === "start_date" ||
                                                        id === "end_date" ||
                                                        id === "memo_no" ||
                                                        id === "remarks"
                                                            ? "hidden md:table-cell"
                                                            : "";

                                                    return (
                                                        <TableCell
                                                            key={cell.id}
                                                            className={
                                                                hideOnSmall
                                                            }
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

                    {/* pagination */}
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

            <AddAppointmentModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
