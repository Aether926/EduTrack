"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import {
  ColumnDef, flexRender, getCoreRowModel,
  getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, SortingState, useReactTable,
} from "@tanstack/react-table";

import {
  ArrowUpDown, Search, X, CheckCircle2,
  AlertTriangle, Clock, BadgeDollarSign, Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

import type { TeacherEligibilityRow, EligibilityStatus } from "@/lib/database/salary-eligibility";
import { markSalaryIncreaseGivenAction } from "@/features/salary-eligibility/actions/salary-eligibility-actions";

// ── Status config ──────────────────────────────────────────────────────────────

const statusConfig: Record<EligibilityStatus, {
  label: string; cls: string; icon: React.ReactNode;
}> = {
  ELIGIBLE: {
    label: "Eligible",
    cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  APPROACHING: {
    label: "Approaching",
    cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  ON_TRACK: {
    label: "On Track",
    cls: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    icon: <Clock className="h-3 w-3" />,
  },
};

// ── Cycle progress bar ─────────────────────────────────────────────────────────

function CycleBar({ row }: { row: TeacherEligibilityRow }) {
  const pct = row.status === "ELIGIBLE"
    ? 100
    : Math.min((row.cycleTotalDays / (3 * 365)) * 100, 99);
  const color = row.status === "ELIGIBLE" ? "bg-emerald-500"
    : row.status === "APPROACHING" ? "bg-amber-500" : "bg-sky-500";
  return (
    <div className="space-y-0.5 min-w-[80px]">
      <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
        {row.cycleYears}y {row.cycleMonths}m {row.cycleDays}d
      </div>
    </div>
  );
}

// ── Mark button ────────────────────────────────────────────────────────────────

function MarkButton({
  row,
  onOptimisticUpdate,
}: {
  row: TeacherEligibilityRow;
  onOptimisticUpdate: (userId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  if (row.status !== "ELIGIBLE") return null;

  async function handle() {
    setLoading(true);
    onOptimisticUpdate(row.userId);
    const res = await markSalaryIncreaseGivenAction(row.userId);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`Salary increase marked for ${row.firstName} ${row.lastName}.`);
  }

  return (
    <Button
      size="sm"
      onClick={handle}
      disabled={loading}
      className="gap-1.5 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 whitespace-nowrap"
    >
      {loading
        ? <Loader2 className="h-3 w-3 animate-spin" />
        : <BadgeDollarSign className="h-3 w-3" />}
      Mark Increased
    </Button>
  );
}

// ── Table component ────────────────────────────────────────────────────────────

interface SalaryEligibilityTableProps {
  data: TeacherEligibilityRow[];
  onOptimisticUpdate: (userId: string) => void;
}

export default function SalaryEligibilityTable({
  data,
  onOptimisticUpdate,
}: SalaryEligibilityTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<EligibilityStatus | "ALL">("ALL");
  const [searchOpen, setSearchOpen] = useState(false);

  const columns = useMemo<ColumnDef<TeacherEligibilityRow>[]>(
    () => [
      {
        accessorKey: "employeeId",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-2">
            Employee ID <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs text-muted-foreground">
            {row.getValue("employeeId") === "—" ? "—" : row.getValue("employeeId")}
          </div>
        ),
      },
      {
        id: "fullName",
        accessorFn: (r) => `${r.lastName}, ${r.firstName}${r.middleInitial ? ` ${r.middleInitial}.` : ""}`,
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-2">
            Name <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="min-w-0">
              <div className="font-medium truncate">
                {r.lastName}, {r.firstName}{r.middleInitial ? ` ${r.middleInitial}.` : ""}
              </div>
              <div className="md:hidden mt-1 space-y-0.5">
                <div className="text-xs text-muted-foreground truncate">{r.position}</div>
                <CycleBar row={r} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => (
          <div className="max-w-[180px] truncate text-sm text-muted-foreground">
            {row.getValue("position")}
          </div>
        ),
      },
      {
        id: "cycleProgress",
        accessorFn: (r) => r.cycleTotalDays,
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-2">
            Cycle Progress <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <CycleBar row={row.original} />,
      },
      {
        id: "nextIncrease",
        accessorFn: (r) => r.nextEligibleDate,
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-2">
            Next Increase <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return r.status === "ELIGIBLE" ? (
            <span className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />Now
            </span>
          ) : (
            <div>
              <div className="font-mono text-xs">{r.nextEligibleDate}</div>
              <div className="text-[10px] text-muted-foreground">
                in {Math.floor(r.daysUntilEligible / 365)}y {Math.floor((r.daysUntilEligible % 365) / 30)}m
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        accessorFn: (r) => r.status,
        header: "Status",
        cell: ({ row }) => {
          const sc = statusConfig[row.original.status];
          return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${sc.cls}`}>
              {sc.icon}{sc.label}
            </span>
          );
        },
        filterFn: (row, _id, filterValue) => {
          if (!filterValue || filterValue === "ALL") return true;
          return row.original.status === filterValue;
        },
      },
      {
        id: "action",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <MarkButton row={row.original} onOptimisticUpdate={onOptimisticUpdate} />
          </div>
        ),
      },
    ],
    [onOptimisticUpdate]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const v = String(filterValue ?? "").toLowerCase().trim();
      if (!v) return true;
      const r = row.original;
      const full = `${r.lastName} ${r.firstName}`.toLowerCase();
      const emp = String(r.employeeId ?? "").toLowerCase();
      const pos = String(r.position ?? "").toLowerCase();
      return full.includes(v) || emp.includes(v) || pos.includes(v);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
      sorting: [{ id: "status", desc: false }],
    },
  });

  // apply status filter
  React.useEffect(() => {
    if (statusFilter === "ALL") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(statusFilter);
    }
    table.setPageIndex(0);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    table.setPageIndex(0);
  }, [globalFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">All Teachers</CardTitle>
          <CardDescription>
            {filteredCount} result{filteredCount === 1 ? "" : "s"} · 10 per page
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as EligibilityStatus | "ALL")}
          >
            <SelectTrigger className="h-9 w-[145px] text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="ELIGIBLE">Eligible</SelectItem>
              <SelectItem value="APPROACHING">Approaching</SelectItem>
              <SelectItem value="ON_TRACK">On Track</SelectItem>
            </SelectContent>
          </Select>

          {/* Desktop search */}
          <div className="hidden md:block w-[280px]">
            <Input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search name, employee ID, position..."
              className="h-9"
            />
          </div>

          {/* Mobile search */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
            <AnimatePresence initial={false}>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "min(240px, 55vw)", opacity: 1 }}
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
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => {
                    const colId = header.column.id;
                    const hideOnSmall = colId === "position" || colId === "cycleProgress" || colId === "nextIncrease"
                      ? "hidden md:table-cell" : "";
                    return (
                      <TableHead key={header.id} className={hideOnSmall}>
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
                      const colId = cell.column.id;
                      const hideOnSmall = colId === "position" || colId === "cycleProgress" || colId === "nextIncrease"
                        ? "hidden md:table-cell" : "";
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
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
  );
}