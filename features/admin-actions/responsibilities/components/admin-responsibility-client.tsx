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
    ArrowUp,
    ArrowDown,
    Plus,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import InitialAvatar from "@/components/ui-elements/avatars/avatar-color";

import { AddResponsibilitySheet } from "@/features/admin-actions/responsibilities/components/add-responsibility-modal";
import { ResponsibilityDetailSheet } from "@/features/admin-actions/responsibilities/components/responsibility-details-sheet";
import {
    updateResponsibilityStatus,
    approveChangeRequest,
    rejectChangeRequest,
} from "@/features/admin-actions/responsibilities/actions/admin-responsibility-actions";

import type {
    ResponsibilityWithTeacher,
    ResponsibilityChangeRequest,
} from "@/features/admin-actions/responsibilities/types/responsibility";

// ── Chips ──────────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
    TEACHING_LOAD: "Teaching Load",
    COORDINATOR: "Coordinator Role",
    OTHER: "Other Duties",
};

const TYPE_COLORS: Record<string, string> = {
    TEACHING_LOAD: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    COORDINATOR: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    OTHER: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

function TypeChip({ type }: { type: string }) {
    const cls =
        TYPE_COLORS[type] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/30";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {TYPE_LABEL[type] ?? type}
        </span>
    );
}

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    ENDED: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

function StatusChip({ status }: { status: string }) {
    const cls =
        STATUS_COLORS[status] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/30";
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

// ── RequestRow ─────────────────────────────────────────────────────────────────

function RequestRow(props: {
    request: ResponsibilityChangeRequest & {
        teacher: {
            firstName: string;
            lastName: string;
            email?: string | null;
        } | null;
        responsibility: { title: string } | null;
    };
    onRefresh: () => void;
}) {
    const { request, onRefresh } = props;
    const [expanded, setExpanded] = useState(false);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const teacher = request.teacher;
    const fullName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`
        : "Unknown";

    const handleApprove = async () => {
        setLoading(true);
        try {
            await approveChangeRequest(request.id, note || undefined);
            toast.success("Request approved.");
            onRefresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!note.trim()) return toast.info("Please provide a rejection note.");
        setLoading(true);
        try {
            await rejectChangeRequest(request.id, note);
            toast.success("Request rejected.");
            onRefresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
            <button
                className="w-full text-left px-4 py-3 hover:bg-accent/30 transition-colors"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                                {fullName}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {request.responsibility?.title ?? "—"}
                            </span>
                            <StatusChip status={request.status} />
                        </div>
                        {teacher?.email && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {teacher.email}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <span className="font-mono">
                            {new Date(
                                request.requested_at,
                            ).toLocaleDateString()}
                        </span>
                        {expanded ? (
                            <ChevronUp size={14} />
                        ) : (
                            <ChevronDown size={14} />
                        )}
                    </div>
                </div>
            </button>

            {expanded && (
                <div className="border-t border-border/60 px-4 py-4 space-y-3 bg-background/40">
                    <div className="space-y-2">
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                            Requested changes
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {Object.entries(
                                request.requested_changes ?? {},
                            ).map(([key, val]) => (
                                <div
                                    key={key}
                                    className="rounded-md border border-border/60 bg-muted/10 p-3"
                                >
                                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider capitalize mb-0.5">
                                        {key.replaceAll("_", " ")}
                                    </div>
                                    <div className="text-sm font-medium break-words">
                                        {typeof val === "object"
                                            ? JSON.stringify(val)
                                            : String(val)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-md border border-border/60 bg-muted/10 p-3">
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                            Reason
                        </div>
                        <div className="text-sm">{request.reason}</div>
                    </div>
                    {request.status === "PENDING" ? (
                        <div className="space-y-2">
                            <Textarea
                                rows={3}
                                placeholder="Review note (required for rejection)..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="text-sm"
                            />
                            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                    onClick={handleApprove}
                                    disabled={loading}
                                >
                                    {loading && (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                    onClick={handleReject}
                                    disabled={loading}
                                >
                                    Reject
                                </Button>
                            </div>
                        </div>
                    ) : request.review_note ? (
                        <div className="text-xs text-muted-foreground italic border border-border/40 rounded-md px-3 py-2 bg-muted/10">
                            Note: {request.review_note}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function AdminResponsibilitiesClient(props: {
    responsibilities: ResponsibilityWithTeacher[];
    changeRequests: (ResponsibilityChangeRequest & {
        teacher: {
            firstName: string;
            lastName: string;
            email?: string | null;
        } | null;
        responsibility: { title: string } | null;
    })[];
    teachers: { id: string; fullName: string }[];
}) {
    const { responsibilities, changeRequests } = props;
    const router = useRouter();

    const [addOpen, setAddOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedRow, setSelectedRow] =
        useState<ResponsibilityWithTeacher | null>(null);

    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [positionFilter, setPositionFilter] = useState<string | null>(null);
    const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Derive filter options
    const positionOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of responsibilities) {
            const pos = (r.teacher as any)?.position;
            if (pos) set.add(pos);
        }
        return Array.from(set).sort();
    }, [responsibilities]);

    const subjectOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of responsibilities) {
            const sub = (r.details as any)?.subject;
            if (sub) set.add(sub);
        }
        return Array.from(set).sort();
    }, [responsibilities]);

    const hasFilters =
        typeFilter ||
        statusFilter ||
        positionFilter ||
        subjectFilter ||
        globalFilter;

    const filtered = useMemo(() => {
        return (responsibilities ?? [])
            .filter((r: any) => {
                if (typeFilter && r.type !== typeFilter) return false;
                if (statusFilter && r.status !== statusFilter) return false;
                if (
                    positionFilter &&
                    (r.teacher as any)?.position !== positionFilter
                )
                    return false;
                if (
                    subjectFilter &&
                    (r.details as any)?.subject !== subjectFilter
                )
                    return false;
                return true;
            })
            .map((r: any) => ({
                ...r,
                teacherName: r.teacher
                    ? `${r.teacher.firstName} ${r.teacher.lastName}`
                    : "Unknown",
                teacherEmail: r.teacher?.email ?? "",
                teacherPosition: r.teacher?.position ?? "",
                teacherProfileImage: r.teacher?.profileImage ?? null,
            }));
    }, [
        responsibilities,
        typeFilter,
        statusFilter,
        positionFilter,
        subjectFilter,
    ]);

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "teacherName",
                header: ({ column }) => {
                    const sorted = column.getIsSorted();
                    return (
                        <Button
                            variant="ghost"
                            className="px-2"
                            onClick={() =>
                                column.toggleSorting(sorted === "asc")
                            }
                        >
                            Teacher{" "}
                            {sorted === "asc" ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                            ) : sorted === "desc" ? (
                                <ArrowDown className="ml-2 h-4 w-4" />
                            ) : (
                                <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />
                            )}
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const r = row.original;
                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <InitialAvatar
                                name={r.teacherName}
                                src={r.teacherProfileImage}
                                className="h-8 w-8 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium">
                                    {r.teacherName}
                                </div>
                                <div className="truncate text-xs text-muted-foreground hidden md:block">
                                    {r.teacherPosition || r.teacherEmail || "—"}
                                </div>
                                <div className="md:hidden mt-1.5 flex flex-wrap items-center gap-1.5">
                                    <TypeChip type={r.type} />
                                    <StatusChip status={r.status} />
                                    <span className="text-xs text-muted-foreground truncate">
                                        {r.title}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "type",
                header: () => (
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                        Type
                    </span>
                ),
                cell: ({ row }) => <TypeChip type={row.original.type} />,
            },
            {
                accessorKey: "title",
                header: () => (
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                        Title
                    </span>
                ),
                cell: ({ row }) => (
                    <span className="text-sm truncate max-w-[180px] block">
                        {row.original.title}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: () => (
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                        Status
                    </span>
                ),
                cell: ({ row }) => <StatusChip status={row.original.status} />,
            },
            {
                id: "actions",
                header: "",
                enableSorting: false,
                cell: ({ row }) => {
                    const r = row.original;
                    const isActive = r.status === "ACTIVE";
                    const busy = updatingId === r.id;
                    return (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            className={
                                isActive
                                    ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs h-7"
                                    : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs h-7"
                            }
                            onClick={async (e) => {
                                e.stopPropagation();
                                setUpdatingId(r.id);
                                try {
                                    await updateResponsibilityStatus(
                                        r.id,
                                        isActive ? "ENDED" : "ACTIVE",
                                    );
                                    toast.success(
                                        isActive
                                            ? "Marked as ended."
                                            : "Marked as active.",
                                    );
                                    router.refresh();
                                } catch {
                                    toast.error("Failed to update status.");
                                } finally {
                                    setUpdatingId(null);
                                }
                            }}
                        >
                            {busy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isActive ? (
                                "Mark Ended"
                            ) : (
                                "Mark Active"
                            )}
                        </Button>
                    );
                },
            },
        ],
        [router, updatingId],
    );

    const table = useReactTable({
        data: filtered,
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
                String(row.original.teacherEmail ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.type ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.title ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.status ?? "")
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
    }, [globalFilter, typeFilter, statusFilter, positionFilter, subjectFilter]); // eslint-disable-line

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    const pendingRequests = (changeRequests ?? []).filter(
        (r: any) => r.status === "PENDING",
    );
    const reviewedRequests = (changeRequests ?? []).filter(
        (r: any) => r.status !== "PENDING",
    );

    return (
        <div className="space-y-4">
            {/* ── Assignments card ── */}
            <Card className="min-w-0 overflow-hidden">
                <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 shrink-0">
                            <ClipboardList className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base">
                                Assignments
                            </CardTitle>
                            <CardDescription>
                                {filteredCount} result
                                {filteredCount === 1 ? "" : "s"} • 10 per page
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <div className="hidden md:block w-[280px]">
                            <Input
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search teacher, title, type..."
                            />
                        </div>
                        <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => setAddOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> Assign Responsibility
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
                                    className="gap-2 min-w-[140px] justify-between"
                                >
                                    <span className="truncate">
                                        {typeFilter
                                            ? TYPE_LABEL[typeFilter]
                                            : "All Types"}
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
                                <DropdownMenuItem
                                    onClick={() =>
                                        setTypeFilter("TEACHING_LOAD")
                                    }
                                >
                                    Teaching Load
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTypeFilter("COORDINATOR")}
                                >
                                    Coordinator Role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTypeFilter("OTHER")}
                                >
                                    Other Duties
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Status */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 min-w-[130px] justify-between"
                                >
                                    <span className="truncate">
                                        {statusFilter ?? "All Statuses"}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onClick={() => setStatusFilter(null)}
                                >
                                    All Statuses
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setStatusFilter("ACTIVE")}
                                >
                                    Active
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setStatusFilter("ENDED")}
                                >
                                    Ended
                                </DropdownMenuItem>
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

                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setTypeFilter(null);
                                    setStatusFilter(null);
                                    setPositionFilter(null);
                                    setSubjectFilter(null);
                                    setGlobalFilter("");
                                }}
                                className="text-muted-foreground gap-1"
                            >
                                <X className="h-3.5 w-3.5" /> Clear filters
                            </Button>
                        )}
                    </div>

                    <div className="rounded-md border border-border/60 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((hg) => (
                                    <TableRow
                                        key={hg.id}
                                        className="hover:bg-transparent border-border/60"
                                    >
                                        {hg.headers.map((header) => {
                                            const id = header.column.id;
                                            const hide =
                                                id === "type" ||
                                                id === "title" ||
                                                id === "status"
                                                    ? "hidden md:table-cell"
                                                    : "";
                                            const actionsCol =
                                                id === "actions"
                                                    ? "w-[1%]"
                                                    : "";
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={`${hide} ${actionsCol} bg-muted/30`}
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
                                            onClick={() => {
                                                // find the original responsibility object
                                                const orig =
                                                    responsibilities.find(
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
                                                    const hide =
                                                        id === "type" ||
                                                        id === "title" ||
                                                        id === "status"
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
                                            className="h-24 text-center text-sm text-muted-foreground"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

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

            {/* ── Pending requests ── */}
            {pendingRequests.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                            Pending Requests
                        </span>
                        <span className="inline-block rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[11px] font-semibold">
                            {pendingRequests.length}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {pendingRequests.map((r: any) => (
                            <RequestRow
                                key={r.id}
                                request={r}
                                onRefresh={() => router.refresh()}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Reviewed requests ── */}
            {reviewedRequests.length > 0 && (
                <div className="space-y-2">
                    <div className="px-1">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                            Reviewed Requests
                        </span>
                    </div>
                    <div className="space-y-2">
                        {reviewedRequests.map((r: any) => (
                            <RequestRow
                                key={r.id}
                                request={r}
                                onRefresh={() => router.refresh()}
                            />
                        ))}
                    </div>
                </div>
            )}

            <AddResponsibilitySheet
                open={addOpen}
                onOpenChange={setAddOpen}
                onSuccess={() => router.refresh()}
            />

            <ResponsibilityDetailSheet
                open={detailOpen}
                onOpenChange={setDetailOpen}
                responsibility={selectedRow}
                onSuccess={() => {
                    router.refresh();
                }}
            />
        </div>
    );
}
