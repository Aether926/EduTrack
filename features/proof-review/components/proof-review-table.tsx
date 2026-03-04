"use client";

import { useMemo, useState, useEffect } from "react";
import {
    ColumnDef,
    SortingState,
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
    Search,
    X,
    ShieldCheck,
    Clock,
    Building2,
    ExternalLink,
    MoreHorizontal,
} from "lucide-react";

import type { ProofReviewRow } from "../types";
import { useProofReview } from "../hooks/use-proof-review";
import { fmt } from "../lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ProofReviewModal from "@/features/proof-review/components/proof-review-modal";

/* ── chips ── */
const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/40",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
    rejected: "bg-red-500/10 text-red-400 border-red-500/40",
};
function StatusChip({ status }: { status: string }) {
    const cls =
        statusColors[status.toLowerCase()] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {status}
        </span>
    );
}

const typeColors: Record<string, string> = {
    training: "bg-teal-500/10 text-teal-400 border-teal-500/40",
    seminar: "bg-violet-500/10 text-violet-400 border-violet-500/40",
    workshop: "bg-orange-500/10 text-orange-400 border-orange-500/40",
    webinar: "bg-sky-500/10 text-sky-400 border-sky-500/40",
    conference: "bg-pink-500/10 text-pink-400 border-pink-500/40",
};
function TypeChip({ type }: { type: string }) {
    const cls =
        typeColors[(type ?? "").toLowerCase()] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {type}
        </span>
    );
}

function LevelPill({ level }: { level: string }) {
    const l = (level ?? "").toLowerCase();
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
            {level ?? "—"}
        </span>
    );
}

export default function ProofReviewTable({ rows }: { rows: ProofReviewRow[] }) {
    const {
        sortedRows,
        selected,
        setSelected,
        remarks,
        setRemarks,
        loadingId,
        onApprove,
        onReject,
    } = useProofReview(rows);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    const columns = useMemo<ColumnDef<ProofReviewRow>[]>(
        () => [
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => <StatusChip status={row.original.status} />,
            },
            {
                id: "type",
                header: "Type",
                cell: ({ row }) => (
                    <TypeChip type={row.original.training.type ?? "—"} />
                ),
            },
            {
                id: "title",
                accessorFn: (r) => r.training.title,
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Title <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium">
                        {row.original.training.title}
                    </div>
                ),
            },
            {
                id: "level",
                header: "Level",
                cell: ({ row }) => (
                    <LevelPill level={row.original.training.level ?? ""} />
                ),
            },
            {
                id: "teacher",
                accessorFn: (r) => r.teacher.name,
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Teacher <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <div className="font-medium text-sm">
                            {row.original.teacher.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                            {row.original.teacher.email ?? "—"}
                        </div>
                    </div>
                ),
            },
            {
                id: "hours",
                header: "Hours",
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {row.original.training.totalHours ?? "—"}h
                    </div>
                ),
            },
            {
                id: "sponsor",
                header: "Sponsor",
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        {row.original.training.sponsor ?? "—"}
                    </div>
                ),
            },
            {
                id: "actions",
                enableSorting: false,
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected(row.original);
                                }}
                            >
                                Review submission
                            </DropdownMenuItem>
                            {row.original.proofUrl ? (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={row.original.proofUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View proof
                                        </a>
                                    </DropdownMenuItem>
                                </>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: sortedRows,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _id, filterValue) => {
            const q = String(filterValue ?? "")
                .toLowerCase()
                .trim();
            if (!q) return true;
            const r = row.original;
            return (
                r.training.title.toLowerCase().includes(q) ||
                r.teacher.name.toLowerCase().includes(q) ||
                (r.teacher.email ?? "").toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q) ||
                (r.training.type ?? "").toLowerCase().includes(q) ||
                (r.training.level ?? "").toLowerCase().includes(q) ||
                (r.training.sponsor ?? "").toLowerCase().includes(q)
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
    const pageCount = table.getPageCount();

    return (
        <div className="space-y-4">
            <Card className="min-w-0">
                <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                            <div className="rounded-md border border-white/10 bg-white/5 p-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            Proof Submissions
                        </CardTitle>
                        <CardDescription>
                            {filteredCount} result
                            {filteredCount === 1 ? "" : "s"} • 10 per page
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="hidden md:block w-[360px]">
                            <Input
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search title, teacher, status..."
                            />
                        </div>

                        <div className="flex md:hidden items-center w-full min-w-0">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSearchOpen((v) => !v)}
                                aria-label="Search"
                                className={`shrink-0 transition-all ${searchOpen ? "rounded-r-none border-r-0 bg-muted/50" : ""}`}
                            >
                                {searchOpen ? (
                                    <X className="h-3.5 w-3.5" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>

                            <AnimatePresence initial={false}>
                                {searchOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "100%" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="flex-1 min-w-0 overflow-hidden relative"
                                    >
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                        <Input
                                            value={globalFilter ?? ""}
                                            onChange={(e) =>
                                                setGlobalFilter(e.target.value)
                                            }
                                            placeholder="Search..."
                                            className="h-9 w-full rounded-l-none pl-8"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="rounded-lg border overflow-x-auto">
                        <Table className="min-w-[700px]">
                            <TableHeader>
                                {table.getHeaderGroups().map((hg) => (
                                    <TableRow key={hg.id}>
                                        {hg.headers.map((header) => {
                                            const id = header.column.id;
                                            const hideOnSmall =
                                                id === "teacher" ||
                                                id === "sponsor" ||
                                                id === "hours"
                                                    ? "hidden md:table-cell"
                                                    : "";
                                            const actionsCol =
                                                id === "actions"
                                                    ? "w-[1%]"
                                                    : "";
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={`${hideOnSmall} ${actionsCol}`}
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
                                            className="border-b last:border-b-0 cursor-pointer hover:bg-accent/40"
                                            onClick={() =>
                                                setSelected(row.original)
                                            }
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => {
                                                    const id = cell.column.id;
                                                    const hideOnSmall =
                                                        id === "teacher" ||
                                                        id === "sponsor" ||
                                                        id === "hours"
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

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {pageCount || 1}
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

            <ProofReviewModal
                row={selected}
                open={!!selected}
                onOpenChange={(open) => {
                    if (!open) setSelected(null);
                }}
                remarks={remarks}
                setRemarks={setRemarks}
                loadingId={loadingId}
                onApprove={onApprove}
                onReject={onReject}
            />
        </div>
    );
}
