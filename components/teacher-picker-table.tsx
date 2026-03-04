"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import type { TeacherTableRow } from "@/lib/user";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  Search,
  X,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export default function TeacherPickerTable({
  data,
  onAssign,
}: {
  data: TeacherTableRow[];
  onAssign: (rows: TeacherTableRow[]) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns = useMemo<ColumnDef<TeacherTableRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "employeeid",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-2"
          >
            Employee ID <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs text-muted-foreground">
            {row.getValue("employeeid")}
          </div>
        ),
      },
      {
        accessorKey: "fullname",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-2"
          >
            Full Name <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const fullname = row.getValue("fullname") as string;
          const profileImage = row.original.profileImage;
          const position = row.original.position;
          const contact = row.original.contact;

          const initials =
            fullname
              ?.split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "";

          return (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback>
                  {initials || <UserRound className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="truncate font-medium">{fullname}</div>

                {/* mobile: show position + contact under name */}
                <div className="md:hidden mt-1 space-y-0.5">
                  <div className="truncate text-xs text-muted-foreground">
                    {position || "N/A"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground font-mono">
                    {contact || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate text-sm text-muted-foreground">
            {row.getValue("position")}
          </div>
        ),
      },
      {
        accessorKey: "contact",
        header: "Contact Number",
        cell: ({ row }) => (
          <div className="font-mono text-xs text-muted-foreground">
            {row.getValue("contact")}
          </div>
        ),
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
      const v = String(filterValue ?? "").toLowerCase().trim();
      if (!v) return true;

      const full = String(row.original.fullname ?? "").toLowerCase();
      const emp = String(row.original.employeeid ?? "").toLowerCase();
      const pos = String(row.original.position ?? "").toLowerCase();
      const contact = String(row.original.contact ?? "").toLowerCase();

      return (
        full.includes(v) ||
        emp.includes(v) ||
        pos.includes(v) ||
        contact.includes(v)
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
  }, [globalFilter])

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedRows.length;

  const handleAssign = () => {
    onAssign(selectedRows);
  };

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Select teachers</CardTitle>
          <CardDescription>
            {filteredCount} result{filteredCount === 1 ? "" : "s"} • 10 per page
          </CardDescription>
        </div>

        {/* Desktop search */}
        <div className="hidden md:block w-[320px]">
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search name, id, position, contact..."
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

          <Button
            className="gap-2"
            onClick={handleAssign}
            disabled={selectedCount === 0}
          >
            <CheckCircle2 className="h-4 w-4" />
            Assign{selectedCount ? ` (${selectedCount})` : ""}
          </Button>
        </div>

        {/* Desktop assign button */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            className="gap-2"
            onClick={handleAssign}
            disabled={selectedCount === 0}
          >
            <CheckCircle2 className="h-4 w-4" />
            Assign selected{selectedCount ? ` (${selectedCount})` : ""}
          </Button>
        </div>

        {/* Mobile search input */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden w-full overflow-hidden"
            >
              <div className="pt-2">
                <Input
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search name, id, position, contact..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className={header.id === "select" ? "w-[44px]" : ""}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
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

        {/* footer pagination (same vibe as teacher-table) */}
        <div className="flex items-center justify-between gap-2 p-4 border-t">
          <div className="text-xs text-muted-foreground">
            Page {pageIndex + 1} of {pageCount || 1}
            {selectedCount ? ` • ${selectedCount} selected` : ""}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
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
  );
}