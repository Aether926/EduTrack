"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Send,
  Search,
  BookOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import type {
  TeacherResponsibility,
  ResponsibilityChangeRequest,
} from "@/features/responsibilities/types/responsibility";
import { submitChangeRequest } from "@/features/responsibilities/actions/responsibility-actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const TYPE_LABEL: Record<string, string> = {
  TEACHING_LOAD: "Teaching Load",
  COORDINATOR: "Coordinator Role",
  OTHER: "Other Duties",
};

function TypeBadge({ type }: { type: string }) {
  const label = TYPE_LABEL[type] ?? type;

  // subtle but consistent theme
  const cls =
    type === "TEACHING_LOAD"
      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
      : type === "COORDINATOR"
        ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
        : "bg-orange-500/10 text-orange-600 border-orange-500/20";

  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  if (s === "ACTIVE") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
        ACTIVE
      </Badge>
    );
  }
  if (s === "ENDED") {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground">
        ENDED
      </Badge>
    );
  }
  return <Badge variant="outline">{s || "UNKNOWN"}</Badge>;
}

function PendingBadge() {
  return (
    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
      Request Pending
    </Badge>
  );
}

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

  // keep title synced if you open for a different responsibility
  // (simple: reset when modal opens)
  const onOpen = (v: boolean) => {
    onOpenChange(v);
    if (v) {
      setTitle(responsibility.title);
      setReason("");
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) return toast.info("Please provide a reason.");

    setSubmitting(true);
    try {
      await submitChangeRequest(responsibility.id, {
        reason,
        requested_changes: { title },
      });

      toast.success("Change request submitted.");
      onOpen(false);
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Change</DialogTitle>
          <DialogDescription>
            Ask HR/Admin to update your responsibility details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/10 p-3">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="text-sm font-medium">{responsibility.title}</div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              New Title
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Reason <span className="text-red-500">*</span>
            </div>
            <Textarea
              rows={3}
              placeholder="Explain why you need this change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailsGrid({ r }: { r: TeacherResponsibility }) {
  const entries = Object.entries(r.details ?? {});
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {entries.map(([key, val]) => (
        <div key={key} className="rounded-md border bg-muted/10 p-3">
          <div className="text-xs text-muted-foreground capitalize">
            {key.replaceAll("_", " ")}
          </div>
          <div className="text-sm font-medium break-words">{String(val)}</div>
        </div>
      ))}

      <div className="rounded-md border bg-muted/10 p-3">
        <div className="text-xs text-muted-foreground">Assigned</div>
        <div className="text-sm font-medium">
          {new Date(r.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export function MyResponsibilitiesClient(props: {
  responsibilities: TeacherResponsibility[];
  changeRequests: ResponsibilityChangeRequest[];
}) {
  const { responsibilities, changeRequests } = props;
  const router = useRouter();

  const [query, setQuery] = useState("");

  const getPendingRequest = (id: string) =>
    changeRequests.find(
      (r) => r.responsibility_id === id && r.status === "PENDING"
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return responsibilities;

    return responsibilities.filter((r) => {
      const type = String(TYPE_LABEL[r.type] ?? r.type).toLowerCase();
      const title = String(r.title ?? "").toLowerCase();
      const details = JSON.stringify(r.details ?? {}).toLowerCase();
      return type.includes(q) || title.includes(q) || details.includes(q);
    });
  }, [responsibilities, query]);

  const active = filtered.filter((r) => r.status === "ACTIVE");
  const ended = filtered.filter((r) => r.status === "ENDED");

  // small UX: default tab based on what exists
  const defaultTab = active.length ? "active" : "ended";

  // local modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<TeacherResponsibility | null>(null);

  const openRequest = (r: TeacherResponsibility) => {
    setSelected(r);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="min-w-0">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Review your assignments and request changes if needed.
            </div>

            <div className="relative w-full md:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, type, details..."
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active" className="gap-2">
              <Clock className="h-4 w-4" />
              Active
              <Badge variant="secondary" className="ml-1">
                {active.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ended" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ended
              <Badge variant="secondary" className="ml-1">
                {ended.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground">
            Tip: you can only request change while a responsibility is ACTIVE.
          </div>
        </div>

        {/* Active */}
        <TabsContent value="active">
          {active.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No active responsibilities.
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border bg-card">
              <Accordion type="multiple" className="divide-y">
                {active.map((r) => {
                  const pending = getPendingRequest(r.id);

                  return (
                    <AccordionItem key={r.id} value={r.id} className="px-2 md:px-3">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="w-full pr-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <TypeBadge type={r.type} />
                            <StatusBadge status={r.status} />
                            {pending ? <PendingBadge /> : null}
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">
                                {r.title}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                Tap to view details
                              </div>
                            </div>

                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="px-2 pb-4 md:px-3 space-y-3">
                          <DetailsGrid r={r} />

                          <div className="flex flex-wrap gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!!pending}
                              onClick={() => openRequest(r)}
                            >
                              Request Change
                            </Button>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.refresh()}
                            >
                              Refresh
                            </Button>
                          </div>

                          {pending ? (
                            <div className="text-xs text-muted-foreground">
                              A change request is already pending for this responsibility.
                            </div>
                          ) : null}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}
        </TabsContent>

        {/* Ended */}
        <TabsContent value="ended">
          {ended.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No ended responsibilities.
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border bg-card">
              <Accordion type="multiple" className="divide-y">
                {ended.map((r) => (
                  <AccordionItem key={r.id} value={r.id} className="px-2 md:px-3">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="w-full pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <TypeBadge type={r.type} />
                          <StatusBadge status={r.status} />
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {r.title}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Ended responsibilities are read-only
                            </div>
                          </div>

                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="px-2 pb-4 md:px-3 space-y-3">
                        <DetailsGrid r={r} />
                        <div className="flex justify-end">
                          <Button variant="secondary" size="sm" onClick={() => router.refresh()}>
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selected ? (
        <RequestChangeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          responsibility={selected}
          onSuccess={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}