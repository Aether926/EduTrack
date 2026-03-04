"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    getMyDeletionRequest,
    cancelDeletionRequest,
} from "@/features/settingss/actions/settings-actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

function useCountdown(scheduledAt: string | null) {
    const [remaining, setRemaining] = useState("");
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        if (!scheduledAt) return;
        const update = () => {
            const diff = new Date(scheduledAt).getTime() - Date.now();
            if (diff <= 0) {
                setExpired(true);
                setRemaining("Grace period expired — pending final review");
                return;
            }
            setExpired(false);
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${h}h ${m}m ${s}s remaining`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [scheduledAt]);

    return { remaining, expired };
}

export function DeletionWarningBanner() {
    const [request, setRequest] = useState<{
        id: string;
        initiated_by: string;
        scheduled_at: string | null;
        admin_note: string | null;
    } | null>(null);
    const [cancelModal, setCancelModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const { remaining, expired } = useCountdown(request?.scheduled_at ?? null);

    useEffect(() => {
        getMyDeletionRequest().then((r) => {
            if (r.ok && r.data) setRequest(r.data);
        });
    }, []);

    const handleCancel = async () => {
        if (!request) return;
        setLoading(true);
        try {
            const result = await cancelDeletionRequest(request.id);
            if (!result.ok) return toast.error(result.error);
            toast.success("Deletion request cancelled. Your account is safe.");
            setRequest(null);
            setCancelModal(false);
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (!request) return null;

    const isAdminInitiated = request.initiated_by === "ADMIN";

    return (
        <>
            <div
                className={`w-full px-4 py-2.5 flex flex-col sm:flex-row items-center gap-3 text-sm
        ${
            expired
                ? "bg-red-600 text-white"
                : "bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
        }`}
            >
                <div className="flex flex-row gap-3 items-center">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <div>
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold mr-1.5">
                                {isAdminInitiated
                                    ? "Your account has been scheduled for deletion by an administrator."
                                    : "Your account deletion request is pending admin review."}
                            </span>
                            {request.admin_note && (
                                <span className="text-xs opacity-80 mr-1.5">
                                    Reason: {request.admin_note}.
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs font-medium">
                                <Clock className="h-3 w-3" />
                                {remaining}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Only show cancel if teacher initiated */}
                {!isAdminInitiated && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shrink-0 text-yellow-700 border-yellow-400 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-700 dark:hover:bg-yellow-900/20"
                        onClick={() => setCancelModal(true)}
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel Request
                    </Button>
                )}

                {/* Admin initiated — no cancel, just contact info */}
                {isAdminInitiated && (
                    <span className="text-xs shrink-0 opacity-75">
                        Contact your administrator to cancel.
                    </span>
                )}
            </div>

            {/* Cancel confirmation modal */}
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
                            Are you sure? Your account deletion request will be
                            cancelled and your account will remain active.
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
                            Yes, Cancel Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
