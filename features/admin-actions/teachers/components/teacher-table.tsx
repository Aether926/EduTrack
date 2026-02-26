"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function AdminTeacherTable({ data }: { data: TeacherTableRow[] }) {
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const columns = useMemo<ColumnDef<TeacherTableRow>[]>(
    () => [
      {
        accessorKey: "employeeid",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Employee ID <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs text-muted-foreground">
            {row.getValue("employeeid") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "fullname",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const fullname = (row.getValue("fullname") as string) || "Unknown";
          const profileImage = row.original.profileImage;
          const position = row.original.position;
          const contact = row.original.contact;
          const email = row.original.email;

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

                {/* Mobile: show extra info under name */}
                <div className="md:hidden mt-1 space-y-0.5">
                  <div className="truncate text-xs text-muted-foreground">
                    {position || "N/A"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground font-mono">
                    {contact || "N/A"}
                  </div>
                </div>

                {/* Desktop: email subtext */}
                <div className="hidden md:block truncate text-xs text-muted-foreground">
                  {email || "—"}
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
            {(row.getValue("position") as string) || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "contact",
        header: "Contact Number",
        cell: ({ row }) => (
          <div className="font-mono text-xs text-muted-foreground">
            {(row.getValue("contact") as string) || "N/A"}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // important: prevent row click
                router.push(`/admin-actions/teachers/${row.original.id}`);
              }}
            >
              Manage
            </Button>
            <ChevronRight className="hidden md:block h-4 w-4 text-muted-foreground" />
          </div>
        ),
      },
    ],
    [router]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase().trim();
      if (!q) return true;

      const full = String(row.original.fullname ?? "").toLowerCase();
      const emp = String(row.original.employeeid ?? "").toLowerCase();
      const pos = String(row.original.position ?? "").toLowerCase();
      const contact = String(row.original.contact ?? "").toLowerCase();
      const email = String(row.original.email ?? "").toLowerCase();

      return (
        full.includes(q) ||
        emp.includes(q) ||
        pos.includes(q) ||
        contact.includes(q) ||
        email.includes(q)
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
    <Card className="min-w-0">
      <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Teachers</CardTitle>
          <CardDescription>
            {filteredCount} result{filteredCount === 1 ? "" : "s"} • 10 per page
          </CardDescription>
        </div>

        {/* desktop search */}
        <div className="hidden md:block w-[360px]">
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search name, id, position, contact..."
          />
        </div>

        {/* mobile search toggle */}
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

                    const hideOnSmall =
                      colId === "position" || colId === "contact"
                        ? "hidden md:table-cell"
                        : "";

                    const actionsCol = colId === "actions" ? "w-[1%]" : "";

                    return (
                      <TableHead key={header.id} className={`${hideOnSmall} ${actionsCol}`}>
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
                    className="border-b last:border-b-0 cursor-pointer hover:bg-accent/40"
                    onClick={() => router.push(`/teacher-profiles/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const colId = cell.column.id;
                      const hideOnSmall =
                        colId === "position" || colId === "contact"
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
  );
}