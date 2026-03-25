"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ArchivedUser } from "../actions/archive-actions";
import {
    restoreUser
} from "@/features/superadmin/actions/superadmin-actions";
import InitialAvatar from "@/components/ui-elements/avatars/avatar-color";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Search,
    Archive,
    RotateCcw,
    Trash2,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fullName(u: ArchivedUser) {
    return `${u.firstName ?? ""} ${u.middleInitial ? u.middleInitial + ". " : ""}${u.lastName ?? ""}`.trim();
}

function fmtDate(dt: string | null) {
    if (!dt) return "—";
    try {
        return new Date(dt).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dt;
    }
}

/** Collapses accidental double-dots (e.g. "C.. IBARRA" → "C. IBARRA"). */
function fixDoubleDots(name: string): string {
    return name.replace(/\.{2,}/g, ".");
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface ArchiveTableProps {
    users: ArchivedUser[];
    isSuperadmin: boolean;
    basePath: string;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ArchiveTable({
    users,
    isSuperadmin,
    basePath,
}: ArchiveTableProps) {
    const router = useRouter();
    const [q, setQ] = useState("");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [restoreConfirm, setRestoreConfirm] = useState<ArchivedUser | null>(
        null,
    );
    const [deleteConfirm, setDeleteConfirm] = useState<ArchivedUser | null>(
        null,
    );

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return users;
        return users.filter(
            (u) =>
                fullName(u).toLowerCase().includes(s) ||
                (u.email ?? "").toLowerCase().includes(s) ||
                (u.employeeId ?? "").toLowerCase().includes(s) ||
                (u.position ?? "").toLowerCase().includes(s),
        );
    }, [q, users]);

    async function handleRestore(u: ArchivedUser) {
        setLoadingId(u.id);
        try {
            const res = await restoreUser(u.id);
            if (!res.ok) {
                toast.error(res.error);
                return;
            }
            toast.success(`${fullName(u)} has been restored.`);
            router.refresh();
        } finally {
            setLoadingId(null);
            setRestoreConfirm(null);
        }
    }

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* Header */}
                <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg border border-slate-500/20 bg-slate-500/10 p-2 shrink-0">
                                <Archive className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Archived Users
                                </p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                    {filtered.length} result
                                    {filtered.length === 1 ? "" : "s"}
                                </p>
                            </div>
                        </div>
                        <div className="relative hidden md:block">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search name, email, ID..."
                                className="pl-8 h-8 text-sm w-[240px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            No archived users found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground pl-5">
                                        User
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">
                                        Position
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">
                                        Reason
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">
                                        Archived
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((u) => {
                                    const name = fullName(u) || "(no name)";
                                    const isLoading = loadingId === u.id;
                                    return (
                                        <TableRow
                                            key={u.id}
                                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() =>
                                                router.push(
                                                    `${basePath}/${u.id}`,
                                                )
                                            }
                                        >
                                            <TableCell className="pl-5">
                                                <div className="flex items-center gap-2.5">
                                                    <InitialAvatar
                                                        name={name}
                                                        src={u.profileImage}
                                                        className="h-8 w-8 shrink-0"
                                                    />
                                                    <div className="leading-tight">
                                                        <p className="text-sm font-medium">
                                                            {name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                                            {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                {u.position || "—"}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                                                    {u.archiveReason || "—"}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                                                {fmtDate(u.archivedAt)}
                                            </TableCell>
                                            <TableCell
                                                className="text-center"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {isSuperadmin && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                                                                onClick={() =>
                                                                    setRestoreConfirm(
                                                                        u,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isLoading
                                                                }
                                                            >
                                                                {isLoading ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                                )}
                                                                Restore
                                                            </Button>
                                                        </>
                                                    )}
                                                    {!isSuperadmin && (
                                                        <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30">
                                                            Archived
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            {/* Restore confirm dialog */}
            <Dialog
                open={!!restoreConfirm}
                onOpenChange={(o) => !o && setRestoreConfirm(null)}
            >
                <DialogContent className="max-w-sm w-[90vw] p-0 gap-0 overflow-hidden">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2">
                                    <RotateCcw className="h-4 w-4 text-emerald-400" />
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    Restore Account
                                </DialogTitle>
                            </div>
                            <p className="text-base font-semibold leading-snug">
                                Restore{" "}
                                {restoreConfirm ? fullName(restoreConfirm) : ""}
                                ?
                            </p>
                            <DialogDescription className="mt-1">
                                Their account will be reactivated and they can
                                log in again.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="px-6 py-4 flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestoreConfirm(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() =>
                                restoreConfirm && handleRestore(restoreConfirm)
                            }
                            disabled={!!loadingId}
                        >
                            {loadingId && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            )}
                            Restore
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog
                open={!!deleteConfirm}
                onOpenChange={(o) => !o && setDeleteConfirm(null)}
            >
                <DialogContent className="max-w-sm w-[90vw] p-0 gap-0 overflow-hidden">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2">
                                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    Delete Permanently
                                </DialogTitle>
                            </div>
                            <p className="text-base font-semibold leading-snug">
                                Delete{" "}
                                {deleteConfirm ? fullName(deleteConfirm) : ""}
                                &apos;s account?
                            </p>
                            <DialogDescription className="mt-1">
                                This will permanently remove all data. This
                                cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="px-6 py-4 rounded-lg mx-6 mb-2 border border-rose-500/30 bg-rose-500/10 text-sm text-rose-400">
                        <p className="font-semibold mb-0.5">⚠ Warning</p>
                        <p>
                            All profile data, documents, and records will be
                            permanently removed.
                        </p>
                    </div>
                    <DialogFooter className="px-6 py-4 flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
