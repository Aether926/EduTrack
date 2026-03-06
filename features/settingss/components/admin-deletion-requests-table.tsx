"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Trash2,
    XCircle,
    AlertTriangle,
    Loader2,
    Clock,
    CheckCircle2,
    User,
} from "lucide-react";
import { toast } from "sonner";
import {
    adminFinalizeDeleteAccount,
    adminCancelDeletion,
    adminInitiateDeletion,
} from "@/features/settingss/actions/admin-deletion-actions";
import type { getAllDeletionRequests } from "@/features/settingss/actions/admin-deletion-actions";

type DeletionRequest = Awaited<
    ReturnType<typeof getAllDeletionRequests>
>[number];

const ADMIN_REASONS = [
    "Resigned / Left the school",
    "Duplicate account",
    "Inactive account",
    "Violation of policy",
    "Custom reason",
];

function useCountdown(scheduledAt: string | null) {
    const [remaining, setRemaining] = useState("");
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        if (!scheduledAt) return;
        const update = () => {
            const diff = new Date(scheduledAt).getTime() - Date.now();
            if (diff <= 0) {
                setExpired(true);
                setRemaining("Grace period expired");
                return;
            }
            setExpired(false);
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${h}h ${m}m ${s}s`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [scheduledAt]);

    return { remaining, expired };
}

function CountdownCell({ scheduledAt }: { scheduledAt: string | null }) {
    const { remaining, expired } = useCountdown(scheduledAt);
    return (
        <div
            className={`flex items-center gap-1.5 text-xs font-medium ${expired ? "text-rose-400" : "text-amber-400"}`}
        >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {remaining}
        </div>
    );
}

function RequestRow({
    req,
    onUpdate,
}: {
    req: DeletionRequest;
    onUpdate: () => void;
}) {
    const [finalizeModal, setFinalizeModal] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const { expired } = useCountdown(req.scheduled_at);

    const handleFinalize = async () => {
        setLoading(true);
        try {
            const result = await adminFinalizeDeleteAccount(req.id);
            if (!result.ok) return toast.error(result.error);
            toast.success("Account permanently deleted.");
            setFinalizeModal(false);
            onUpdate();
        } catch {
            toast.error("Failed to delete account.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        try {
            const result = await adminCancelDeletion(req.id);
            if (!result.ok) return toast.error(result.error);
            toast.success("Deletion request cancelled.");
            setCancelModal(false);
            onUpdate();
        } catch {
            toast.error("Failed to cancel request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <TableRow className="hover:bg-muted/30">
                <TableCell className="pl-5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-muted/50 border border-border/60 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-sm leading-tight">
                                {req.user.firstName} {req.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {req.user.email}
                            </p>
                            {req.user.employeeId && (
                                <p className="text-xs text-muted-foreground font-mono">
                                    {req.user.employeeId}
                                </p>
                            )}
                        </div>
                    </div>
                </TableCell>

                <TableCell>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${
                            req.initiated_by === "ADMIN"
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                    >
                        {req.initiated_by === "ADMIN" ? "Admin" : "Teacher"}
                    </span>
                </TableCell>

                <TableCell className="max-w-[180px]">
                    <p
                        className="text-sm text-muted-foreground truncate"
                        title={req.reason ?? ""}
                    >
                        {req.reason ?? "—"}
                    </p>
                </TableCell>

                <TableCell>
                    <CountdownCell scheduledAt={req.scheduled_at} />
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString("en-PH")}
                </TableCell>

                <TableCell>
                    <div className="flex items-center gap-1.5">
                        <Button
                            size="sm"
                            className={`gap-1.5 border text-xs ${
                                expired
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40"
                                    : "bg-muted/30 text-muted-foreground border-border/40 opacity-50 cursor-not-allowed"
                            }`}
                            onClick={() => expired && setFinalizeModal(true)}
                            disabled={!expired || loading}
                            title={
                                !expired
                                    ? "Grace period has not passed yet"
                                    : "Finalize deletion"
                            }
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </Button>
                        <Button
                            size="sm"
                            className="gap-1.5 border text-xs bg-muted/10 text-muted-foreground border-border/40 hover:bg-muted/20 hover:border-border/60"
                            onClick={() => setCancelModal(true)}
                            disabled={loading}
                        >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            {/* Finalize delete modal */}
            <Dialog
                open={finalizeModal}
                onOpenChange={(o) => {
                    if (!o) setFinalizeModal(false);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-400">
                            <AlertTriangle className="h-5 w-5" />
                            Permanently Delete Account
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400 space-y-1">
                        <p className="font-semibold">⚠ Final Warning</p>
                        <p>
                            You are about to permanently delete the account of{" "}
                            <strong>
                                {req.user.firstName} {req.user.lastName}
                            </strong>
                            .
                        </p>
                        <p className="text-rose-400/70">
                            All their data will be removed and cannot be
                            recovered.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setFinalizeModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40"
                            onClick={handleFinalize}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Yes, Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel modal */}
            <Dialog
                open={cancelModal}
                onOpenChange={(o) => {
                    if (!o) setCancelModal(false);
                }}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Cancel Deletion Request</DialogTitle>
                        <DialogDescription>
                            Cancel the deletion request for{" "}
                            <strong>
                                {req.user.firstName} {req.user.lastName}
                            </strong>
                            ? Their account will remain active.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelModal(false)}
                        >
                            Keep Request
                        </Button>
                        <Button onClick={handleCancel} disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Yes, Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ── Initiate deletion modal ───────────────────────────────────────────────────
export function InitiateDeletionModal({
    teacherId,
    teacherName,
    open,
    onOpenChange,
    onSuccess,
}: {
    teacherId: string;
    teacherName: string;
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onSuccess: () => void;
}) {
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [loading, setLoading] = useState(false);

    const isCustom = selectedReason === "Custom reason";
    const finalReason = isCustom ? customReason : selectedReason;

    const handleSubmit = async () => {
        if (!finalReason.trim())
            return toast.error("Please select or provide a reason.");
        setLoading(true);
        try {
            const result = await adminInitiateDeletion(teacherId, finalReason);
            if (!result.ok) return toast.error(result.error);
            toast.success("Deletion initiated. Teacher has been notified.");
            onOpenChange(false);
            setSelectedReason("");
            setCustomReason("");
            onSuccess();
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-rose-400">
                        <AlertTriangle className="h-5 w-5" />
                        Initiate Account Deletion
                    </DialogTitle>
                    <DialogDescription>
                        Initiating deletion for <strong>{teacherName}</strong>.
                        They will be notified and have a grace period to
                        respond.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    {ADMIN_REASONS.map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setSelectedReason(r)}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                                selectedReason === r
                                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                                    : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                            }`}
                        >
                            {selectedReason === r && (
                                <CheckCircle2 className="h-3.5 w-3.5 inline mr-2 text-violet-400" />
                            )}
                            {r}
                        </button>
                    ))}
                    {isCustom && (
                        <Textarea
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="Enter custom reason..."
                            className="min-h-[80px] mt-2"
                        />
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40"
                        onClick={handleSubmit}
                        disabled={loading || !finalReason.trim()}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Initiate Deletion
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main table ────────────────────────────────────────────────────────────────
export function AdminDeletionRequestsTable({
    requests: initialRequests,
}: {
    requests: DeletionRequest[];
}) {
    const [requests] = useState(initialRequests);

    const refresh = () => {};

    if (!requests.length) {
        return (
            <div className="py-16 text-center text-sm text-muted-foreground">
                No pending account deletion requests.
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="pl-5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                Teacher
                            </TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                Initiated By
                            </TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                Reason
                            </TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                Grace Period
                            </TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                Requested
                            </TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <RequestRow
                                key={req.id}
                                req={req}
                                onUpdate={refresh}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
