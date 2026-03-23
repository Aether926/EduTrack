/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
    ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/ui-elements/avatars/user-avatar";
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

import { PositionBadge } from "@/components/ui-elements/badges";
import { fmtContact } from "@/components/formatter/contact-format";
import { fmtEmployeeId } from "@/components/formatter/employee-id-format";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtPhone = fmtContact;

// ── Component ─────────────────────────────────────────────────────────────────

interface TeacherTableProps {
    data: TeacherTableRow[];
    viewerRole?: "ADMIN" | "TEACHER";
}

export default function TeacherTable({
    data,
    viewerRole = "TEACHER",
}: TeacherTableProps) {
    const router = useRouter();
    const isAdmin = viewerRole === "ADMIN";

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
    const [positionFilter, setPositionFilter] = useState<string | null>(null);

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

    const columns = useMemo<ColumnDef<TeacherTableRow>[]>(
        () => [
            // Employee ID — admin only
            ...(isAdmin
                ? ([
                      {
                          accessorKey: "employeeid",
                          header: "Employee ID",
                          cell: ({ row }) => (
                              <div className="font-mono text-xs text-muted-foreground">
                                  {fmtEmployeeId(
                                      String(row.getValue("employeeid") ?? ""),
                                  )}
                              </div>
                          ),
                      },
                  ] as ColumnDef<TeacherTableRow>[])
                : []),

            // Name + privacy-aware inline info
            {
                accessorKey: "fullname",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-2"
                    >
                        Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const fullname = row.getValue("fullname") as string;
                    const ps = (row.original as any).privacySettings ?? {};
                    const showPosition = isAdmin || (ps.showPosition ?? false);
                    const showContact = isAdmin || (ps.contactInfo ?? false);
                    const showEmergency =
                        isAdmin || (ps.emergencyContact ?? false);
                    const emergencyName = String(
                        (row.original as any).emergencyName ?? "",
                    );
                    const emergencyContact = String(
                        (row.original as any).emergencyContact ?? "",
                    );
                    const allHidden =
                        !showPosition && !showContact && !showEmergency;

                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                                name={fullname}
                                src={row.original.profileImage}
                                className="h-8 w-8 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="truncate font-medium">
                                    {fullname}
                                </div>
                                {allHidden && !isAdmin ? (
                                    <div className="text-xs text-muted-foreground/50 italic mt-0.5">
                                        Profile is private
                                    </div>
                                ) : (
                                    <div className="md:hidden mt-0.5 space-y-0.5 min-w-0">
                                        {showContact &&
                                            row.original.contact && (
                                                <div className="truncate text-xs text-muted-foreground font-mono">
                                                    {fmtPhone(
                                                        row.original.contact,
                                                    ) ?? "—"}
                                                </div>
                                            )}
                                        {showPosition &&
                                            row.original.position && (
                                                <div className="mt-1">
                                                    <PositionBadge
                                                        position={
                                                            row.original
                                                                .position
                                                        }
                                                    />
                                                </div>
                                            )}
                                        {showEmergency && emergencyName && (
                                            <div className="truncate text-xs text-muted-foreground/70">
                                                <span className="not-italic">
                                                    Emrg:{" "}
                                                </span>
                                                {emergencyName}
                                                {emergencyContact && (
                                                    <span className="font-mono ml-1">
                                                        {fmtPhone(
                                                            emergencyContact,
                                                        ) ?? "—"}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            },

            // Position — gated by privacy, now with badge
            {
                accessorKey: "position",
                header: "Position",
                cell: ({ row }) => {
                    const ps = (row.original as any).privacySettings ?? {};
                    const showPosition = isAdmin || (ps.showPosition ?? false);
                    if (!showPosition)
                        return (
                            <div className="text-xs text-muted-foreground/40 italic">
                                Hidden
                            </div>
                        );
                    return (
                        <PositionBadge
                            position={row.getValue("position") as string}
                        />
                    );
                },
            },

            // Contact + emergency — gated by privacy
            {
                accessorKey: "contact",
                header: "Contact",
                cell: ({ row }) => {
                    const ps = (row.original as any).privacySettings ?? {};
                    const showContact = isAdmin || (ps.contactInfo ?? false);
                    const showEmergency =
                        isAdmin || (ps.emergencyContact ?? false);
                    const emergencyName = String(
                        (row.original as any).emergencyName ?? "",
                    );
                    const emergencyContact = String(
                        (row.original as any).emergencyContact ?? "",
                    );

                    return (
                        <div className="space-y-0.5">
                            {showContact ? (
                                <div className="font-mono text-xs text-muted-foreground">
                                    {fmtPhone(
                                        String(row.getValue("contact") ?? ""),
                                    ) ?? "—"}
                                </div>
                            ) : (
                                <div className="text-xs text-muted-foreground/40 italic">
                                    Hidden
                                </div>
                            )}
                            {showEmergency && emergencyName && (
                                <div className="text-xs text-muted-foreground/70">
                                    <span className="text-muted-foreground/50">
                                        Emrg:{" "}
                                    </span>
                                    {emergencyName}
                                    {emergencyContact && (
                                        <span className="font-mono ml-1">
                                            {fmtPhone(emergencyContact) ?? "—"}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                },
            },

            // Emergency contact — gated by privacy
            {
                id: "emergency",
                header: "Emergency Contact",
                cell: ({ row }) => {
                    const ps = (row.original as any).privacySettings ?? {};
                    const showEmergency =
                        isAdmin || (ps.emergencyContact ?? false);
                    const emergencyName = String(
                        (row.original as any).emergencyName ?? "",
                    );
                    const emergencyContact = String(
                        (row.original as any).emergencyContact ?? "",
                    );

                    if (!showEmergency)
                        return (
                            <div className="text-xs text-muted-foreground/40 italic">
                                Hidden
                            </div>
                        );
                    if (!emergencyName)
                        return (
                            <div className="text-xs text-muted-foreground/40">
                                —
                            </div>
                        );
                    return (
                        <div className="space-y-0.5">
                            <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                                {emergencyName}
                            </div>
                            {emergencyContact && (
                                <div className="font-mono text-xs text-muted-foreground/70">
                                    {fmtPhone(emergencyContact) ?? "—"}
                                </div>
                            )}
                        </div>
                    );
                },
            },

            // View arrow
            {
                id: "view",
                header: "",
                enableSorting: false,
                cell: () => (
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                        <span className="hidden md:inline text-xs">
                            View profile
                        </span>
                        <ChevronRight className="h-4 w-4" />
                    </div>
                ),
            },
        ],
        [isAdmin],
    );

    const filteredData = useMemo(() => {
        return data.filter((row) => {
            if (
                subjectFilter &&
                (row as any).subjectSpecialization !== subjectFilter
            )
                return false;
            if (positionFilter && row.position !== positionFilter) return false;
            return true;
        });
    }, [data, subjectFilter, positionFilter]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue) => {
            const v = String(filterValue ?? "")
                .toLowerCase()
                .trim();
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
    }, [globalFilter, subjectFilter, positionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    return (
        <Card className="min-w-0 overflow-hidden">
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-base">Teachers</CardTitle>
                        <CardDescription>
                            {filteredCount} result
                            {filteredCount === 1 ? "" : "s"} • 10 per page
                        </CardDescription>
                    </div>

                    {/* Desktop search */}
                    <div className="hidden md:block w-[280px]">
                        <Input
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search name, email, ID..."
                        />
                    </div>

                    {/* Mobile search toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSearchOpen((v) => !v)}
                            aria-label="Search"
                        >
                            {searchOpen ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                        <AnimatePresence initial={false}>
                            {searchOpen && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{
                                        width: "min(240px, 55vw)",
                                        opacity: 1,
                                    }}
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
                                        className="h-9"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Filter dropdowns */}
                <div className="flex flex-wrap gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 min-w-[160px] justify-between"
                            >
                                <span className="truncate">
                                    {subjectFilter ?? "All Subjects"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="max-h-60 overflow-y-auto"
                        >
                            <DropdownMenuItem
                                onClick={() => setSubjectFilter(null)}
                            >
                                All Subjects
                            </DropdownMenuItem>
                            {subjectOptions.map((s) => (
                                <DropdownMenuItem
                                    key={s}
                                    onClick={() => setSubjectFilter(s)}
                                >
                                    {s}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 min-w-[140px] justify-between"
                            >
                                <span className="truncate">
                                    {positionFilter ?? "All Positions"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="max-h-60 overflow-y-auto"
                        >
                            <DropdownMenuItem
                                onClick={() => setPositionFilter(null)}
                            >
                                All Positions
                            </DropdownMenuItem>
                            {positionOptions.map((p) => (
                                <DropdownMenuItem
                                    key={p}
                                    onClick={() => setPositionFilter(p)}
                                >
                                    {p}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {(subjectFilter || positionFilter) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSubjectFilter(null);
                                setPositionFilter(null);
                            }}
                            className="text-muted-foreground gap-1"
                        >
                            <X className="h-3.5 w-3.5" /> Clear filters
                        </Button>
                    )}
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
                                        const hideOnSmall =
                                            colId === "position" ||
                                            colId === "contact" ||
                                            colId === "emergency"
                                                ? "hidden md:table-cell"
                                                : "";
                                        const viewCol =
                                            colId === "view" ? "w-[1%]" : "";
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={`${hideOnSmall} ${viewCol}`}
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
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.16,
                                            delay: Math.min(idx * 0.01, 0.15),
                                        }}
                                        className="border-b last:border-b-0 cursor-pointer hover:bg-accent/40"
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
                                                colId === "contact" ||
                                                colId === "emergency"
                                                    ? "hidden md:table-cell"
                                                    : "";
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={hideOnSmall}
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
                                        className="h-24 text-center text-muted-foreground"
                                    >
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
