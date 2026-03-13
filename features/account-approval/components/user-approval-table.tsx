"use client";

import * as React from "react";
import type { PendingUser } from "../types";
import { fmtDate, fullName } from "../lib/utils";
import UserDetailSheet from "./user-detail-sheet";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InitialAvatar from "@/components/avatar-ui-color/avatar-color";
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
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

import {
    CheckCircle2,
    XCircle,
    Trash2,
    Loader2,
    AlertTriangle,
    ShieldCheck,
    UserX,
} from "lucide-react";
import { useState } from "react";

/* ── Status badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
    const s = (status ?? "").toUpperCase();
    if (s === "PENDING")
        return (
            <Badge className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Pending
            </Badge>
        );
    if (s === "REJECTED")
        return (
            <Badge className="inline-flex items-center gap-1.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Rejected
            </Badge>
        );
    if (s === "APPROVED")
        return (
            <Badge className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Approved
            </Badge>
        );
    return <Badge variant="outline">{status}</Badge>;
}

/* ── Role chip ────────────────────────────────────────────────────────────── */
const roleColors: Record<string, string> = {
    teacher: "bg-teal-500/10 text-teal-400 border-teal-500/40",
    admin: "bg-violet-500/10 text-violet-400 border-violet-500/40",
    hr: "bg-sky-500/10 text-sky-400 border-sky-500/40",
    principal: "bg-orange-500/10 text-orange-400 border-orange-500/40",
};

function RoleChip({ role }: { role?: string }) {
    const key = (role ?? "").toLowerCase();
    const cls =
        roleColors[key] ?? "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {role}
        </span>
    );
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
function EmptyState({ variant }: { variant: "pending" | "rejected" }) {
    return (
        <div className="py-16 text-center text-sm text-muted-foreground">
            {variant === "pending"
                ? "No pending user requests."
                : "No rejected users in archive."}
        </div>
    );
}

/* ── Main table ───────────────────────────────────────────────────────────── */
export default function UserApprovalTable({
    users,
    variant,
    onApprove,
    onReject,
    onDelete,
}: {
    users: PendingUser[];
    variant: "pending" | "rejected";
    onApprove: (id: string) => void | Promise<void>;
    onReject: (id: string) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
}) {
    
    const [loadingId, setLoadingId] = React.useState<string | null>(null);
    const [confirm, setConfirm] = React.useState<
        | null
        | { type: "reject"; user: PendingUser }
        | { type: "delete"; user: PendingUser }
    >(null);
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    async function handleApprove(u: PendingUser) {
        setLoadingId(u.id);
        try {
            await onApprove(u.id);
        } finally {
            setLoadingId(null);
        }
    }

    async function handleConfirm() {
        if (!confirm) return;
        setLoadingId(confirm.user.id);
        try {
            if (confirm.type === "reject") await onReject(confirm.user.id);
            else await onDelete?.(confirm.user.id);
        } finally {
            setLoadingId(null);
            setConfirm(null);
        }
    }

    const isPending = variant === "pending";
    const Icon = isPending ? ShieldCheck : UserX;
    const accentGradient = isPending ? "from-emerald-500/5" : "from-rose-500/5";
    const iconBorder = isPending
        ? "border-emerald-500/20 bg-emerald-500/10"
        : "border-rose-500/20 bg-rose-500/10";
    const iconColor = isPending ? "text-emerald-400" : "text-rose-400";
    const sectionTitle = isPending ? "Pending Requests" : "Rejected Users";
    const sectionSub = isPending
        ? `${users.length} user${users.length === 1 ? "" : "s"} awaiting approval`
        : `${users.length} user${users.length === 1 ? "" : "s"} in archive`;

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* Header band */}
                <div
                    className={`relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background`}
                >
                    <div
                        className={`absolute inset-0 bg-gradient-to-br ${accentGradient} via-transparent to-transparent pointer-events-none`}
                    />
                    <div className="relative flex items-center gap-2.5">
                        <div
                            className={`rounded-lg border p-2 shrink-0 ${iconBorder}`}
                        >
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {sectionTitle}
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                {sectionSub}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto">
                    {users.length === 0 ? (
                        <EmptyState variant={variant} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground pl-5">
                                        User
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">
                                        Email
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                        Role
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">
                                        Requested
                                    </TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users.map((u) => {
                                    const name = fullName(u)
                                        .replace(/\b([A-Z])\.\s*/g, "$1")
                                        .trim();
                                    const isLoading = loadingId === u.id;

                                    return (
                                        <TableRow
                                            key={u.id}
                                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() => {
                                                setSelectedUser(u);
                                                setSheetOpen(true);
                                            }}
                                        >
                                            <TableCell className="pl-5">
                                                <div className="flex items-center gap-2.5">
                                                    <InitialAvatar
                                                        name={name}
                                                        className="h-8 w-8 shrink-0"
                                                    />
                                                    <div className="leading-tight">
                                                        <p className="text-sm font-medium">
                                                            {name ||
                                                                "(no name)"}
                                                        </p>
                                                        {u.contactNumber && (
                                                            <p className="text-[11px] text-muted-foreground font-mono">
                                                                {
                                                                    u.contactNumber
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="hidden md:table-cell">
                                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                    {u.email}
                                                </p>
                                            </TableCell>

                                            <TableCell>
                                                <RoleChip role={u.role} />
                                            </TableCell>

                                            <TableCell>
                                                <StatusBadge
                                                    status={u.status}
                                                />
                                            </TableCell>

                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono text-xs">
                                                {fmtDate(u.createdAt)}
                                            </TableCell>

                                            <TableCell 
                                                className="text-center"
                                                onClick={(e) => e.stopPropagation()}
                                                >
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                                                        onClick={() =>
                                                            handleApprove(u)
                                                        }
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                        )}
                                                        {isPending
                                                            ? "Approve"
                                                            : "Approve anyway"}
                                                    </Button>

                                                    {isPending && (
                                                        <Button
                                                            size="sm"
                                                            className="gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40"
                                                            onClick={() =>
                                                                setConfirm({
                                                                    type: "reject",
                                                                    user: u,
                                                                })
                                                            }
                                                            disabled={isLoading}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            Reject
                                                        </Button>
                                                    )}

                                                    {!isPending && onDelete && (
                                                        <Button
                                                            size="sm"
                                                            className="gap-1.5 bg-rose-900/20 text-rose-700 border border-rose-700/40 hover:bg-rose-900/30 hover:border-rose-600/50"
                                                            onClick={() =>
                                                                setConfirm({
                                                                    type: "delete",
                                                                    user: u,
                                                                })
                                                            }
                                                            disabled={isLoading}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
                                                        </Button>
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

            {/* Reject confirm dialog */}
            <Dialog
                open={confirm?.type === "reject"}
                onOpenChange={(o) => !o && setConfirm(null)}
            >
                <DialogContent className="max-w-sm w-[90vw] p-0 gap-0 overflow-hidden">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-rose-500/5 pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2">
                                    <XCircle className="h-4 w-4 text-rose-400" />
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    Reject Request
                                </DialogTitle>
                            </div>
                            <p className="text-base font-semibold leading-snug">
                                Reject access for{" "}
                                {confirm?.user ? fullName(confirm.user) : ""}?
                            </p>
                            <DialogDescription className="mt-1">
                                They will be moved to the rejected list.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="px-6 py-4 flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirm(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-rose-600 hover:bg-rose-500 text-white"
                            onClick={handleConfirm}
                            disabled={!!loadingId}
                        >
                            {loadingId && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            )}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog
                open={confirm?.type === "delete"}
                onOpenChange={(o) => !o && setConfirm(null)}
            >
                <DialogContent className="max-w-sm w-[90vw] p-0 gap-0 overflow-hidden">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-rose-500/5 pointer-events-none" />
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
                                {confirm?.user ? fullName(confirm.user) : ""}
                                &apos;s request?
                            </p>
                            <DialogDescription className="mt-1">
                                This will permanently remove the user from the
                                database. This cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="px-6 py-4 rounded-lg mx-6 mb-2 border border-rose-500/30 bg-rose-500/10 text-sm text-rose-400">
                        <p className="font-semibold mb-0.5">⚠ Warning</p>
                        <p>
                            The user and all associated profile data will be
                            removed from storage and cannot be recovered.
                        </p>
                    </div>
                    <DialogFooter className="px-6 py-4 flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirm(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-rose-600 hover:bg-rose-500 text-white"
                            onClick={handleConfirm}
                            disabled={!!loadingId}
                        >
                            {loadingId && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            )}
                            Delete permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <UserDetailSheet
                user={selectedUser}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onApprove={onApprove}
                onReject={onReject}
                variant={variant}
            />
        </>
    );
}
