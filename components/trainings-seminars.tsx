"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
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
import { ArrowUpDown, MoreHorizontal, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import PdViewModal from "@/components/pd-view-modal";

export type TrainingSeminarRow = {
  id: string;
  trainingId: string;
  type: string;
  title: string;
  level: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  approvedHours: string | null;
  sponsor: string;
  status: string;
};

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();

  if (s === "APPROVED") return <Badge className="bg-white text-black border border-white">APPROVED</Badge>;
  if (s === "REJECTED") return <Badge className="bg-red-100 text-red-800 border border-red-200">REJECTED</Badge>;
  if (s === "ENROLLED") return <Badge className="bg-blue-100 text-blue-800 border border-blue-200">ENROLLED</Badge>;
  if (s === "PENDING") return <Badge className="bg-yellow-100 text-yellow-900 border border-yellow-200">PENDING</Badge>;

  return <Badge variant="outline">{status}</Badge>;
}

export default function TrainingsSeminars({ data }: { data: TrainingSeminarRow[] }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns = useMemo<ColumnDef<TrainingSeminarRow>[]>(
    () => [

      {
        accessorKey: "type",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-sm font-medium">{row.getValue("type") as string}</div>,
      },

      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const canUpload = r.status === "ENROLLED" || r.status === "REJECTED";

          return (
            <div className="min-w-0">
              <div className="truncate font-medium">{r.title}</div>

              {/* mobile/tablet compact meta */}
              <div className="lg:hidden mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{r.level}</span>
                <span>•</span>
                <span className="font-mono">
                  {r.startDate}{r.endDate ? ` → ${r.endDate}` : ""}
                </span>
                <span>•</span>
                <span className="font-mono">
                  {r.status === "APPROVED" && r.approvedHours
                    ? `${r.approvedHours}h approved`
                    : `${r.totalHours}h`}
                </span>
                <span>•</span>
                <span className={canUpload ? "text-foreground" : ""}>
                  {canUpload ? "Upload available" : "Upload locked"}
                </span>
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: "level",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Level <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center w-full text-sm text-muted-foreground">{row.getValue("level") as string}</div>,
      },

      {
        accessorKey: "startDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Start <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center w-full text-sm text-muted-foreground">{row.getValue("startDate") as string}</div>,
      },

      {
        accessorKey: "endDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            End <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center w-full text-sm text-muted-foreground">{row.getValue("endDate") as string}</div>,
      },

      {
        accessorKey: "totalHours",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Completed Hours <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const approvedHours = row.original.approvedHours;
          const totalHours = row.getValue("totalHours") as string;
          const isApproved = status === "APPROVED";

          return (
            <div className="text-center w-full">
              {isApproved && approvedHours ? (
                <span className="text-green-600 font-medium">{approvedHours}h</span>
              ) : (
                <span className="text-muted-foreground">{totalHours}h</span>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "sponsor",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sponsor <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate text-sm text-muted-foreground">
            {row.getValue("sponsor") as string}
          </div>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <StatusBadge status={row.getValue("status") as string} />
          </div>
        ),
      },

      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const canUpload = row.original.status === "ENROLLED" || row.original.status === "REJECTED";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setSelectedTrainingId(row.original.trainingId);
                    setDetailsOpen(true);
                  }}
                >
                  View details
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {canUpload ? (
                  <DropdownMenuItem asChild>
                    <a href={`/professional-dev/${row.original.id}/upload-proof`}>
                      Upload proof
                    </a>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled>Upload proof</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase().trim();
      if (!q) return true;

      const title = String(row.original.title ?? "").toLowerCase();
      const type = String(row.original.type ?? "").toLowerCase();
      const level = String(row.original.level ?? "").toLowerCase();
      const sponsor = String(row.original.sponsor ?? "").toLowerCase();
      const status = String(row.original.status ?? "").toLowerCase();
      const start = String(row.original.startDate ?? "").toLowerCase();
      const end = String(row.original.endDate ?? "").toLowerCase();

      return (
        title.includes(q) ||
        type.includes(q) ||
        level.includes(q) ||
        sponsor.includes(q) ||
        status.includes(q) ||
        start.includes(q) ||
        end.includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [globalFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <>
      <Card className="min-w-0">
        <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Trainings & Seminars</CardTitle>
            <CardDescription>
              {filteredCount} result{filteredCount === 1 ? "" : "s"} • 10 per page
            </CardDescription>
          </div>

          {/* Desktop search */}
          <div className="hidden md:block w-[320px]">
            <Input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search title, sponsor, status..."
            />
          </div>

          {/* Mobile search icon -> expand */}
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
        </CardHeader>

        <CardContent className="pt-0">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => {
                      const colId = header.column.id;

                      // hide some columns on smaller screens (shown under title)
                      const hideOnSmall =
                        colId === "level" ||
                        colId === "startDate" ||
                        colId === "endDate" ||
                        colId === "totalHours" ||
                        colId === "sponsor" ||
                        colId === "status"
                          ? "hidden lg:table-cell"
                          : "";

                      const narrowSelect = colId === "select" ? "w-[44px]" : "";
                      const narrowActions = colId === "actions" ? "w-[1%]" : "";

                      return (
                        <TableHead key={header.id} className={`${hideOnSmall} ${narrowSelect} ${narrowActions}`}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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

                        const hideOnSmall =
                          colId === "level" ||
                          colId === "startDate" ||
                          colId === "endDate" ||
                          colId === "totalHours" ||
                          colId === "sponsor" ||
                          colId === "status"
                            ? "hidden lg:table-cell"
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

          {/* Pagination */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              Page {pageIndex + 1} of {pageCount || 1}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PdViewModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        trainingId={selectedTrainingId}
      />
    </>
  );
}