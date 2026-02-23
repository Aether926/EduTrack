"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { submitChangeRequest } from "@/features/responsibilities/actions/responsibility-actions";
import type { TeacherResponsibility, ResponsibilityChangeRequest } from "@/features/responsibilities/types/responsibility";

const TYPE_LABEL: Record<string, string> = {
  TEACHING_LOAD: "Teaching Load",
  COORDINATOR: "Coordinator Role",
  OTHER: "Other Duties",
};

const TYPE_STYLE: Record<string, string> = {
  TEACHING_LOAD: "bg-blue-100 text-blue-800",
  COORDINATOR: "bg-purple-100 text-purple-800",
  OTHER: "bg-orange-100 text-orange-800",
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  ENDED: "bg-gray-100 text-gray-600",
};

function RequestChangeModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responsibility: TeacherResponsibility;
  onSuccess: () => void;
}) {
  const { open, onOpenChange, responsibility, onSuccess } = props;
  const [title, setTitle] = useState(responsibility.title);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return toast.info("Please provide a reason.");
    setSubmitting(true);
    try {
      await submitChangeRequest(responsibility.id, {
        reason,
        requested_changes: { title },
      });
      toast.success("Change request submitted.");
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Change</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Current: <span className="font-medium">{responsibility.title}</span>
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              New Title
            </label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Explain why you need this change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2">
            <Send size={14} />
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResponsibilityRow(props: {
  responsibility: TeacherResponsibility;
  pendingRequest: ResponsibilityChangeRequest | undefined;
  onRefresh: () => void;
}) {
  const { responsibility: r, pendingRequest, onRefresh } = props;
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLE[r.type] ?? ""}`}>
              {TYPE_LABEL[r.type] ?? r.type}
            </span>
            <span className="text-sm font-medium">{r.title}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
              {r.status}
            </span>
            {pendingRequest && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                Request Pending
              </span>
            )}
          </div>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border">
            {Object.entries(r.details).map(([key, val]) => (
              <div key={key} className="flex gap-2 text-sm">
                <span className="w-28 text-muted-foreground capitalize">{key}</span>
                <span className="font-medium">{String(val)}</span>
              </div>
            ))}
            <div className="flex gap-2 text-sm">
              <span className="w-28 text-muted-foreground">Assigned</span>
              <span>{new Date(r.created_at).toLocaleDateString()}</span>
            </div>

            {r.status === "ACTIVE" && !pendingRequest && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalOpen(true)}
              >
                Request Change
              </Button>
            )}
          </div>
        )}
      </div>

      <RequestChangeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        responsibility={r}
        onSuccess={onRefresh}
      />
    </>
  );
}

export function MyResponsibilitiesClient(props: {
  responsibilities: TeacherResponsibility[];
  changeRequests: ResponsibilityChangeRequest[];
}) {
  const { responsibilities, changeRequests } = props;
  const [list, setList] = useState(responsibilities);

  const active = list.filter((r) => r.status === "ACTIVE");
  const ended = list.filter((r) => r.status === "ENDED");

  const getPendingRequest = (id: string) =>
    changeRequests.find((r) => r.responsibility_id === id && r.status === "PENDING");

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            My Responsibilities
          </h1>
          <p className="text-sm text-muted-foreground">
            Your current academic assignments and duties.
          </p>
        </header>

        {/* Active */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Active ({active.length})
          </p>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active responsibilities.</p>
          ) : (
            active.map((r) => (
              <ResponsibilityRow
                key={r.id}
                responsibility={r}
                pendingRequest={getPendingRequest(r.id)}
                onRefresh={() => window.location.reload()}
              />
            ))
          )}
        </div>

        {/* Ended */}
        {ended.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Ended ({ended.length})
            </p>
            {ended.map((r) => (
              <ResponsibilityRow
                key={r.id}
                responsibility={r}
                pendingRequest={undefined}
                onRefresh={() => window.location.reload()}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}