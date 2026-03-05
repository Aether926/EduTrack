"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowUpDown,
    MoreHorizontal,
    Plus,
    Search,
    X,
    AlertTriangle,
    Clock,
    Building2,
    GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { motion, AnimatePresence } from "framer-motion";

import type {
    TrainingSeminarTableRow,
    ProfessionalDevelopment,
} from "@/lib/user";
import {
    createProfessionalDevelopment,
    deleteMultipleProfessionalDevelopment,
    updateProfessionalDevelopment,
} from "@/app/actions/training";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import PdFormSheet from "@/features/add-training-seminar/components/pd-form-sheet";

interface AddTrainingAndSeminarProps {
    data: TrainingSeminarTableRow[];
}

type Mode = "create" | "view" | "edit";

type PendingDelete =
    | { kind: "single"; id: string; title: string; type: string }
    | { kind: "bulk"; ids: string[]; count: number };

const DELETE_WARNING =
    "Deleting this training/seminar will also remove it from all assigned teachers' records (attendance/proof/compliance references). This action cannot be undone.";

const typeColors: Record<string, string> = {
    training: "bg-teal-500/10 text-teal-400 border-teal-500/40",
    seminar: "bg-violet-500/10 text-violet-400 border-violet-500/40",
    workshop: "bg-orange-500/10 text-orange-400 border-orange-500/40",
    webinar: "bg-sky-500/10 text-sky-400 border-sky-500/40",
    conference: "bg-pink-500/10 text-pink-400 border-pink-500/40",
};

function TypeChip({ type }: { type: string }) {
    const cls =
        typeColors[(type ?? "").toLowerCase()] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {type}
        </span>
    );
}

function LevelPill({ level }: { level: string }) {
    const l = (level ?? "").toLowerCase();
    const cls =
        l === "regional"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
            : l === "national"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/40"
              : l === "international"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
                : "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {level}
        </span>
    );
}

export default function AddTrainingAndSeminar({
    data,
}: AddTrainingAndSeminarProps) {
    const router = useRouter();

    const [mode, setMode] = useState<Mode>("create");
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<ProfessionalDevelopment | null>(
        null,
    );

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        type: "TRAINING" as "TRAINING" | "SEMINAR",
        level: "REGIONAL" as "REGIONAL" | "NATIONAL" | "INTERNATIONAL",
        sponsoring_agency: "",
        total_hours: "",
        start_date: undefined as Date | undefined,
        end_date: undefined as Date | undefined,
        venue: "",
        description: "",
    });

    const resetForm = () => {
        setFormData({
            title: "",
            type: "TRAINING",
            level: "REGIONAL",
            sponsoring_agency: "",
            total_hours: "",
            start_date: undefined,
            end_date: undefined,
            venue: "",
            description: "",
        });
    };

    const fillFormFromRecord = (pd: ProfessionalDevelopment) => {
        setFormData({
            title: pd.title ?? "",
            type: pd.type as "TRAINING" | "SEMINAR",
            level: pd.level as "REGIONAL" | "NATIONAL" | "INTERNATIONAL",
            sponsoring_agency: pd.sponsoring_agency ?? "",
            total_hours: String(pd.total_hours ?? ""),
            start_date: pd.start_date ? new Date(pd.start_date) : undefined,
            end_date: pd.end_date ? new Date(pd.end_date) : undefined,
            venue: pd.venue ?? "",
            description: pd.description ?? "",
        });
    };

    const openCreate = () => {
        setMode("create");
        setSelected(null);
        resetForm();
        setIsOpen(true);
    };
    const openView = (row: TrainingSeminarTableRow) => {
        setMode("view");
        setSelected(row.raw);
        fillFormFromRecord(row.raw);
        setIsOpen(true);
    };
    const openEdit = (row: TrainingSeminarTableRow) => {
        setMode("edit");
        setSelected(row.raw);
        fillFormFromRecord(row.raw);
        setIsOpen(true);
    };

    const openSingleDelete = (row: TrainingSeminarTableRow) => {
        setPendingDelete({
            kind: "single",
            id: row.id,
            title: row.title,
            type: String(row.type),
        });
        setDeleteDialogOpen(true);
    };

    const openBulkDelete = (rows: TrainingSeminarTableRow[]) => {
        const ids = rows.map((r) => r.id);
        setPendingDelete({ kind: "bulk", ids, count: ids.length });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        try {
            const ids =
                pendingDelete.kind === "single"
                    ? [pendingDelete.id]
                    : pendingDelete.ids;
            const result = await deleteMultipleProfessionalDevelopment(ids);
            if (result.success) {
                toast.success(
                    pendingDelete.kind === "single"
                        ? "Deleted successfully."
                        : `Successfully deleted ${result.count} item(s).`,
                );
                setDeleteDialogOpen(false);
                setPendingDelete(null);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete.");
            }
        } catch {
            toast.error("Failed to delete.");
        } finally {
            setDeleting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "view") return;
        setIsSubmitting(true);
        try {
            if (!formData.start_date) {
                toast.error("Start date is required");
                return;
            }

            const payload = {
                title: formData.title,
                type: formData.type,
                level: formData.level,
                sponsoring_agency: formData.sponsoring_agency,
                total_hours: parseInt(formData.total_hours),
                start_date: format(formData.start_date, "yyyy-MM-dd"),
                end_date: formData.end_date
                    ? format(formData.end_date, "yyyy-MM-dd")
                    : undefined,
                venue: formData.venue || undefined,
                description: formData.description || undefined,
            };

            if (mode === "create") {
                const result = await createProfessionalDevelopment(payload);
                if (result.success) {
                    toast.success(
                        `${formData.type === "TRAINING" ? "Training" : "Seminar"} created successfully`,
                    );
                    setIsOpen(false);
                    resetForm();
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to create");
                }
            }

            if (mode === "edit") {
                if (!selected?.id) {
                    toast.error("Missing record id");
                    return;
                }
                const result = await updateProfessionalDevelopment({
                    id: selected.id,
                    ...payload,
                });
                if (result.success) {
                    toast.success("Updated successfully");
                    setIsOpen(false);
                    setSelected(null);
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to update");
                }
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = useMemo<ColumnDef<TrainingSeminarTableRow>[]>(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                "indeterminate")
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => (
                    <TypeChip type={row.getValue("type") as string} />
                ),
            },
            {
                accessorKey: "title",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Title <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <div className="font-medium truncate max-w-[200px] sm:max-w-[520px]">
                            {row.original.title}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "level",
                header: "Level",
                cell: ({ row }) => (
                    <LevelPill level={row.getValue("level") as string} />
                ),
            },
            {
                accessorKey: "date",
                header: "Date",
                cell: ({ row }) => (
                    <div className="font-mono text-xs text-muted-foreground">
                        {row.getValue("date")}
                    </div>
                ),
            },
            {
                accessorKey: "totalHours",
                header: "Hours",
                cell: ({ row }) => (
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-400 font-semibold tabular-nums text-sm">
                            {row.getValue("totalHours")}h
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "sponsor",
                header: "Sponsor",
                cell: ({ row }) => (
                    <div className="text-sm text-muted-foreground truncate max-w-[240px] flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        {row.getValue("sponsor")}
                    </div>
                ),
            },
            {
                id: "actions",
                header: "",
                enableSorting: false,
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Actions"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    router.push(
                                        `/add-training-seminar/${row.original.id}/assign`,
                                    );
                                }}
                            >
                                Assign Teachers
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => openView(row.original)}
                            >
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => openEdit(row.original)}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    openSingleDelete(row.original);
                                }}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [router],
    ); // eslint-disable-line

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _id, filterValue) => {
            const q = String(filterValue ?? "")
                .toLowerCase()
                .trim();
            if (!q) return true;
            return (
                String(row.original.title ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.sponsor ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.level ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(row.original.type ?? "")
                    .toLowerCase()
                    .includes(q)
            );
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    const selectedRows = table
        .getSelectedRowModel()
        .rows.map((r) => r.original);
    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageCount = table.getPageCount();

    return (
        <div className="space-y-4">
            <Card className="min-w-0">
                <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                            <div className="rounded-md border border-white/10 bg-white/5 p-1">
                                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            Training & Seminar Records
                        </CardTitle>
                        <CardDescription>
                            {filteredCount} result
                            {filteredCount === 1 ? "" : "s"} • 10 per page
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="hidden md:block w-[360px]">
                            <Input
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search title, sponsor, level..."
                            />
                        </div>

                        <Button
                            onClick={openCreate}
                            className="gap-2 bg-white/10 hover:bg-white/15 text-foreground border border-white/10 shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Add Training/Seminar
                            </span>
                            <span className="sm:hidden">Add</span>
                        </Button>

                        <div className="flex md:hidden items-center w-full min-w-0">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSearchOpen((v) => !v)}
                                aria-label="Search"
                                className={`shrink-0 transition-all ${searchOpen ? "rounded-r-none border-r-0 bg-muted/50" : ""}`}
                            >
                                {searchOpen ? (
                                    <X className="h-3.5 w-3.5" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                            <AnimatePresence initial={false}>
                                {searchOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "100%" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="flex-1 min-w-0 overflow-hidden relative"
                                    >
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                        <Input
                                            value={globalFilter ?? ""}
                                            onChange={(e) =>
                                                setGlobalFilter(e.target.value)
                                            }
                                            placeholder="Search..."
                                            className="h-9 w-full rounded-l-none pl-8"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {selectedRows.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-2.5">
                            <div className="text-sm text-rose-400 font-medium">
                                {selectedRows.length} row
                                {selectedRows.length > 1 ? "s" : ""} selected
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.resetRowSelection()}
                                >
                                    Clear
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
                                    onClick={() => openBulkDelete(selectedRows)}
                                >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg border overflow-x-auto">
                        <Table className="min-w-[600px]">
                            <TableHeader>
                                {table.getHeaderGroups().map((hg) => (
                                    <TableRow key={hg.id}>
                                        {hg.headers.map((header) => {
                                            const id = header.column.id;
                                            const hideOnSmall =
                                                id === "select" ||
                                                id === "date" ||
                                                id === "sponsor"
                                                    ? "hidden md:table-cell"
                                                    : "";
                                            const actionsCol =
                                                id === "actions"
                                                    ? "w-[1%]"
                                                    : "";
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={`${hideOnSmall} ${actionsCol}`}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column
                                                                  .columnDef
                                                                  .header,
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
                                                delay: Math.min(
                                                    idx * 0.01,
                                                    0.15,
                                                ),
                                            }}
                                            className="border-b last:border-b-0 hover:bg-accent/40"
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => {
                                                    const id = cell.column.id;
                                                    const hideOnSmall =
                                                        id === "select" ||
                                                        id === "date" ||
                                                        id === "sponsor"
                                                            ? "hidden md:table-cell"
                                                            : "";
                                                    return (
                                                        <TableCell
                                                            key={cell.id}
                                                            className={
                                                                hideOnSmall
                                                            }
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
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

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {pageCount || 1}
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

            {/* ── PD Form Sheet ── */}
            <PdFormSheet
                open={isOpen}
                onOpenChange={setIsOpen}
                mode={mode}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* ── Delete confirmation ── */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setPendingDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Confirm deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <div className="text-sm text-foreground">
                                {pendingDelete?.kind === "single" ? (
                                    <>
                                        You are about to delete{" "}
                                        <span className="font-semibold">
                                            {pendingDelete.type.toLowerCase()} —{" "}
                                            {pendingDelete.title}
                                        </span>
                                        .
                                    </>
                                ) : pendingDelete?.kind === "bulk" ? (
                                    <>
                                        You are about to delete{" "}
                                        <span className="font-semibold">
                                            {pendingDelete.count} selected
                                            record(s)
                                        </span>
                                        .
                                    </>
                                ) : null}
                            </div>
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                                <div className="font-semibold mb-1">
                                    Warning
                                </div>
                                <div className="text-muted-foreground">
                                    {DELETE_WARNING}
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
