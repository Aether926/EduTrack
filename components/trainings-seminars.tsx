"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
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
import { ArrowUpDown, MoreHorizontal, Search, X, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import PdViewModal from "@/components/pd-view-modal";

export type TrainingSeminarRow = {
    id: string;
    trainingId: string;
    type: string;
    title: string;
    level: string;
    startDate: string;
    endDate: string;
    totalHours: string;
    approvedHours: string | null;
    sponsor: string;
    status: string;
};

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
    const s = (status || "").toUpperCase();

    if (s === "APPROVED")
        return (
            <Badge className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Approved
            </Badge>
        );
    if (s === "REJECTED")
        return (
            <Badge className="inline-flex items-center gap-1.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Rejected
            </Badge>
        );
    if (s === "ENROLLED")
        return (
            <Badge className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Enrolled
            </Badge>
        );
    if (s === "PENDING")
        return (
            <Badge className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Pending
            </Badge>
        );

    return <Badge variant="outline">{status}</Badge>;
}

/* ─── Type chip ─── */
const typeColors: Record<string, string> = {
    training: "bg-teal-500/10 text-teal-400 border-teal-500/40",
    seminar: "bg-violet-500/10 text-violet-400 border-violet-500/40",
    workshop: "bg-orange-500/10 text-orange-400 border-orange-500/40",
    webinar: "bg-sky-500/10 text-sky-400 border-sky-500/40",
    conference: "bg-pink-500/10 text-pink-400 border-pink-500/40",
};

function TypeChip({ type }: { type: string }) {
    const key = (type || "").toLowerCase();
    const cls =
        typeColors[key] ?? "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {type}
        </span>
    );
}

/* ─── Level pill ─── */
function LevelPill({ level }: { level: string }) {
    const l = (level || "").toLowerCase();
    const cls =
        l === "regional"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
            : l === "national"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/40"
              : l === "international"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
                : "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {level}
        </span>
    );
}

export default function TrainingsSeminars({
    data,
}: {
    data: TrainingSeminarRow[];
}) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(
        null,
    );

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
        {},
    );

    const columns = useMemo<ColumnDef<TrainingSeminarRow>[]>(
        () => [
            {
                accessorKey: "type",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Type <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <TypeChip type={row.getValue("type") as string} />
                ),
            },
            {
                accessorKey: "title",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Title <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const r = row.original;
                    const canUpload =
                        r.status === "ENROLLED" || r.status === "REJECTED";
                    return (
                        <div className="min-w-0">
                            <div className="truncate font-medium">
                                {r.title}
                            </div>
                            {canUpload && (
                                <div className="md:hidden mt-1">
                                    <span className="rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 px-1.5 py-0.5 text-[10px] font-medium">
                                        Upload available
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "level",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Level <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <LevelPill level={row.getValue("level") as string} />
                    </div>
                ),
            },
            {
                accessorKey: "startDate",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Start <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-mono text-xs text-muted-foreground">
                        {row.getValue("startDate") as string}
                    </div>
                ),
            },
            {
                accessorKey: "endDate",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        End <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-mono text-xs text-muted-foreground">
                        {row.getValue("endDate") as string}
                    </div>
                ),
            },
            {
                accessorKey: "totalHours",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Hours <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const status = row.original.status;
                    const approvedHours = row.original.approvedHours;
                    const totalHours = row.getValue("totalHours") as string;
                    const isApproved = status === "APPROVED";
                    return (
                        <div className="flex items-center gap-1.5">
                            <Clock
                                className={`h-3.5 w-3.5 shrink-0 ${isApproved && approvedHours ? "text-emerald-400" : "text-muted-foreground"}`}
                            />
                            {isApproved && approvedHours ? (
                                <span className="text-emerald-400 font-semibold tabular-nums text-sm">
                                    {approvedHours}h
                                </span>
                            ) : (
                                <span className="text-muted-foreground tabular-nums text-sm">
                                    {totalHours}h
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "sponsor",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Sponsor <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="max-w-[260px] truncate text-sm text-muted-foreground">
                        {row.getValue("sponsor") as string}
                    </div>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <StatusBadge status={row.getValue("status") as string} />
                ),
            },
            {
                id: "actions",
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => {
                    const canUpload =
                        row.original.status === "ENROLLED" ||
                        row.original.status === "REJECTED";
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setSelectedTrainingId(
                                            row.original.trainingId,
                                        );
                                        setDetailsOpen(true);
                                    }}
                                >
                                    View details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {canUpload ? (
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={`/professional-dev/${row.original.id}/upload-proof`}
                                        >
                                            Upload proof
                                        </a>
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem disabled>
                                        Upload proof
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [],
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter, rowSelection },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        globalFilterFn: (row, _columnId, filterValue) => {
            const q = String(filterValue ?? "")
                .toLowerCase()
                .trim();
            if (!q) return true;
            return (
                String(row.original.title ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.type ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.level ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.sponsor ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.status ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.startDate ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.endDate ?? "")
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
    }, [globalFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    return (
        <>
            <Card className="min-w-0 overflow-hidden">
                {/*
                 * KEY FIX: CardHeader uses flex-col by default on mobile so the
                 * search stays inside the card. On md+ it goes flex-row.
                 * The search wrapper uses w-full md:w-[320px] so it never
                 * escapes the card boundary.
                 */}
                <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1 shrink-0">
                        <CardTitle className="text-base">
                            Trainings & Seminars
                        </CardTitle>
                        <CardDescription>
                            {filteredCount} result
                            {filteredCount === 1 ? "" : "s"} • 10 per page
                        </CardDescription>
                    </div>

                    {/* Desktop search — full width on mobile, fixed on md+ */}
                    <div className="hidden md:block w-full md:w-[320px]">
                        <Input
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search title, sponsor, status..."
                        />
                    </div>

                    {/* Mobile search icon → expand */}
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
                                    animate={{
                                        width: "min(240px, 55vw)",
                                        opacity: 1,
                                    }}
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
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((hg) => (
                                    <TableRow key={hg.id}>
                                        {hg.headers.map((header) => {
                                            const colId = header.column.id;
                                            const hideOnSmall =
                                                colId === "startDate" ||
                                                colId === "endDate" ||
                                                colId === "sponsor"
                                                    ? "hidden md:table-cell"
                                                    : "";
                                            const narrowActions =
                                                colId === "actions"
                                                    ? "w-[1%]"
                                                    : "";
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={`${hideOnSmall} ${narrowActions}`}
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
                                                    const colId =
                                                        cell.column.id;
                                                    const hideOnSmall =
                                                        colId === "startDate" ||
                                                        colId === "endDate" ||
                                                        colId === "sponsor"
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

                    {/* Pagination */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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

            <PdViewModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                trainingId={selectedTrainingId}
            />
        </>
    );
}
