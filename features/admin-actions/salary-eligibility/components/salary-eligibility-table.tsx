"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

import {
    ArrowUpDown,
    Search,
    X,
    CheckCircle2,
    BadgeDollarSign,
    Loader2,
    Handshake,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";

import UserAvatar from "@/components/ui-elements/user-avatar";
import {
    SalaryStatusBadge,
    PositionBadge,
} from "@/components/ui-elements/badges";
import { fmtEmployeeId } from "@/components/formatter/employee-id-format";

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import type {
    TeacherEligibilityRow,
    EligibilityStatus,
} from "@/lib/database/salary-eligibility";
import { markSalaryIncreaseGivenAction } from "@/features/admin-actions/salary-eligibility/actions/salary-eligibility-actions";

// ── Mode ────────────────────────────────────────────────────────────────────

type EligibilityMode = "step" | "loyalty";

// ── Helpers ────────────────────────────────────────────────────────────────────

function normaliseMI(mi: string | null | undefined): string | null {
    if (!mi) return null;
    const trimmed = mi.trim().replace(/\.+$/, "");
    return trimmed ? `${trimmed}.` : null;
}

function formatDisplayName(
    firstName: string,
    lastName: string,
    middleInitial: string | null | undefined,
): string {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const mi = normaliseMI(middleInitial);
    const parts = [fn, mi, ln].filter(Boolean);
    return parts.join(" ");
}

// ── Loyalty math ──────────────────────────────────────────────────────────────

interface LoyaltyResult {
    milestone: number;
    milestoneDate: Date;
    intervalStart: Date;
    intervalMs: number;
    elapsedMs: number;
    pct: number;
    yearsRemaining: number;
    monthsRemaining: number;
    daysRemainingPart: number;
    daysRemaining: number;
    nextEligibleDateStr: string;
    status: "ELIGIBLE" | "APPROACHING" | "ON_TRACK";
    totalYears: number;
}

function computeLoyalty(
    raw: string | Date | null | undefined,
): LoyaltyResult | null {
    if (!raw) return null;
    const start = new Date(raw);
    if (isNaN(start.getTime())) return null;

    const today = new Date();

    let totalYears = today.getFullYear() - start.getFullYear();
    const mDiff = today.getMonth() - start.getMonth();
    const dDiff = today.getDate() - start.getDate();
    if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) totalYears--;

    let intervalStartYear: number;
    let milestoneYear: number;

    if (totalYears < 10) {
        intervalStartYear = 0;
        milestoneYear = 10;
    } else {
        const blocks = Math.floor((totalYears - 10) / 5);
        intervalStartYear = 10 + blocks * 5;
        milestoneYear = intervalStartYear + 5;
    }

    const intervalStart = new Date(start);
    intervalStart.setFullYear(start.getFullYear() + intervalStartYear);

    const milestoneDate = new Date(start);
    milestoneDate.setFullYear(start.getFullYear() + milestoneYear);

    const intervalMs = milestoneDate.getTime() - intervalStart.getTime();
    const elapsedMs = Math.max(0, today.getTime() - intervalStart.getTime());
    const pct = Math.min((elapsedMs / intervalMs) * 100, 100);

    const msRemaining = milestoneDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / 86_400_000));

    let yr = milestoneDate.getFullYear() - today.getFullYear();
    let mo = milestoneDate.getMonth() - today.getMonth();
    let dy = milestoneDate.getDate() - today.getDate();
    if (dy < 0) {
        mo--;
        dy += 30;
    }
    if (mo < 0) {
        yr--;
        mo += 12;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const nextEligibleDateStr = `${milestoneDate.getFullYear()}-${pad(milestoneDate.getMonth() + 1)}-${pad(milestoneDate.getDate())}`;

    const status: LoyaltyResult["status"] =
        daysRemaining === 0
            ? "ELIGIBLE"
            : daysRemaining <= 180
              ? "APPROACHING"
              : "ON_TRACK";

    return {
        milestone: milestoneYear,
        milestoneDate,
        intervalStart,
        intervalMs,
        elapsedMs,
        pct,
        yearsRemaining: yr,
        monthsRemaining: mo,
        daysRemainingPart: dy,
        daysRemaining,
        nextEligibleDateStr,
        status,
        totalYears,
    };
}

// ── Cycle progress bar ────────────────────────────────────────────────────────

function CycleBar({
    row,
    mode,
}: {
    row: TeacherEligibilityRow;
    mode: EligibilityMode;
}) {
    if (mode === "step") {
        const pct =
            row.status === "ELIGIBLE"
                ? 100
                : Math.min((row.cycleTotalDays / (3 * 365)) * 100, 99);
        const color =
            row.status === "ELIGIBLE"
                ? "bg-emerald-500"
                : row.status === "APPROACHING"
                  ? "bg-amber-500"
                  : "bg-sky-500";
        return (
            <div className="space-y-0.5 min-w-[80px]">
                <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${color}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                    {row.cycleYears}y {row.cycleMonths}m {row.cycleDays}d
                </div>
            </div>
        );
    }

    const loyalty = computeLoyalty(
        (row as TeacherEligibilityRow & { dateOfOriginalAppointment?: string })
            .dateOfOriginalAppointment,
    );
    if (!loyalty)
        return (
            <div className="text-[10px] text-muted-foreground italic">—</div>
        );

    const color =
        loyalty.status === "ELIGIBLE"
            ? "bg-rose-500"
            : loyalty.status === "APPROACHING"
              ? "bg-amber-500"
              : "bg-rose-400";
    const displayPct = loyalty.status === "ELIGIBLE" ? 100 : loyalty.pct;

    return (
        <div className="space-y-0.5 min-w-[80px]">
            <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${displayPct}%` }}
                />
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                {loyalty.yearsRemaining}y {loyalty.monthsRemaining}m{" "}
                {loyalty.daysRemainingPart}d left
            </div>
        </div>
    );
}

// ── Next increase cell ────────────────────────────────────────────────────────

function NextIncreaseCell({
    row,
    mode,
}: {
    row: TeacherEligibilityRow;
    mode: EligibilityMode;
}) {
    if (mode === "step") {
        return row.status === "ELIGIBLE" ? (
            <span className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Now
            </span>
        ) : (
            <div>
                <div className="font-mono text-xs">{row.nextEligibleDate}</div>
                <div className="text-[10px] text-muted-foreground">
                    in {Math.floor(row.daysUntilEligible / 365)}y{" "}
                    {Math.floor((row.daysUntilEligible % 365) / 30)}m
                </div>
            </div>
        );
    }

    const loyalty = computeLoyalty(
        (row as TeacherEligibilityRow & { dateOfOriginalAppointment?: string })
            .dateOfOriginalAppointment,
    );
    if (!loyalty)
        return (
            <div className="text-[10px] text-muted-foreground italic">—</div>
        );

    return loyalty.status === "ELIGIBLE" ? (
        <span className="text-rose-400 font-semibold text-sm flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Now
        </span>
    ) : (
        <div>
            <div className="font-mono text-xs">
                {loyalty.nextEligibleDateStr}
            </div>
            <div className="text-[10px] text-muted-foreground">
                in {loyalty.yearsRemaining}y {loyalty.monthsRemaining}m
            </div>
        </div>
    );
}

// ── Status badge helper for loyalty ──────────────────────────────────────────

function LoyaltyStatusCell({ row }: { row: TeacherEligibilityRow }) {
    const loyalty = computeLoyalty(
        (row as TeacherEligibilityRow & { dateOfOriginalAppointment?: string })
            .dateOfOriginalAppointment,
    );
    if (!loyalty)
        return (
            <div className="text-[10px] text-muted-foreground italic">—</div>
        );
    return (
        <SalaryStatusBadge status={loyalty.status.toLowerCase()} size="xs" />
    );
}

// ── Confirmation Dialog ───────────────────────────────────────────────────────

function MarkConfirmDialog({
    row,
    open,
    onClose,
    onConfirm,
    loading,
}: {
    row: TeacherEligibilityRow | null;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    if (!row) return null;
    const fullName = formatDisplayName(
        row.firstName,
        row.lastName,
        row.middleInitial,
    );

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) onClose();
            }}
        >
            <DialogContent className="max-w-md bg-card border-border/60">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-400">
                        <BadgeDollarSign className="h-5 w-5" />
                        Confirm Salary Increase
                    </DialogTitle>
                    <DialogDescription>
                        Please review the details before marking this salary
                        increase as given.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 p-4 space-y-2">
                    <p className="text-[12px] font-semibold text-emerald-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Confirm Action
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                        You are marking salary increase as given for{" "}
                        <span className="font-medium text-foreground">
                            {fullName}
                        </span>
                        .
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Position:{" "}
                        <span className="font-medium text-foreground">
                            {row.position}
                        </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Cycle start:{" "}
                        <span className="font-medium text-foreground">
                            {row.cycleStartDate}
                        </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        This action will reset the 3-year eligibility cycle for
                        this teacher.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="border-white/10 hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <BadgeDollarSign className="h-4 w-4" />
                        )}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Mark button ───────────────────────────────────────────────────────────────

function MarkButton({
    row,
    onOptimisticUpdate,
    onOpenDialog,
}: {
    row: TeacherEligibilityRow;
    onOptimisticUpdate: (userId: string) => void;
    onOpenDialog: (row: TeacherEligibilityRow) => void;
}) {
    if (row.status !== "ELIGIBLE") return null;

    return (
        <Button
            size="sm"
            onClick={() => onOpenDialog(row)}
            className="gap-1.5 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 whitespace-nowrap"
        >
            <BadgeDollarSign className="h-3 w-3" />
            Mark Increased
        </Button>
    );
}

// ── Mode toggle ───────────────────────────────────────────────────────────────

function ModeToggle({
    mode,
    onChange,
}: {
    mode: EligibilityMode;
    onChange: (m: EligibilityMode) => void;
}) {
    return (
        <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5 gap-0.5 shrink-0">
            <button
                onClick={() => onChange("step")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    mode === "step"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <TrendingUp className="h-3 w-3" />
                Step
            </button>
            <button
                onClick={() => onChange("loyalty")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    mode === "loyalty"
                        ? "bg-background shadow-sm text-rose-400"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <Handshake className="h-3 w-3" />
                Loyalty
            </button>
        </div>
    );
}

// ── Table component ───────────────────────────────────────────────────────────

interface SalaryEligibilityTableProps {
    data: TeacherEligibilityRow[];
    onOptimisticUpdate: (userId: string) => void;
}

export default function SalaryEligibilityTable({
    data,
    onOptimisticUpdate,
}: SalaryEligibilityTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<EligibilityStatus | "ALL">(
        "ALL",
    );
    const [searchOpen, setSearchOpen] = useState(false);
    const [mode, setMode] = useState<EligibilityMode>("step");

    // ── Dialog state ──────────────────────────────────────────────────────────
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] =
        useState<TeacherEligibilityRow | null>(null);
    const [markLoading, setMarkLoading] = useState(false);

    function handleOpenDialog(row: TeacherEligibilityRow) {
        setSelectedRow(row);
        setDialogOpen(true);
    }

    function handleCloseDialog() {
        if (markLoading) return;
        setDialogOpen(false);
        setSelectedRow(null);
    }

    async function handleConfirm() {
        if (!selectedRow) return;
        setMarkLoading(true);
        onOptimisticUpdate(selectedRow.userId);
        const res = await markSalaryIncreaseGivenAction(selectedRow.userId);
        setMarkLoading(false);
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success(
            `Salary increase marked for ${selectedRow.firstName} ${selectedRow.lastName}.`,
        );
        handleCloseDialog();
    }
    // ─────────────────────────────────────────────────────────────────────────

    const columns = useMemo<ColumnDef<TeacherEligibilityRow>[]>(
        () => [
            {
                accessorKey: "employeeId",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Employee ID <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-mono text-xs text-muted-foreground">
                        {fmtEmployeeId(
                            String(row.getValue("employeeId") ?? ""),
                        )}
                    </div>
                ),
            },
            {
                id: "fullName",
                accessorFn: (r) =>
                    `${(r.firstName ?? "").trim()} ${(r.lastName ?? "").trim()}`.trim(),
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const r = row.original;
                    const firstName = (r.firstName ?? "").trim();
                    const lastName = (r.lastName ?? "").trim();
                    const avatarName = [firstName, lastName]
                        .filter(Boolean)
                        .join(" ");
                    const displayName = formatDisplayName(
                        firstName,
                        lastName,
                        r.middleInitial,
                    );
                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                                name={avatarName}
                                src={r.profileImage ?? null}
                                className="h-8 w-8 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="font-medium truncate">
                                    {displayName || (
                                        <span className="text-muted-foreground italic text-xs">
                                            No name set
                                        </span>
                                    )}
                                </div>
                                <div className="md:hidden mt-1 space-y-0.5">
                                    <div className="text-xs text-muted-foreground truncate">
                                        {r.position}
                                    </div>
                                    <CycleBar row={r} mode={mode} />
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "position",
                header: "Position",
                cell: ({ row }) => (
                    <PositionBadge
                        position={row.getValue("position")}
                        size="xs"
                    />
                ),
            },
            {
                id: "cycleProgress",
                accessorFn: (r) =>
                    mode === "step"
                        ? r.cycleTotalDays
                        : (computeLoyalty(
                              (
                                  r as TeacherEligibilityRow & {
                                      dateOfOriginalAppointment?: string;
                                  }
                              ).dateOfOriginalAppointment,
                          )?.elapsedMs ?? 0),
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        {mode === "step"
                            ? "Cycle Progress"
                            : "Loyalty Progress"}{" "}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <CycleBar row={row.original} mode={mode} />,
            },
            {
                id: "nextIncrease",
                accessorFn: (r) =>
                    mode === "step"
                        ? r.nextEligibleDate
                        : (computeLoyalty(
                              (
                                  r as TeacherEligibilityRow & {
                                      dateOfOriginalAppointment?: string;
                                  }
                              ).dateOfOriginalAppointment,
                          )?.nextEligibleDateStr ?? ""),
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        {mode === "step" ? "Next Step" : "Next Milestone"}{" "}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <NextIncreaseCell row={row.original} mode={mode} />
                ),
            },
            {
                id: "status",
                accessorFn: (r) =>
                    mode === "step"
                        ? r.status
                        : (computeLoyalty(
                              (
                                  r as TeacherEligibilityRow & {
                                      dateOfOriginalAppointment?: string;
                                  }
                              ).dateOfOriginalAppointment,
                          )?.status ?? "ON_TRACK"),
                header: "Status",
                cell: ({ row }) =>
                    mode === "step" ? (
                        <SalaryStatusBadge
                            status={row.original.status.toLowerCase()}
                            size="xs"
                        />
                    ) : (
                        <LoyaltyStatusCell row={row.original} />
                    ),
                filterFn: (row, _id, filterValue) => {
                    if (!filterValue || filterValue === "ALL") return true;
                    if (mode === "step")
                        return row.original.status === filterValue;
                    const loyalty = computeLoyalty(
                        (
                            row.original as TeacherEligibilityRow & {
                                dateOfOriginalAppointment?: string;
                            }
                        ).dateOfOriginalAppointment,
                    );
                    return loyalty?.status === filterValue;
                },
            },
            {
                id: "action",
                header: "",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end">
                        {mode === "step" && (
                            <MarkButton
                                row={row.original}
                                onOptimisticUpdate={onOptimisticUpdate}
                                onOpenDialog={handleOpenDialog}
                            />
                        )}
                    </div>
                ),
            },
        ],
        [onOptimisticUpdate, mode], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue) => {
            const v = String(filterValue ?? "")
                .toLowerCase()
                .trim();
            if (!v) return true;
            const r = row.original;
            const full = `${r.firstName} ${r.lastName}`.toLowerCase();
            const emp = String(r.employeeId ?? "").toLowerCase();
            const pos = String(r.position ?? "").toLowerCase();
            return full.includes(v) || emp.includes(v) || pos.includes(v);
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10 },
            sorting: [{ id: "status", desc: false }],
        },
    });

    React.useEffect(() => {
        if (statusFilter === "ALL") {
            table.getColumn("status")?.setFilterValue(undefined);
        } else {
            table.getColumn("status")?.setFilterValue(statusFilter);
        }
        table.setPageIndex(0);
    }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        table.setPageIndex(0);
    }, [globalFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        setStatusFilter("ALL");
        table.setPageIndex(0);
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    return (
        <>
            {/* ── Confirmation Dialog ── */}
            <MarkConfirmDialog
                row={selectedRow}
                open={dialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirm}
                loading={markLoading}
            />

            <Card className="min-w-0 overflow-hidden">
                <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <CardTitle className="text-base">
                                {mode === "step"
                                    ? "All Teachers"
                                    : "Loyalty Eligibility"}
                            </CardTitle>
                            <ModeToggle mode={mode} onChange={setMode} />
                        </div>
                        <CardDescription>
                            {mode === "step"
                                ? `${filteredCount} result${filteredCount === 1 ? "" : "s"} · 10 per page`
                                : `${filteredCount} result${filteredCount === 1 ? "" : "s"} · loyalty milestones (10 yrs, then every 5 yrs)`}
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={statusFilter}
                            onValueChange={(v) =>
                                setStatusFilter(v as EligibilityStatus | "ALL")
                            }
                        >
                            <SelectTrigger className="h-9 w-[145px] text-xs">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    All statuses
                                </SelectItem>
                                <SelectItem value="ELIGIBLE">
                                    Eligible
                                </SelectItem>
                                <SelectItem value="APPROACHING">
                                    Approaching
                                </SelectItem>
                                <SelectItem value="ON_TRACK">
                                    On Track
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="hidden md:block w-[280px]">
                            <Input
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search name, employee ID, position..."
                                className="h-9"
                            />
                        </div>

                        <div className="flex md:hidden items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setSearchOpen((v) => !v)}
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
                                )}
                            </AnimatePresence>
                        </div>
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
                                                colId === "position" ||
                                                colId === "cycleProgress" ||
                                                colId === "nextIncrease"
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
                                                    const colId =
                                                        cell.column.id;
                                                    const hideOnSmall =
                                                        colId === "position" ||
                                                        colId ===
                                                            "cycleProgress" ||
                                                        colId === "nextIncrease"
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

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground">
                            Page {pageIndex + 1} of {pageCount}
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
        </>
    );
}
