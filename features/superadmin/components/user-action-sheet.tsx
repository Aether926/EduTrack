"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import InitialAvatar from "@/components/ui-elements/avatars/avatar-color";
import {
    CheckCircle2,
    XCircle,
    ShieldX,
    ShieldCheck,
    Trash2,
    Loader2,
    Mail,
    Phone,
    Briefcase,
    Hash,
    AlertTriangle,
    ArrowUpCircle,
} from "lucide-react";
import type { SuperadminUser } from "../types";
import SuspendReasonDialog from "./suspend-reason-dialog";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fullName(u: SuperadminUser) {
    return `${u.firstName ?? ""} ${u.middleInitial ? u.middleInitial + ". " : ""}${u.lastName ?? ""}`.trim();
}

function fmtDate(dt: string) {
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

function formatMs(ms: number) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return "less than an hour";
}

// ── Detail row ─────────────────────────────────────────────────────────────────

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
            <div className="rounded-md border border-border/60 bg-muted/30 p-1.5 shrink-0 mt-0.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                </p>
                <p className="text-sm text-foreground mt-0.5 break-words">
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

function SectionLabel({ label }: { label: string }) {
    return (
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2 pb-1">
            {label}
        </p>
    );
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const s = status.toUpperCase();
    const styles: Record<string, string> = {
        APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        SUSPENDED: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    };
    return (
        <Badge
            className={
                styles[s] ??
                "bg-slate-500/15 text-slate-400 border-slate-500/30"
            }
        >
            {status}
        </Badge>
    );
}

// ── Role badge ─────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        TEACHER: "bg-teal-500/10 text-teal-400 border-teal-500/30",
        ADMIN: "bg-violet-500/10 text-violet-400 border-violet-500/30",
        SUPERADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    };
    return (
        <Badge
            variant="outline"
            className={`text-[11px] ${styles[role] ?? ""}`}
        >
            {role}
        </Badge>
    );
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface UserActionSheetProps {
    user: SuperadminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string) => Promise<void>;
    onSuspend: (id: string, reason: string) => Promise<void>;
    onUnsuspend: (id: string) => Promise<void>;
    onRoleChange: (
        id: string,
        role: "TEACHER" | "ADMIN" | "SUPERADMIN",
    ) => Promise<void>;
    promotionQuota: {
        teacherPromotionsLeft: number;
        superadminCooldownRemaining: number | null;
        superadminCount: number;
    };
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function UserActionSheet({
    user,
    open,
    onOpenChange,
    onApprove,
    onReject,
    onSuspend,
    onUnsuspend,
    onRoleChange,
    promotionQuota,
}: UserActionSheetProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [rejectConfirm, setRejectConfirm] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>("");

    if (!user) return null;

    const name = fullName(user) || "(no name)";
    const isSuperadmin = user.role === "SUPERADMIN";

    async function handle(key: string, fn: () => Promise<void>) {
        setLoading(key);
        try {
            await fn();
            onOpenChange(false);
        } finally {
            setLoading(null);
        }
    }

    // Role change options based on current role
    const roleOptions: {
        value: string;
        label: string;
        disabled: boolean;
        reason?: string;
    }[] = [
        {
            value: "TEACHER",
            label: "Teacher",
            disabled: user.role === "TEACHER" || isSuperadmin,
        },
        {
            value: "ADMIN",
            label: "Admin",
            disabled:
                user.role === "ADMIN" ||
                isSuperadmin ||
                (user.role === "TEACHER" &&
                    promotionQuota.teacherPromotionsLeft === 0),
            reason:
                user.role === "TEACHER" &&
                promotionQuota.teacherPromotionsLeft === 0
                    ? `No promotions left this window`
                    : undefined,
        },
        {
            value: "SUPERADMIN",
            label: "Superadmin",
            disabled:
                user.role !== "ADMIN" ||
                promotionQuota.superadminCount >= 3 ||
                promotionQuota.superadminCooldownRemaining !== null,
            reason:
                promotionQuota.superadminCooldownRemaining !== null
                    ? `Cooldown: ${formatMs(promotionQuota.superadminCooldownRemaining)}`
                    : promotionQuota.superadminCount >= 3
                      ? "Max 3 superadmins reached"
                      : undefined,
        },
    ];

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col gap-0 p-0">
                    {/* Header */}
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                        <SheetHeader className="relative">
                            <div className="flex items-center gap-3 mb-3">
                                <InitialAvatar
                                    name={name}
                                    src={user.profileImage}
                                    className="h-10 w-10"
                                />
                                <div className="min-w-0">
                                    <SheetTitle className="text-base leading-tight">
                                        {name}
                                    </SheetTitle>
                                    <SheetDescription className="text-[12px] mt-0.5 truncate">
                                        {user.email}
                                    </SheetDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge status={user.status} />
                                <RoleBadge role={user.role} />
                                <span className="text-[11px] text-muted-foreground ml-auto">
                                    Registered {fmtDate(user.createdAt)}
                                </span>
                            </div>
                        </SheetHeader>
                    </div>

                    {/* Body */}
                    <div className="flex-1 px-6 py-4 overflow-y-auto space-y-1">
                        {/* Suspension reason */}
                        {user.status === "SUSPENDED" &&
                            user.suspensionReason && (
                                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 mb-2">
                                    <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mb-1">
                                        Suspension Reason
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {user.suspensionReason}
                                    </p>
                                </div>
                            )}

                        <SectionLabel label="Personal Information" />
                        <DetailRow
                            icon={Mail}
                            label="Email"
                            value={user.email}
                        />
                        <DetailRow
                            icon={Phone}
                            label="Contact Number"
                            value={user.contactNumber}
                        />

                        <SectionLabel label="Employment Information" />
                        <DetailRow
                            icon={Hash}
                            label="Employee ID"
                            value={user.employeeId}
                        />
                        <DetailRow
                            icon={Briefcase}
                            label="Position"
                            value={user.position}
                        />

                        {/* Role change — only for non-superadmin users */}
                        {!isSuperadmin && user.status === "APPROVED" && (
                            <>
                                <SectionLabel label="Change Role" />
                                <div className="space-y-2">
                                    <Select
                                        value={selectedRole}
                                        onValueChange={setSelectedRole}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={`Current: ${user.role}`}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleOptions.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    disabled={opt.disabled}
                                                >
                                                    <div className="flex items-center justify-between gap-4 w-full">
                                                        <span>{opt.label}</span>
                                                        {opt.reason && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {opt.reason}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {selectedRole &&
                                        selectedRole !== user.role && (
                                            <Button
                                                size="sm"
                                                className="w-full gap-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/25 hover:bg-violet-500/20"
                                                onClick={() =>
                                                    handle("role", () =>
                                                        onRoleChange(
                                                            user.id,
                                                            selectedRole as
                                                                | "TEACHER"
                                                                | "ADMIN"
                                                                | "SUPERADMIN",
                                                        ),
                                                    )
                                                }
                                                disabled={!!loading}
                                            >
                                                {loading === "role" ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <ArrowUpCircle className="h-3.5 w-3.5" />
                                                )}
                                                Change to {selectedRole}
                                            </Button>
                                        )}

                                    {/* Quota info */}
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                        <span>
                                            Teacher→Admin promotions left:{" "}
                                            <span
                                                className={
                                                    promotionQuota.teacherPromotionsLeft ===
                                                    0
                                                        ? "text-rose-400"
                                                        : "text-emerald-400"
                                                }
                                            >
                                                {
                                                    promotionQuota.teacherPromotionsLeft
                                                }
                                                /3
                                            </span>
                                        </span>
                                        <span>
                                            Superadmins:{" "}
                                            <span
                                                className={
                                                    promotionQuota.superadminCount >=
                                                    3
                                                        ? "text-rose-400"
                                                        : "text-foreground"
                                                }
                                            >
                                                {promotionQuota.superadminCount}
                                                /3
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer actions */}
                    {!isSuperadmin && (
                        <div className="px-6 py-4 border-t border-border/60 space-y-2 shrink-0">
                            {/* PENDING */}
                            {user.status === "PENDING" && (
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                                        onClick={() =>
                                            handle("approve", () =>
                                                onApprove(user.id),
                                            )
                                        }
                                        disabled={!!loading}
                                    >
                                        {loading === "approve" ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        Approve
                                    </Button>
                                    <Button
                                        className="flex-1 gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20"
                                        onClick={() => setRejectConfirm(true)}
                                        disabled={!!loading}
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Reject
                                    </Button>
                                </div>
                            )}

                            {/* APPROVED */}
                            {user.status === "APPROVED" && (
                                <Button
                                    className="w-full gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20"
                                    onClick={() => setSuspendOpen(true)}
                                    disabled={!!loading}
                                >
                                    <ShieldX className="h-3.5 w-3.5" />
                                    Suspend
                                </Button>
                            )}

                            {/* SUSPENDED */}
                            {user.status === "SUSPENDED" && (
                                <Button
                                    className="w-full gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                                    onClick={() =>
                                        handle("unsuspend", () =>
                                            onUnsuspend(user.id),
                                        )
                                    }
                                    disabled={!!loading}
                                >
                                    {loading === "unsuspend" ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                    )}
                                    Unsuspend
                                </Button>
                            )}

                            {/* REJECTED */}
                            {user.status === "REJECTED" && (
                                <Button
                                    className="w-full gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                                    onClick={() =>
                                        handle("approve", () =>
                                            onApprove(user.id),
                                        )
                                    }
                                    disabled={!!loading}
                                >
                                    {loading === "approve" ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    )}
                                    Approve anyway
                                </Button>
                            )}

                            {/* Delete — always available except for superadmin */}
                            <Button
                                className="w-full gap-1.5 bg-rose-900/20 text-rose-700 border border-rose-700/40 hover:bg-rose-900/30"
                                onClick={() => setDeleteConfirm(true)}
                                disabled={!!loading}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete permanently
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Suspend reason dialog */}
            <SuspendReasonDialog
                user={user}
                open={suspendOpen}
                onOpenChange={setSuspendOpen}
                onConfirm={async (id, reason) => {
                    await onSuspend(id, reason);
                    onOpenChange(false);
                }}
            />

            {/* Reject confirm dialog */}
            <Dialog
                open={rejectConfirm}
                onOpenChange={(o) => !o && setRejectConfirm(false)}
            >
                <DialogContent className="max-w-sm w-[90vw] p-0 gap-0 overflow-hidden">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
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
                                Reject access for {name}?
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
                            onClick={() => setRejectConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-rose-600 hover:bg-rose-500 text-white"
                            onClick={() => {
                                setRejectConfirm(false);
                                handle("reject", () => onReject(user.id));
                            }}
                            disabled={!!loading}
                        >
                            {loading === "reject" && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            )}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog
                open={deleteConfirm}
                onOpenChange={(o) => !o && setDeleteConfirm(false)}
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
                                Delete {name}&apos;s account?
                            </p>
                            <DialogDescription className="mt-1">
                                This will permanently remove the user and all
                                associated data. This cannot be undone.
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
                            onClick={() => setDeleteConfirm(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
