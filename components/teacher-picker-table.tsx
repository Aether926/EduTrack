/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<string | null>(null);

  // Derive unique filter options from data
  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of data) {
      const val = (row as any).subjectSpecialization;
      if (val) set.add(val);
    }
    return Array.from(set).sort();
  }, [data]);

  const positionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of data) {
      if (row.position) set.add(row.position);
    }
    return Array.from(set).sort();
  }, [data]);

  // Apply dropdown filters before passing to table
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (subjectFilter && (row as any).subjectSpecialization !== subjectFilter) return false;
      if (positionFilter && row.position !== positionFilter) return false;
      return true;
    });
  }, [data, subjectFilter, positionFilter]);

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
                <div className="md:hidden mt-1 space-y-0.5">
                  <div className="truncate text-xs text-muted-foreground">{position || "N/A"}</div>
                  <div className="truncate text-xs text-muted-foreground font-mono">{contact || "N/A"}</div>
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
    data: filteredData,
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
      return full.includes(v) || emp.includes(v) || pos.includes(v) || contact.includes(v);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [globalFilter, subjectFilter, positionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedRows.length;

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3 md:flex-row md:items-end">
          <div className="space-y-1">
            <CardTitle className="text-base">Select teachers</CardTitle>
            <CardDescription>
              {filteredCount} result{filteredCount === 1 ? "" : "s"} • 10 per page
            </CardDescription>
          </div>

          {/* Desktop search + assign */}
          <div className="hidden md:flex items-center gap-2">
            <Input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search name, id, position, contact..."
              className="w-[280px]"
            />
            <Button className="gap-2" onClick={() => onAssign(selectedRows)} disabled={selectedCount === 0}>
              <CheckCircle2 className="h-4 w-4" />
              Assign selected{selectedCount ? ` (${selectedCount})` : ""}
            </Button>
          </div>

          {/* Mobile search + assign */}
          <div className="flex md:hidden items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSearchOpen((v) => !v)} aria-label="Search">
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button className="gap-2" onClick={() => onAssign(selectedRows)} disabled={selectedCount === 0}>
              <CheckCircle2 className="h-4 w-4" />
              Assign{selectedCount ? ` (${selectedCount})` : ""}
            </Button>
          </div>

          {/* Mobile search expand */}
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
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 min-w-[160px] justify-between">
                <span className="truncate">{subjectFilter ?? "All Subjects"}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => setSubjectFilter(null)}>All Subjects</DropdownMenuItem>
              {subjectOptions.map((s) => (
                <DropdownMenuItem key={s} onClick={() => setSubjectFilter(s)}>{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 min-w-[140px] justify-between">
                <span className="truncate">{positionFilter ?? "All Positions"}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => setPositionFilter(null)}>All Positions</DropdownMenuItem>
              {positionOptions.map((p) => (
                <DropdownMenuItem key={p} onClick={() => setPositionFilter(p)}>{p}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {(subjectFilter || positionFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSubjectFilter(null); setPositionFilter(null); }}
              className="text-muted-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className={header.id === "select" ? "w-[44px]" : ""}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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

        <div className="flex items-center justify-between gap-2 p-4 border-t">
          <div className="text-xs text-muted-foreground">
            Page {pageIndex + 1} of {pageCount || 1}
            {selectedCount ? ` • ${selectedCount} selected` : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}