"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Download,
    Loader2,
    RefreshCw,
    Search,
    Settings,
    ShieldCheck,
    X,
} from "lucide-react";
import UserAvatar from "@/components/ui-elements/avatars/user-avatar";
import { RiskStatusBadge } from "@/components/ui-elements/badges";
import { toast } from "sonner";

import { recomputeAllCompliance } from "@/features/compliance/actions/admin-compliance-actions";
import type {
    ComplianceWithTeacher,
    TrainingCompliancePolicy,
    ComplianceStatus,
} from "@/features/compliance/types/compliance";

import { useComplianceReport } from "@/features/compliance/hooks/use-compliance-report";
import { CompliancePolicySheet } from "./compliance-policy-sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const STATUS_ORDER: Record<ComplianceStatus, number> = {
    NON_COMPLIANT: 0,
    AT_RISK: 1,
    COMPLIANT: 2,
};

const ALL_STATUS = "__ALL_STATUS__";

export function AdminComplianceClient(props: {
    compliance: ComplianceWithTeacher[];
    policies: TrainingCompliancePolicy[];
    schoolYear: string;
}) {
    const { compliance, policies, schoolYear } = props;
    const router = useRouter();

    const [policyOpen, setPolicyOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [query, setQuery] = useState("");
    const [recalculating, setRecalculating] = useState(false);

    const { downloading, download } = useComplianceReport(schoolYear);

    const counts = {
        NON_COMPLIANT: compliance.filter((c) => c.status === "NON_COMPLIANT").length,
        AT_RISK:        compliance.filter((c) => c.status === "AT_RISK").length,
        COMPLIANT:      compliance.filter((c) => c.status === "COMPLIANT").length,
    };

    const sorted = useMemo(() => {
        const q = query.trim().toLowerCase();
        return [...compliance]
            .filter((c: any) => {
                const matchStatus = filterStatus ? c.status === filterStatus : true;
                if (!q) return matchStatus;
                const name  = `${c.teacher?.firstName ?? ""} ${c.teacher?.lastName ?? ""}`.toLowerCase();
                const email = String(c.teacher?.email ?? "").toLowerCase();
                return matchStatus && (name.includes(q) || email.includes(q));
            })
            .sort(
                (a: any, b: any) =>
                    STATUS_ORDER[a.status as ComplianceStatus] -
                    STATUS_ORDER[b.status as ComplianceStatus],
            );
    }, [compliance, filterStatus, query]);

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            await recomputeAllCompliance();
            toast.success("Compliance recalculated.");
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to recalculate.");
        } finally {
            setRecalculating(false);
        }
    };

    const clearFilters = () => {
        setFilterStatus("");
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
                            <RiskStatusBadge status="compliant" />
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {counts.COMPLIANT}
                            </span>
                            <RiskStatusBadge status="at_risk" />
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {counts.AT_RISK}
                            </span>
                            <RiskStatusBadge status="non_compliant" />
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {counts.NON_COMPLIANT}
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
                        <div className="flex flex-row gap-2">
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
                                    <SelectItem value={ALL_STATUS}>All statuses</SelectItem>
                                    <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
                                    <SelectItem value="AT_RISK">At Risk</SelectItem>
                                    <SelectItem value="COMPLIANT">Compliant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Desktop search */}
                        <div className="hidden md:block w-[360px]">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search teacher, email..."
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
                                    placeholder="Search teacher, email..."
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

                    {filterStatus || query ? (
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
                            <p className="text-sm font-semibold">Compliance list</p>
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
                                        colSpan={5}
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
                                            <div className="flex items-center gap-3 min-w-0">
                                                <UserAvatar
                                                    name={
                                                        c.teacher
                                                            ? `${c.teacher.firstName} ${c.teacher.lastName}`
                                                            : "?"
                                                    }
                                                    src={(c.teacher as any)?.profileImage ?? null}
                                                    className="h-8 w-8 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium leading-snug">
                                                        {c.teacher
                                                            ? `${c.teacher.firstName} ${c.teacher.lastName}`
                                                            : "Unknown"}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground font-mono">
                                                        {c.teacher?.email ?? "—"}
                                                    </p>
                                                    <div className="md:hidden flex items-center gap-2 mt-1.5">
                                                        <span className="text-[11px] font-mono text-muted-foreground">
                                                            {c.total_hours}h / {c.required_hours}h
                                                        </span>
                                                        <span
                                                            className="text-[11px] font-semibold"
                                                            style={{
                                                                color: c.remaining_hours > 0
                                                                    ? "rgb(251,113,133)"
                                                                    : "rgb(52,211,153)",
                                                            }}
                                                        >
                                                            {c.remaining_hours}h remaining
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="md:hidden text-center pr-4 align-middle">
                                            <RiskStatusBadge status={c.status.toLowerCase()} />
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-center font-semibold tabular-nums text-sm">
                                            <span
                                                style={{
                                                    color: c.status === "COMPLIANT"
                                                        ? "rgb(52,211,153)"
                                                        : c.status === "AT_RISK"
                                                          ? "rgb(251,191,36)"
                                                          : "rgb(251,113,133)",
                                                }}
                                            >
                                                {c.total_hours}h
                                            </span>
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-center text-sm text-muted-foreground tabular-nums">
                                            {c.required_hours}h
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-center font-semibold tabular-nums text-sm">
                                            <span
                                                style={{
                                                    color: c.remaining_hours > 0
                                                        ? "rgb(251,113,133)"
                                                        : "rgb(52,211,153)",
                                                }}
                                            >
                                                {c.remaining_hours}h
                                            </span>
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-center">
                                            <RiskStatusBadge status={c.status.toLowerCase()} />
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Policy sheet ── */}
            <CompliancePolicySheet
                open={policyOpen}
                onOpenChange={setPolicyOpen}
                policies={policies}
                schoolYear={schoolYear}
            />
        </div>
    );
}