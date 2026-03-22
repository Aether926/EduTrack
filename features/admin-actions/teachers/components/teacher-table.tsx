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
    ChevronRight,
    ChevronLeft,
    Users,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarColor from "@/components/ui-elements/avatars/avatar-color";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function AdminTeacherTable({
    data,
}: {
    data: TeacherTableRow[];
}) {
    const router = useRouter();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    const columns = useMemo<ColumnDef<TeacherTableRow>[]>(
        () => [
            {
                accessorKey: "employeeid",
                header: ({ column }) => (
                    <button
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold hover:text-foreground transition-colors"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Employee ID <ArrowUpDown className="h-3 w-3" />
                    </button>
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
                    <button
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold hover:text-foreground transition-colors"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                ),
                cell: ({ row }) => {
                    const fullname =
                        (row.getValue("fullname") as string) || "Unknown";
                    const profileImage = row.original.profileImage;
                    const position = row.original.position;
                    const email = row.original.email;

                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={profileImage || undefined} />
                                <AvatarFallback className="p-0 overflow-hidden">
                                    <AvatarColor name={fullname} />
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-foreground">
                                    {fullname}
                                </div>
                                <div className="truncate text-[11px] text-muted-foreground hidden md:block">
                                    {email || "—"}
                                </div>
                                <div className="md:hidden mt-0.5 truncate text-[11px] text-muted-foreground">
                                    {position || "N/A"}
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "position",
                header: () => (
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                        Position
                    </span>
                ),
                cell: ({ row }) => (
                    <div className="max-w-[260px] truncate text-sm text-muted-foreground">
                        {(row.getValue("position") as string) || "N/A"}
                    </div>
                ),
            },
            {
                accessorKey: "contact",
                header: () => (
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                        Contact
                    </span>
                ),
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                    `/admin-actions/teachers/${row.original.id}`,
                                );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                        >
                            Manage
                        </button>
                        <ChevronRight className="hidden md:block h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                ),
            },
        ],
        [router],
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue) => {
            const q = String(filterValue ?? "")
                .toLowerCase()
                .trim();
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
        <div className="border border-border/60 shadow-lg w-full overflow-hidden rounded-xl bg-card">
            {/* Header band */}
            <div className="relative px-6 py-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-violet-400/4 pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 shrink-0">
                            <Users className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold tracking-tight leading-tight text-foreground">
                                Teachers
                            </span>
                            <p className="text-[13px] text-muted-foreground mt-0.5">
                                {filteredCount} result
                                {filteredCount === 1 ? "" : "s"} • 10 per page
                            </p>
                        </div>
                    </div>

                    {/* Desktop search */}
                    <div className="hidden md:block w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search name, id, position..."
                                className="pl-8 h-8 text-sm bg-white/5 border-white/10 focus:border-violet-500/40"
                            />
                        </div>
                    </div>

                    {/* Mobile search toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={() => setSearchOpen((v) => !v)}
                            className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                        >
                            {searchOpen ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </button>
                        <AnimatePresence initial={false}>
                            {searchOpen && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "220px", opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden"
                                >
                                    <Input
                                        value={globalFilter ?? ""}
                                        onChange={(e) =>
                                            setGlobalFilter(e.target.value)
                                        }
                                        placeholder="Search..."
                                        className="h-8 text-sm bg-white/5 border-white/10"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
                <div className="rounded-md border border-white/8 overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((hg) => (
                                <TableRow
                                    key={hg.id}
                                    className="border-white/8 hover:bg-transparent"
                                >
                                    {hg.headers.map((header) => {
                                        const colId = header.column.id;
                                        const hideOnSmall =
                                            colId === "position" ||
                                            colId === "contact"
                                                ? "hidden md:table-cell"
                                                : "";
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={hideOnSmall}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
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
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.14,
                                            delay: Math.min(idx * 0.01, 0.12),
                                        }}
                                        className="border-b border-white/8 last:border-b-0 cursor-pointer hover:bg-white/3 transition-colors"
                                        onClick={() =>
                                            router.push(
                                                `/teacher-profiles/${row.original.id}`,
                                            )
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const colId = cell.column.id;
                                            const hideOnSmall =
                                                colId === "position" ||
                                                colId === "contact"
                                                    ? "hidden md:table-cell"
                                                    : "";
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={`py-3 ${hideOnSmall}`}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </motion.tr>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-sm text-muted-foreground"
                                    >
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                    <div className="flex flex-col items-center gap-2 mt-3 px-1">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] text-muted-foreground">
                                Page {pageIndex + 1} of {pageCount}
                            </span>
                        </div>
                        <div className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto w-full pb-1">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {(() => {
                                const page = pageIndex + 1;
                                const delta = 1;
                                const range: (number | "…")[] = [];
                                const left = Math.max(2, page - delta);
                                const right = Math.min(
                                    pageCount - 1,
                                    page + delta,
                                );

                                range.push(1);
                                if (left > 2) range.push("…");
                                for (let i = left; i <= right; i++)
                                    range.push(i);
                                if (right < pageCount - 1) range.push("…");
                                if (pageCount > 1) range.push(pageCount);

                                return range.map((p, idx) =>
                                    p === "…" ? (
                                        <span
                                            key={`ellipsis-${idx}`}
                                            className="inline-flex h-6 w-6 items-center justify-center text-[11px] text-muted-foreground"
                                        >
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() =>
                                                table.setPageIndex(
                                                    (p as number) - 1,
                                                )
                                            }
                                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-medium transition ${
                                                p === page
                                                    ? "border-violet-500/40 bg-violet-500/20 text-violet-400"
                                                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                );
                            })()}
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
