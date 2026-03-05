"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    Loader2,
    RefreshCw,
    Search,
    Settings,
    ShieldAlert,
    ShieldCheck,
    ShieldX,
    X,
} from "lucide-react";
import { toast } from "sonner";

import {
    recomputeAllCompliance,
    upsertCompliancePolicy,
} from "@/features/compliance/actions/admin-compliance-actions";
import { STATUS_LABEL, STATUS_BADGE } from "@/features/compliance/lib/status";
import type {
    ComplianceWithTeacher,
    TrainingCompliancePolicy,
    ComplianceStatus,
} from "@/features/compliance/types/compliance";

import { useComplianceReport } from "@/features/compliance/hooks/use-compliance-report";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const STATUS_ICON: Record<ComplianceStatus, React.ReactNode> = {
    COMPLIANT: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
    AT_RISK: <ShieldAlert className="h-4 w-4 text-amber-400" />,
    NON_COMPLIANT: <ShieldX className="h-4 w-4 text-rose-400" />,
};

const STATUS_ORDER: Record<ComplianceStatus, number> = {
    NON_COMPLIANT: 0,
    AT_RISK: 1,
    COMPLIANT: 2,
};

const ALL_STATUS = "__ALL_STATUS__";
const ALL_SCHOOLS = "__ALL_SCHOOLS__";

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5 block">
            {children}
        </label>
    );
}

function StatusPill({ status }: { status: ComplianceStatus }) {
    const cfg: Record<
        ComplianceStatus,
        { icon: React.ReactNode; label: string; cls: string }
    > = {
        COMPLIANT: {
            icon: <ShieldCheck className="h-3 w-3" />,
            label: "Compliant",
            cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        },
        AT_RISK: {
            icon: <ShieldAlert className="h-3 w-3" />,
            label: "At Risk",
            cls: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        },
        NON_COMPLIANT: {
            icon: <ShieldX className="h-3 w-3" />,
            label: "Non-Compliant",
            cls: "border-rose-500/30 bg-rose-500/10 text-rose-400",
        },
    };
    const { icon, label, cls } = cfg[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {icon}
            {label}
        </span>
    );
}

export function AdminComplianceClient(props: {
    compliance: ComplianceWithTeacher[];
    policies: TrainingCompliancePolicy[];
    schools: { id: string; name: string }[];
    schoolYear: string;
}) {
    const { compliance, policies, schools, schoolYear } = props;
    const router = useRouter();

    const [policyOpen, setPolicyOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] =
        useState<TrainingCompliancePolicy | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterSchool, setFilterSchool] = useState<string>("");
    const [query, setQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [recalculating, setRecalculating] = useState(false);

    const { downloading, download } = useComplianceReport(schoolYear);

    const [policyForm, setPolicyForm] = useState({
        school_id: "",
        school_year: schoolYear,
        required_hours: "40",
        at_risk_threshold_hours: "10",
        period_start: "",
        period_end: "",
    });

    const counts = {
        NON_COMPLIANT: compliance.filter((c) => c.status === "NON_COMPLIANT")
            .length,
        AT_RISK: compliance.filter((c) => c.status === "AT_RISK").length,
        COMPLIANT: compliance.filter((c) => c.status === "COMPLIANT").length,
    };

    const sorted = useMemo(() => {
        const q = query.trim().toLowerCase();
        return [...compliance]
            .filter((c: any) => {
                const matchStatus = filterStatus
                    ? c.status === filterStatus
                    : true;
                const matchSchool = filterSchool
                    ? c.school_id === filterSchool
                    : true;
                if (!q) return matchStatus && matchSchool;
                const name =
                    `${c.teacher?.firstName ?? ""} ${c.teacher?.lastName ?? ""}`.toLowerCase();
                const email = String(c.teacher?.email ?? "").toLowerCase();
                const school = String(c.school?.name ?? "").toLowerCase();
                return (
                    matchStatus &&
                    matchSchool &&
                    (name.includes(q) ||
                        email.includes(q) ||
                        school.includes(q))
                );
            })
            .sort(
                (a: any, b: any) =>
                    STATUS_ORDER[a.status as ComplianceStatus] -
                    STATUS_ORDER[b.status as ComplianceStatus],
            );
    }, [compliance, filterStatus, filterSchool, query]);

    const handleSavePolicy = async () => {
        if (!policyForm.period_start || !policyForm.period_end) {
            toast.info("Please fill in all required fields.");
            return;
        }
        setSubmitting(true);
        try {
            await upsertCompliancePolicy({
                school_id: policyForm.school_id || null,
                school_year: policyForm.school_year,
                required_hours: Number(policyForm.required_hours),
                at_risk_threshold_hours: Number(
                    policyForm.at_risk_threshold_hours,
                ),
                period_start: policyForm.period_start,
                period_end: policyForm.period_end,
                is_edit: !!editingPolicy,
            });
            toast.success("Policy saved.");
            setPolicyOpen(false);
            setEditingPolicy(null);
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            await recomputeAllCompliance();
            toast.success("Compliance recalculated.");
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to recalculate.",
            );
        } finally {
            setRecalculating(false);
        }
    };

    const clearFilters = () => {
        setFilterStatus("");
        setFilterSchool("");
        setQuery("");
    };

    return (
        <div className="space-y-4">
            {/* ── Toolbar ── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="px-5 py-4 space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Status pills */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                {counts.COMPLIANT} compliant
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                {counts.AT_RISK} at risk
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                {counts.NON_COMPLIANT} non-compliant
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => download("admin")}
                                disabled={downloading}
                                className="gap-1.5"
                            >
                                {downloading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Download className="h-3.5 w-3.5" />
                                )}
                                Download Report
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRecalculate}
                                disabled={recalculating}
                                className="gap-1.5"
                            >
                                {recalculating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-3.5 w-3.5" />
                                )}
                                Recalculate
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => setPolicyOpen(true)}
                            >
                                <Settings className="h-3.5 w-3.5" />
                                Manage Policy
                            </Button>
                        </div>
                    </div>

                    {/* Filters + search */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-row sm:flex-col sm:flex-row gap-2">
                            <Select
                                value={filterStatus ? filterStatus : ALL_STATUS}
                                onValueChange={(v) =>
                                    setFilterStatus(v === ALL_STATUS ? "" : v)
                                }
                            >
                                <SelectTrigger className="w-44 h-8 text-xs">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_STATUS}>
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="NON_COMPLIANT">
                                        Non-Compliant
                                    </SelectItem>
                                    <SelectItem value="AT_RISK">
                                        At Risk
                                    </SelectItem>
                                    <SelectItem value="COMPLIANT">
                                        Compliant
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={
                                    filterSchool ? filterSchool : ALL_SCHOOLS
                                }
                                onValueChange={(v) =>
                                    setFilterSchool(v === ALL_SCHOOLS ? "" : v)
                                }
                            >
                                <SelectTrigger className="w-44 h-8 text-xs">
                                    <SelectValue placeholder="All schools" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_SCHOOLS}>
                                        All schools
                                    </SelectItem>
                                    {schools.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Desktop search */}
                        <div className="hidden md:block w-[360px]">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search teacher, email, school..."
                                className="h-8 text-xs"
                            />
                        </div>

                        {/* Mobile search */}
                        <div className="flex md:hidden w-full">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search teacher, email, school..."
                                    className="h-8 text-xs pl-8 w-full"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {filterStatus || filterSchool || query ? (
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-xs h-7"
                            >
                                Clear filters
                            </Button>
                            <span className="text-[11px] text-muted-foreground">
                                {sorted.length} of {compliance.length} teachers
                            </span>
                        </div>
                    ) : (
                        <span className="text-[11px] text-muted-foreground">
                            {sorted.length} teachers
                        </span>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-2.5">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 shrink-0">
                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Compliance list
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                                Sorted by risk (non-compliant → compliant)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground pl-4">
                                    Teacher
                                </TableHead>
                                <TableHead className="md:hidden text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Status
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                    School
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Total
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Required
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Remaining
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sorted.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground py-10 text-sm"
                                    >
                                        No compliance records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sorted.map((c: any, idx: number) => (
                                    <motion.tr
                                        key={c.teacher_id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.16,
                                            delay: Math.min(idx * 0.01, 0.15),
                                        }}
                                        className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                    >
                                        <TableCell className="pl-4 py-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium leading-snug">
                                                    {c.teacher
                                                        ? `${c.teacher.firstName} ${c.teacher.lastName}`
                                                        : "Unknown"}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground font-mono">
                                                    {c.teacher?.email ?? "—"}
                                                </p>
                                                {/* Mobile hours row */}
                                                <div className="md:hidden flex items-center gap-2 mt-1.5">
                                                    <span className="text-[11px] font-mono text-muted-foreground">
                                                        {c.total_hours}h /{" "}
                                                        {c.required_hours}h
                                                    </span>
                                                    <span
                                                        className="text-[11px] font-semibold px-1.5 py-0.5 rounded border"
                                                        style={
                                                            c.remaining_hours >
                                                            0
                                                                ? {
                                                                      color: "rgb(251,113,133)",
                                                                      borderColor:
                                                                          "rgba(244,63,94,0.30)",
                                                                      backgroundColor:
                                                                          "rgba(244,63,94,0.08)",
                                                                  }
                                                                : {
                                                                      color: "rgb(52,211,153)",
                                                                      borderColor:
                                                                          "rgba(16,185,129,0.30)",
                                                                      backgroundColor:
                                                                          "rgba(16,185,129,0.08)",
                                                                  }
                                                        }
                                                    >
                                                        {c.remaining_hours}h
                                                        remaining
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Mobile-only status cell */}
                                        <TableCell className="md:hidden text-center pr-4 align-middle">
                                            <StatusPill
                                                status={
                                                    c.status as ComplianceStatus
                                                }
                                            />
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {c.school?.name ?? "—"}
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-center font-semibold tabular-nums text-sm">
                                            {c.total_hours}h
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-center text-sm text-muted-foreground tabular-nums">
                                            {c.required_hours}h
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-center">
                                            <span
                                                className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-md border"
                                                style={
                                                    c.remaining_hours > 0
                                                        ? {
                                                              color: "rgb(251,113,133)",
                                                              borderColor:
                                                                  "rgba(244,63,94,0.30)",
                                                              backgroundColor:
                                                                  "rgba(244,63,94,0.08)",
                                                          }
                                                        : {
                                                              color: "rgb(52,211,153)",
                                                              borderColor:
                                                                  "rgba(16,185,129,0.30)",
                                                              backgroundColor:
                                                                  "rgba(16,185,129,0.08)",
                                                          }
                                                }
                                            >
                                                {c.remaining_hours}h
                                            </span>
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-center">
                                            <StatusPill
                                                status={
                                                    c.status as ComplianceStatus
                                                }
                                            />
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Policy dialog ── */}
            <Dialog
                open={policyOpen}
                onOpenChange={(open) => {
                    setPolicyOpen(open);
                    if (!open) setEditingPolicy(null);
                }}
            >
                <DialogContent className="max-w-md w-[90vw] p-0 gap-0">
                    {/* Header */}
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2.5 mb-1">
                                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                    <Settings className="h-4 w-4 text-blue-400" />
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    {editingPolicy
                                        ? "Edit Compliance Policy"
                                        : "New Compliance Policy"}
                                </DialogTitle>
                            </div>
                        </DialogHeader>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-4">
                        {policies.length > 0 && !editingPolicy ? (
                            <div className="space-y-2">
                                <FieldLabel>Existing Policies</FieldLabel>
                                {policies.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/10"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {p.school_year}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                                {p.required_hours}h required ·{" "}
                                                {p.at_risk_threshold_hours}h
                                                threshold
                                            </p>
                                            <p className="text-[11px] text-muted-foreground font-mono">
                                                {p.period_start} →{" "}
                                                {p.period_end}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                                setEditingPolicy(p);
                                                setPolicyForm({
                                                    school_id:
                                                        p.school_id ?? "",
                                                    school_year: p.school_year,
                                                    required_hours: String(
                                                        p.required_hours,
                                                    ),
                                                    at_risk_threshold_hours:
                                                        String(
                                                            p.at_risk_threshold_hours,
                                                        ),
                                                    period_start:
                                                        p.period_start,
                                                    period_end: p.period_end,
                                                });
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                ))}
                                <div className="border-t border-border/60 pt-4">
                                    <FieldLabel>Add New Policy</FieldLabel>
                                </div>
                            </div>
                        ) : null}

                        <div className="space-y-1">
                            <FieldLabel>School Year</FieldLabel>
                            <Input
                                value={policyForm.school_year}
                                onChange={(e) =>
                                    setPolicyForm((f) => ({
                                        ...f,
                                        school_year: e.target.value,
                                    }))
                                }
                                placeholder="e.g. SY 2025-2026"
                                disabled={!!editingPolicy}
                                className="text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <FieldLabel>Required Hours</FieldLabel>
                                <Input
                                    type="number"
                                    value={policyForm.required_hours}
                                    onChange={(e) =>
                                        setPolicyForm((f) => ({
                                            ...f,
                                            required_hours: e.target.value,
                                        }))
                                    }
                                    disabled={!!editingPolicy}
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <FieldLabel>At-Risk Threshold (hrs)</FieldLabel>
                                <Input
                                    type="number"
                                    value={policyForm.at_risk_threshold_hours}
                                    onChange={(e) =>
                                        setPolicyForm((f) => ({
                                            ...f,
                                            at_risk_threshold_hours:
                                                e.target.value,
                                        }))
                                    }
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <FieldLabel>Period Start</FieldLabel>
                                <Input
                                    type="date"
                                    value={policyForm.period_start}
                                    onChange={(e) =>
                                        setPolicyForm((f) => ({
                                            ...f,
                                            period_start: e.target.value,
                                        }))
                                    }
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <FieldLabel>Period End</FieldLabel>
                                <Input
                                    type="date"
                                    value={policyForm.period_end}
                                    onChange={(e) =>
                                        setPolicyForm((f) => ({
                                            ...f,
                                            period_end: e.target.value,
                                        }))
                                    }
                                    min={policyForm.period_start || undefined}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {!editingPolicy ? (
                            <div className="space-y-1">
                                <FieldLabel>
                                    School (leave empty for global policy)
                                </FieldLabel>
                                <Select
                                    value={policyForm.school_id || "global"}
                                    onValueChange={(v) =>
                                        setPolicyForm((f) => ({
                                            ...f,
                                            school_id: v === "global" ? "" : v,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Global (all schools)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="global">
                                            Global (all schools)
                                        </SelectItem>
                                        {schools.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-br from-card to-background flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setPolicyOpen(false);
                                setEditingPolicy(null);
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSavePolicy}
                            disabled={submitting}
                            className="gap-1.5"
                        >
                            {submitting && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            {submitting
                                ? "Saving..."
                                : editingPolicy
                                  ? "Update Policy"
                                  : "Save Policy"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
