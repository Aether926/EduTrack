"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Plus, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Combobox } from "@/components/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AddResponsibilityModal } from "@/features/responsibilities/components/add-responsibility-modal";
import {
  updateResponsibilityStatus,
  approveChangeRequest,
  rejectChangeRequest,
} from "@/features/responsibilities/actions/admin-responsibility-actions";

import type {
  ResponsibilityWithTeacher,
  ResponsibilityChangeRequest,
} from "@/features/responsibilities/types/responsibility";

const TYPE_LABEL: Record<string, string> = {
  TEACHING_LOAD: "Teaching Load",
  COORDINATOR: "Coordinator Role",
  OTHER: "Other Duties",
};

const TYPE_BADGE: Record<string, string> = {
  TEACHING_LOAD: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  COORDINATOR: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  OTHER: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-700 border-green-500/20",
  ENDED: "bg-muted text-muted-foreground border-border",
  PENDING: "bg-yellow-500/10 text-yellow-800 border-yellow-500/20",
  APPROVED: "bg-green-500/10 text-green-700 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-700 border-red-500/20",
};

function TypeChip({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={TYPE_BADGE[type] ?? "bg-muted text-muted-foreground border-border"}>
      {TYPE_LABEL[type] ?? type}
    </Badge>
  );
}

function StatusChip({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={STATUS_BADGE[status] ?? "bg-muted text-muted-foreground border-border"}>
      {status}
    </Badge>
  );
}

function RequestRow(props: {
  request: ResponsibilityChangeRequest & {
    teacher: { firstName: string; lastName: string; email?: string | null } | null;
    responsibility: { title: string } | null;
  };
  onRefresh: () => void;
}) {
  const { request, onRefresh } = props;
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const teacher = request.teacher;
  const fullName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";

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

  return (
    <div className="rounded-lg border bg-muted/10 overflow-hidden">
      <button
        className="w-full text-left p-3 hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium truncate">{fullName}</span>
              <span className="text-xs text-muted-foreground truncate">
                {request.responsibility?.title ?? "—"}
              </span>
              <StatusChip status={request.status} />
            </div>
            {teacher?.email ? (
              <div className="text-xs text-muted-foreground truncate">{teacher.email}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span>{new Date(request.requested_at).toLocaleDateString()}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="border-t p-3 space-y-3">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Requested changes
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(request.requested_changes ?? {}).map(([key, val]) => (
                <div key={key} className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground capitalize">
                    {key.replaceAll("_", " ")}
                  </div>
                  <div className="text-sm font-medium break-words">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border bg-background p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              Reason
            </div>
            <div className="text-sm">{request.reason}</div>
          </div>

          {request.status === "PENDING" ? (
            <div className="space-y-2">
              <Textarea
                rows={3}
                placeholder="Review note (required for rejection)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleReject}
                  disabled={loading}
                >
                  Reject
                </Button>
              </div>
            </div>
          ) : request.review_note ? (
            <div className="text-sm text-muted-foreground italic">
              Note: {request.review_note}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AdminResponsibilitiesClient(props: {
  responsibilities: ResponsibilityWithTeacher[];
  changeRequests: (ResponsibilityChangeRequest & {
    teacher: { firstName: string; lastName: string; email?: string | null } | null;
    responsibility: { title: string } | null;
  })[];
  teachers: { id: string; fullName: string }[];
}) {
  const { responsibilities, changeRequests, teachers } = props;
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const teacherOptions = useMemo(
    () => teachers.map((t) => ({ value: t.id, label: t.fullName })),
    [teachers]
  );

  const typeOptions = useMemo(
    () => [
      { value: "TEACHING_LOAD", label: "Teaching Load" },
      { value: "COORDINATOR", label: "Coordinator Role" },
      { value: "OTHER", label: "Other Duties" },
    ],
    []
  );

  const filtered = useMemo(() => {
    return (responsibilities ?? [])
      .filter((r: any) => {
        const matchTeacher = selectedTeacher ? r.teacher_id === selectedTeacher : true;
        const matchType = selectedType ? r.type === selectedType : true;
        return matchTeacher && matchType;
      })
      .map((r: any) => ({
        ...r,
        teacherName: r.teacher ? `${r.teacher.firstName} ${r.teacher.lastName}` : "Unknown",
        teacherEmail: r.teacher?.email ?? "",
      }));
  }, [responsibilities, selectedTeacher, selectedType]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "teacherName",
        header: ({ column }) => (
          <Button variant="ghost" className="px-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Teacher <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{r.teacherName}</div>
              <div className="truncate text-xs text-muted-foreground">{r.teacherEmail || "—"}</div>

              {/* mobile meta */}
              <div className="md:hidden mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <TypeChip type={r.type} />
                <StatusChip status={r.status} />
                <span className="truncate">{r.title}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <TypeChip type={row.original.type} />,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="text-sm">{row.original.title}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusChip status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          const isActive = r.status === "ACTIVE";
          const busy = updatingId === r.id;

          return (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={async (e) => {
                e.preventDefault();
                setUpdatingId(r.id);
                try {
                  await updateResponsibilityStatus(r.id, isActive ? "ENDED" : "ACTIVE");
                  toast.success(isActive ? "Marked as ended." : "Marked as active.");
                  router.refresh();
                } catch {
                  toast.error("Failed to update status.");
                } finally {
                  setUpdatingId(null);
                }
              }}
            >
              {busy ? "Updating..." : isActive ? "Mark Ended" : "Mark Active"}
            </Button>
          );
        },
      },
    ],
    [router, updatingId]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase().trim();
      if (!q) return true;

      const teacher = String(row.original.teacherName ?? "").toLowerCase();
      const email = String(row.original.teacherEmail ?? "").toLowerCase();
      const type = String(row.original.type ?? "").toLowerCase();
      const title = String(row.original.title ?? "").toLowerCase();
      const status = String(row.original.status ?? "").toLowerCase();

      return teacher.includes(q) || email.includes(q) || type.includes(q) || title.includes(q) || status.includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [globalFilter, selectedTeacher, selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const clearFilters = () => {
    setSelectedTeacher("");
    setSelectedType("");
    setGlobalFilter("");
  };

  const pendingRequests = (changeRequests ?? []).filter((r: any) => r.status === "PENDING");
  const reviewedRequests = (changeRequests ?? []).filter((r: any) => r.status !== "PENDING");

  return (
    <div className="space-y-4">
      {/* responsibilities table card */}
      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Assignments</CardTitle>
            <CardDescription>
              {filteredCount} result{filteredCount === 1 ? "" : "s"} • 10 per page
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="hidden md:block w-[360px]">
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search teacher, title, type..."
              />
            </div>

            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Assign Responsibility
            </Button>

            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>

              <AnimatePresence initial={false}>
                {searchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "240px", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <Input
                      value={globalFilter ?? ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      placeholder="Search..."
                      className="h-9"
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* filters */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              <Combobox label="Teacher" options={teacherOptions} onChangeValue={setSelectedTeacher} />
              <Combobox label="Type" options={typeOptions} onChangeValue={setSelectedType} />
            </div>

            {(selectedTeacher || selectedType || globalFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>

          {/* table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => {
                      const id = header.column.id;

                      const hideOnSmall =
                        id === "type" || id === "title" || id === "status"
                          ? "hidden md:table-cell"
                          : "";

                      const actionsCol = id === "actions" ? "w-[1%]" : "";

                      return (
                        <TableHead key={header.id} className={`${hideOnSmall} ${actionsCol}`}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row, idx) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, delay: Math.min(idx * 0.01, 0.15) }}
                      className="border-b last:border-b-0 hover:bg-accent/40"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const id = cell.column.id;
                        const hideOnSmall =
                          id === "type" || id === "title" || id === "status"
                            ? "hidden md:table-cell"
                            : "";
                        return (
                          <TableCell key={cell.id} className={hideOnSmall}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-xs text-muted-foreground">
              Page {pageIndex + 1} of {pageCount || 1}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddResponsibilityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}