"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Trash2, XCircle, AlertTriangle,
  Loader2, Clock, CheckCircle2, User,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminFinalizeDeleteAccount,
  adminCancelDeletion,
  adminInitiateDeletion,
} from "@/features/settingss/actions/admin-deletion-actions"
import type { getAllDeletionRequests } from "@/features/settingss/actions/admin-deletion-actions";

type DeletionRequest = Awaited<ReturnType<typeof getAllDeletionRequests>>[number];

const ADMIN_REASONS = [
  "Resigned / Left the school",
  "Duplicate account",
  "Inactive account",
  "Violation of policy",
  "Custom reason",
];

function useCountdown(scheduledAt: string | null) {
  const [remaining, setRemaining] = useState("");
  const [expired, setExpired]     = useState(false);

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
    <div className={`flex items-center gap-1.5 text-xs font-medium ${expired ? "text-red-600" : "text-yellow-600"}`}>
      <Clock className="h-3.5 w-3.5" />
      {remaining}
    </div>
  );
}

function RequestRow({ req, onUpdate }: { req: DeletionRequest; onUpdate: () => void }) {
  const [finalizeModal, setFinalizeModal] = useState(false);
  const [cancelModal, setCancelModal]     = useState(false);
  const [loading, setLoading]             = useState(false);
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
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-sm">
                {req.user.firstName} {req.user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{req.user.email}</p>
              {req.user.employeeId && (
                <p className="text-xs text-muted-foreground">{req.user.employeeId}</p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="outline" className={
            req.initiated_by === "ADMIN"
              ? "bg-orange-100 text-orange-800 border-orange-300"
              : "bg-blue-100 text-blue-800 border-blue-300"
          }>
            {req.initiated_by === "ADMIN" ? "Admin" : "Teacher"}
          </Badge>
        </TableCell>
        <TableCell className="max-w-[200px]">
          <p className="text-sm text-muted-foreground truncate" title={req.reason ?? ""}>
            {req.reason ?? "—"}
          </p>
        </TableCell>
        <TableCell>
          <CountdownCell scheduledAt={req.scheduled_at} />
        </TableCell>
        <TableCell className="text-center text-sm text-muted-foreground">
          {new Date(req.created_at).toLocaleDateString("en-PH")}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Button
              size="sm" variant="outline"
              className={`gap-1.5 ${expired
                ? "text-red-700 border-red-400 hover:bg-red-50"
                : "text-muted-foreground opacity-50 cursor-not-allowed"
              }`}
              onClick={() => expired && setFinalizeModal(true)}
              disabled={!expired || loading}
              title={!expired ? "Grace period has not passed yet" : "Finalize deletion"}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
            <Button
              size="sm" variant="outline"
              className="gap-1.5 text-muted-foreground hover:bg-accent"
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
      <Dialog open={finalizeModal} onOpenChange={(o) => { if (!o) setFinalizeModal(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Permanently Delete Account
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-800 dark:text-red-400 space-y-1">
            <p className="font-semibold">⚠ Final Warning</p>
            <p>
              You are about to permanently delete the account of{" "}
              <strong>{req.user.firstName} {req.user.lastName}</strong>.
            </p>
            <p>All their data will be removed and cannot be recovered.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinalizeModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleFinalize} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel modal */}
      <Dialog open={cancelModal} onOpenChange={(o) => { if (!o) setCancelModal(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Deletion Request</DialogTitle>
            <DialogDescription>
              Cancel the deletion request for{" "}
              <strong>{req.user.firstName} {req.user.lastName}</strong>? Their account will remain active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModal(false)}>Keep Request</Button>
            <Button onClick={handleCancel} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
  const [customReason, setCustomReason]     = useState("");
  const [loading, setLoading]               = useState(false);

  const isCustom = selectedReason === "Custom reason";
  const finalReason = isCustom ? customReason : selectedReason;

  const handleSubmit = async () => {
    if (!finalReason.trim()) return toast.error("Please select or provide a reason.");
    setLoading(true);
    try {
      const result = await adminInitiateDeletion(teacherId, finalReason);
      if (!result.ok) return toast.error(result.error);
      toast.success("Deletion initiated. Teacher has been notified.");
      onOpenChange(false);
      setSelectedReason(""); setCustomReason("");
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
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Initiate Account Deletion
          </DialogTitle>
          <DialogDescription>
            Initiating deletion for <strong>{teacherName}</strong>. They will be notified and have a grace period to respond.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            {ADMIN_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedReason(r)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedReason === r
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                {selectedReason === r && <CheckCircle2 className="h-3.5 w-3.5 inline mr-2 text-primary" />}
                {r}
              </button>
            ))}
          </div>
          {isCustom && (
            <Textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter custom reason..."
              className="min-h-[80px]"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading || !finalReason.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
  const [requests, setRequests] = useState(initialRequests);

  const refresh = () => {
    // Trigger server revalidation — parent page will re-fetch on next navigation
    // For immediate UI update, filter out completed ones
  };

  if (!requests.length) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No pending account deletion requests.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead className="text-center">Initiated By</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Grace Period</TableHead>
              <TableHead className="text-center">Requested</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <RequestRow key={req.id} req={req} onUpdate={refresh} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}