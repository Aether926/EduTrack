"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/combobox";
import { AddResponsibilityModal } from "@/features/responsibilities/components/add-responsibility-modal";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";
import { updateResponsibilityStatus, approveChangeRequest, rejectChangeRequest } from "@/features/responsibilities/actions/admin-responsibility-actions";
import type { ResponsibilityWithTeacher, ResponsibilityChangeRequest } from "@/features/responsibilities/types/responsibility";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

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
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

function RequestRow(props: {
  request: ResponsibilityChangeRequest & { teacher: { firstName: string; lastName: string } | null; responsibility: { title: string } | null };
  onRefresh: () => void;
}) {
  const { request, onRefresh } = props;
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveChangeRequest(request.id, note || undefined);
      toast.success("Request approved.");
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) return toast.info("Please provide a rejection note.");
    setLoading(true);
    try {
      await rejectChangeRequest(request.id, note);
      toast.success("Request rejected.");
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const teacher = request.teacher;
  const fullName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-sm">{fullName}</span>
          <span className="text-xs text-muted-foreground">{request.responsibility?.title ?? "—"}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[request.status]}`}>
            {request.status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{new Date(request.requested_at).toLocaleDateString()}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Requested Changes</p>
            {Object.entries(request.requested_changes).map(([key, val]) => (
              <div key={key} className="flex gap-2 text-sm">
                <span className="w-32 text-muted-foreground capitalize">{key}</span>
                <span className="font-medium">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reason</p>
            <p className="text-sm">{request.reason}</p>
          </div>

          {request.status === "PENDING" && (
            <div className="space-y-2">
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Review note (required for rejection)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} disabled={loading}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleReject} disabled={loading}>
                  Reject
                </Button>
              </div>
            </div>
          )}

          {request.status !== "PENDING" && request.review_note && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Note: </span>{request.review_note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminResponsibilitiesClient(props: {
  responsibilities: ResponsibilityWithTeacher[];
  changeRequests: (ResponsibilityChangeRequest & {
    teacher: { firstName: string; lastName: string } | null;
    responsibility: { title: string } | null;
  })[];
  teachers: { id: string; fullName: string }[];
}) {
  const { responsibilities, changeRequests, teachers } = props;
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.fullName }));
  const typeOptions = [
    { value: "TEACHING_LOAD", label: "Teaching Load" },
    { value: "COORDINATOR", label: "Coordinator Role" },
    { value: "OTHER", label: "Other Duties" },
  ];

  const filtered = responsibilities
    .filter((r) => {
      const matchTeacher = selectedTeacher ? r.teacher_id === selectedTeacher : true;
      const matchType = selectedType ? r.type === selectedType : true;
      return matchTeacher && matchType;
    })
    .map((r) => ({
      ...r,
      teacherName: r.teacher ? `${r.teacher.firstName} ${r.teacher.lastName}` : "Unknown",
    }));

  const columns: ColumnDef<typeof filtered[0]>[] = [
    {
      accessorKey: "teacherName",
      header: "Teacher",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.teacherName}</div>
          <div className="text-xs text-muted-foreground">{row.original.teacher?.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLE[row.original.type] ?? ""}`}>
          {TYPE_LABEL[row.original.type] ?? row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="text-sm">{row.original.title}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[row.original.status]}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const r = row.original;
        const isActive = r.status === "ACTIVE";
        return (
          <Button
            size="sm"
            variant="outline"
            disabled={updatingId === r.id}
            onClick={async () => {
              setUpdatingId(r.id);
              try {
                await updateResponsibilityStatus(r.id, isActive ? "ENDED" : "ACTIVE");
                toast.success(isActive ? "Marked as ended." : "Marked as active.");
                router.refresh();
              } catch (e) {
                toast.error("Failed to update status.");
              } finally {
                setUpdatingId(null);
              }
            }}
          >
            {isActive ? "Mark Ended" : "Mark Active"}
          </Button>
        );
      },
    },
  ];


  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Academic Responsibilities
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage teaching loads, coordinator roles, and other duties.
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Assign Responsibility
          </Button>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Combobox label="Filter by type" options={typeOptions} onChangeValue={setSelectedType} />
          {(selectedTeacher || selectedType) && (
            <Button variant="ghost" size="sm" onClick={() => {  setSelectedType(""); }}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Responsibilities Table */}
        <DataTable
          data={filtered}
          columns={columns}
          filterColumn="teacherName"
          filterPlaceholder="Search by teacher name..."
          showDeleteButton={false}
        />
      </div>

      <AddResponsibilityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => router.refresh()}
      />
    </main>
  );
}