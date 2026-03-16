"use client";

import type { ProofReviewRow } from "../types";
import { useProofReview } from "../hooks/use-proof-review";
import { fmt } from "../lib/utils";

import { useMemo, useState } from "react";
import { Search, X, Clock, GraduationCap, FileSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InitialAvatar from "@/components/avatar-ui-color/avatar-color";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import ProofReviewSheet from "@/features/admin-actions/proof-review/components/proof-review-sheet";

function StatusBadge({ status }: { status: string }) {
    const s = (status ?? "").toUpperCase();
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
    return (
        <Badge className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/15">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {s.charAt(0) + s.slice(1).toLowerCase()}
        </Badge>
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
    const [q, setQ] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return sortedRows;
        return sortedRows.filter(
            (r) =>
                r.training.title.toLowerCase().includes(s) ||
                r.teacher.name.toLowerCase().includes(s) ||
                (r.teacher.email ?? "").toLowerCase().includes(s),
        );
    }, [q, sortedRows]);

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* Header band */}
                <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/10 p-2 shrink-0">
                                <FileSearch className="h-4 w-4 text-fuchsia-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold">
                                    Submissions
                                </p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                    {filtered.length} result
                                    {filtered.length === 1 ? "" : "s"} • tap a
                                    row to review
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search teacher, training..."
                                className="w-[260px] h-8 text-sm"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="md:hidden h-8 w-8 shrink-0"
                            onClick={() => {
                                setSearchOpen((v) => !v);
                                if (searchOpen) setQ("");
                            }}
                            aria-label="Search"
                        >
                            {searchOpen ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <div
                        className="md:hidden"
                        style={{
                            maxHeight: searchOpen ? "48px" : "0px",
                            opacity: searchOpen ? 1 : 0,
                            overflow: "hidden",
                            transition:
                                "max-height 0.25s ease, opacity 0.2s ease",
                        }}
                    >
                        <div className="pt-3">
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search teacher, training..."
                                className="h-8 text-sm w-full"
                                tabIndex={searchOpen ? 0 : -1}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            No submissions found.
                        </div>
                    ) : (
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground pl-5 w-[30%]">
                                        Submission
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell w-[22%]">
                                        Teacher
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell w-[14%]">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell w-[20%]">
                                        Submitted
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center w-[14%]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((r) => {
                                    return (
                                        <TableRow
                                            key={r.attendanceId}
                                            className="cursor-pointer hover:bg-accent/30 transition-colors"
                                            onClick={() => setSelected(r)}
                                        >
                                            <TableCell className="pl-5 align-top pt-3 pb-2 overflow-hidden">
                                                <div className="space-y-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {r.training.title}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                                        {r.training.type} •{" "}
                                                        {r.training.level} •{" "}
                                                        {r.training.totalHours}{" "}
                                                        hrs
                                                    </div>
                                                    <div className="md:hidden space-y-1.5 pt-2">
                                                        <div className="flex items-center gap-2">
                                                            <InitialAvatar
                                                                name={
                                                                    r.teacher
                                                                        .name
                                                                }
                                                                className="h-6 w-6 text-[10px] shrink-0"
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                {r.teacher.name}
                                                            </span>
                                                        </div>
                                                        <StatusBadge
                                                            status={r.status}
                                                        />
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3 shrink-0" />
                                                            {fmt(r.submittedAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell align-top py-3 overflow-hidden">
                                                <div className="flex items-start gap-2.5 min-w-0">
                                                    <InitialAvatar
                                                        name={r.teacher.name}
                                                        className="h-8 w-8 text-xs shrink-0"
                                                    />
                                                    <div className="leading-tight min-w-0">
                                                        <p className="text-sm font-medium break-words">
                                                            {r.teacher.name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground break-all">
                                                            {r.teacher.email ??
                                                                "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell align-middle py-3">
                                                <StatusBadge
                                                    status={r.status}
                                                />
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell align-middle py-3 text-xs text-muted-foreground font-mono whitespace-normal">
                                                {fmt(r.submittedAt)}
                                            </TableCell>
                                            <TableCell
                                                className="align-middle py-3 text-center w-px pl-4"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/25 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/40"
                                                    onClick={() =>
                                                        setSelected(r)
                                                    }
                                                    disabled={
                                                        loadingId ===
                                                        r.attendanceId
                                                    }
                                                >
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <ProofReviewSheet
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
        </>
    );
}
