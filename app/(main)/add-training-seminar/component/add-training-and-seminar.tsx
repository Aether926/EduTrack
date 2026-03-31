"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowUpDown,
    Plus,
    Search,
    X,
    AlertTriangle,
    Clock,
    Building2,
    ChevronDown,
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
import {
    getAssignedTeachersForTraining,
    type AssignedTeacher,
} from "@/lib/database/trainings";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { PageNav } from "@/components/ui-elements/pagination/page-nav";
import {
    PAGE_SIZES,
    resolvePageSize,
} from "@/components/ui-elements/pagination/page-sizes";
import { TypeBadge, LevelBadge } from "@/components/ui-elements/badges";
import { TrainingLevel } from "@/enums/level";

const LEVEL_LABELS: Record<string, string> = {
    withinInstitution: "Within Institution",
    interInstitutional: "Inter-Institutional",
    local: "Local",
    regional: "Regional",
    national: "National",
    international: "International",
};

interface AddTrainingAndSeminarProps {
    data: TrainingSeminarTableRow[];
}

type Mode = "create" | "view" | "edit";

type PendingDelete =
    | { kind: "single"; id: string; title: string; type: string }
    | { kind: "bulk"; ids: string[]; count: number };

const DELETE_WARNING =
    "Deleting this training/seminar will also remove it from all assigned teachers' records (attendance/proof/compliance references). This action cannot be undone.";

function isPastDate(startDate: string | null | undefined) {
    if (!startDate) return false;
    return new Date(startDate) < new Date(new Date().toDateString());
}

export default function AddTrainingAndSeminar({
    data,
}: AddTrainingAndSeminarProps) {
    const router = useRouter();

    const [mode, setMode] = useState<Mode>("create");
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<TrainingSeminarTableRow | null>(
        null,
    );

    const [assignedUsers, setAssignedUsers] = useState<AssignedTeacher[]>([]);
    const [loadingAssigned, setLoadingAssigned] = useState(false);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [levelFilter, setLevelFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<
        "upcoming" | "past" | null
    >(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);

    const emptyForm = {
        title: "",
        type: "TRAINING" as "TRAINING" | "SEMINAR",
        level: "local" as keyof typeof TrainingLevel,
        sponsoring_agency: "",
        total_hours: "",
        start_date: undefined as Date | undefined,
        end_date: undefined as Date | undefined,
        venue: "",
        description: "",
    };

    const [formData, setFormData] = useState(emptyForm);

    const LEVEL_NORMALIZE: Record<string, string> = {
        REGIONAL: "regional",
        NATIONAL: "national",
        INTERNATIONAL: "international",
        LOCAL: "local",
        WITHININSTITUTION: "withinInstitution",
        INTERINSTITUTIONAL: "interInstitutional",
    };

    const fillForm = (pd: ProfessionalDevelopment) =>
        setFormData({
            title: pd.title ?? "",
            type: pd.type as "TRAINING" | "SEMINAR",
            level: (LEVEL_NORMALIZE[pd.level ?? ""] ??
                pd.level) as keyof typeof TrainingLevel,
            sponsoring_agency: pd.sponsoring_agency ?? "",
            total_hours: String(pd.total_hours ?? ""),
            start_date: pd.start_date ? new Date(pd.start_date) : undefined,
            end_date: pd.end_date ? new Date(pd.end_date) : undefined,
            venue: pd.venue ?? "",
            description: pd.description ?? "",
        });

    const openCreate = () => {
        setMode("create");
        setSelected(null);
        setFormData(emptyForm);
        setAssignedUsers([]);
        setIsOpen(true);
    };

    const openView = (row: TrainingSeminarTableRow) => {
        setMode("view");
        setSelected(row);
        fillForm(row.raw);
        setAssignedUsers([]);
        setIsOpen(true);
        setLoadingAssigned(true);
        getAssignedTeachersForTraining(row.id).then((teachers) => {
            setAssignedUsers(teachers);
            setLoadingAssigned(false);
        });
    };

    const switchToEdit = () => {
        if (selected && !isPastDate(selected.raw?.start_date)) {
            setMode("edit");
        }
    };

    // ── extracted to avoid multiline arrow in JSX ──
    const handleAssign = () => {
        if (selected && !isPastDate(selected.raw?.start_date)) {
            router.push(`/add-training-seminar/${selected.id}/assign`);
        } else {
            toast.warning(
                "This training has already passed. You can no longer assign teachers to it.",
            );
        }
    };

    const triggerDelete = () => {
        if (!selected) return;
        setPendingDelete({
            kind: "single",
            id: selected.id,
            title: selected.title,
            type: String(selected.type),
        });
        setDeleteDialogOpen(true);
    };

    const openBulkDelete = (rows: TrainingSeminarTableRow[]) => {
        setPendingDelete({
            kind: "bulk",
            ids: rows.map((r) => r.id),
            count: rows.length,
        });
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
                        : `Deleted ${result.count} item(s).`,
                );
                setDeleteDialogOpen(false);
                setPendingDelete(null);
                setIsOpen(false);
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
            const parsedHours = parseInt(formData.total_hours, 10);
            if (
                !formData.total_hours ||
                isNaN(parsedHours) ||
                parsedHours < 1
            ) {
                toast.error("Total hours must be a valid number");
                return;
            }

            const payload = {
                title: formData.title,
                type: formData.type,
                level: formData.level,
                sponsoring_agency: formData.sponsoring_agency,
                total_hours: parsedHours,
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
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to create");
                }
            }

            if (mode === "edit" && selected?.id) {
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

    const today = new Date(new Date().toDateString());

    const filteredData = useMemo(() => {
        return data.filter((row) => {
            if (typeFilter && row.type !== typeFilter) return false;
            if (levelFilter && row.level !== levelFilter) return false;
            if (statusFilter) {
                const start = row.raw?.start_date
                    ? new Date(row.raw.start_date)
                    : null;
                if (statusFilter === "upcoming" && start && start < today)
                    return false;
                if (statusFilter === "past" && start && start >= today)
                    return false;
            }
            return true;
        });
    }, [data, typeFilter, levelFilter, statusFilter]); // eslint-disable-line

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
                        onCheckedChange={(v) =>
                            table.toggleAllPageRowsSelected(!!v)
                        }
                        aria-label="Select all"
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(v) => row.toggleSelected(!!v)}
                        aria-label="Select row"
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => (
                    <TypeBadge type={row.getValue("type") as string} />
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
                cell: ({ row }) => {
                    const past = isPastDate(row.original.raw?.start_date);
                    const title = row.original.title ?? "";
                    return (
                        <div className="min-w-0 max-w-[180px] sm:max-w-[300px]">
                            <div
                                className={`font-medium truncate ${past ? "text-muted-foreground" : ""}`}
                                title={title}
                            >
                                {title}
                            </div>
                            {past && (
                                <div className="text-[10px] text-muted-foreground/50 mt-0.5">
                                    Expired
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "level",
                header: "Level",
                cell: ({ row }) => (
                    <LevelBadge level={row.getValue("level") as string} />
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
                    <div className="text-sm text-muted-foreground truncate max-w-[200px] flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        {row.getValue("sponsor")}
                    </div>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: filteredData,
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
        initialState: {
            pagination: {
                pageSize: resolvePageSize(PAGE_SIZES.trainingSeminarTable),
            },
        },
    });

    const selectedRows = table
        .getSelectedRowModel()
        .rows.map((r) => r.original);
    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageCount = table.getPageCount();
    const hasFilters = typeFilter || levelFilter || statusFilter;

    return (
        <div className="rounded-xl border border-border/60 overflow-hidden">
            {/* Gradient toolbar area */}
            <div className="relative bg-gradient-to-br from-card to-background">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/3 via-transparent to-violet-500/3 pointer-events-none" />
                <div className="relative px-5 py-4 border-b border-border/60 space-y-3">
                    {/* Top row: search + add */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search title, sponsor, level..."
                                className="pl-9"
                            />
                        </div>

                        <div className="flex md:hidden items-center flex-1 min-w-0">
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
                                        className="flex-1 min-w-0 overflow-hidden"
                                    >
                                        <Input
                                            value={globalFilter ?? ""}
                                            onChange={(e) =>
                                                setGlobalFilter(e.target.value)
                                            }
                                            placeholder="Search..."
                                            className="h-9 w-full rounded-l-none"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                    </div>

                    {/* Filter row */}
                    <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 min-w-[130px] justify-between bg-background/50"
                                >
                                    <span className="truncate">
                                        {typeFilter
                                            ? typeFilter.charAt(0) +
                                              typeFilter.slice(1).toLowerCase()
                                            : "All Types"}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onClick={() => setTypeFilter(null)}
                                >
                                    All Types
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTypeFilter("TRAINING")}
                                >
                                    Training
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTypeFilter("SEMINAR")}
                                >
                                    Seminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 min-w-[130px] justify-between bg-background/50"
                                >
                                    <span className="truncate">
                                        {levelFilter
                                            ? (LEVEL_LABELS[levelFilter] ??
                                              levelFilter)
                                            : "All Levels"}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onClick={() => setLevelFilter(null)}
                                >
                                    All Levels
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setLevelFilter("withinInstitution")
                                    }
                                >
                                    Within Institution
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setLevelFilter("interInstitutional")
                                    }
                                >
                                    Inter-Institutional
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setLevelFilter("local")}
                                >
                                    Local
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setLevelFilter("regional")}
                                >
                                    Regional
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setLevelFilter("national")}
                                >
                                    National
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setLevelFilter("international")
                                    }
                                >
                                    International
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 min-w-[130px] justify-between bg-background/50"
                                >
                                    <span className="truncate">
                                        {statusFilter === "upcoming"
                                            ? "Upcoming"
                                            : statusFilter === "past"
                                              ? "Past"
                                              : "All Statuses"}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onClick={() => setStatusFilter(null)}
                                >
                                    All Statuses
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setStatusFilter("upcoming")}
                                >
                                    Upcoming
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setStatusFilter("past")}
                                >
                                    Past
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setTypeFilter(null);
                                    setLevelFilter(null);
                                    setStatusFilter(null);
                                }}
                                className="text-muted-foreground gap-1"
                            >
                                <X className="h-3.5 w-3.5" /> Clear filters
                            </Button>
                        )}
                    </div>

                    {/* Bulk delete bar */}
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
                </div>
            </div>

            {/* Plain table area — no gradient */}
            <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow
                                key={hg.id}
                                className="bg-card border-border/60 hover:bg-transparent"
                            >
                                {hg.headers.map((header) => {
                                    const id = header.column.id;
                                    const hide =
                                        id === "select" ||
                                        id === "date" ||
                                        id === "sponsor"
                                            ? "hidden md:table-cell"
                                            : "";
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={`${hide} text-muted-foreground/70 text-xs uppercase tracking-wider`}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
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
                            table.getRowModel().rows.map((row, idx) => {
                                const past = isPastDate(
                                    row.original.raw?.start_date,
                                );
                                return (
                                    <motion.tr
                                        key={row.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.16,
                                            delay: Math.min(idx * 0.01, 0.15),
                                        }}
                                        className={`bg-card border-b border-border/40 last:border-b-0 cursor-pointer transition-colors ${past ? "hover:bg-muted/20" : "hover:bg-accent/40"}`}
                                        onClick={() => openView(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const id = cell.column.id;
                                            const hide =
                                                id === "select" ||
                                                id === "date" ||
                                                id === "sponsor"
                                                    ? "hidden md:table-cell"
                                                    : "";
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={hide}
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
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="bg-card h-24 text-center text-muted-foreground"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="bg-card px-5 py-3.5 border-t border-border/60 relative">
                <PageNav
                    page={table.getState().pagination.pageIndex + 1}
                    totalPages={pageCount || 1}
                    onPageChange={(p) => table.setPageIndex(p - 1)}
                />
                <span className="absolute right-5 top-3.5 text-xs text-muted-foreground">
                    {filteredCount} result{filteredCount === 1 ? "" : "s"}
                </span>
            </div>

            {/* ── Sheet ── */}
            <PdFormSheet
                open={isOpen}
                onOpenChange={(v) => {
                    setIsOpen(v);
                    if (!v) setMode("create");
                }}
                mode={mode}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isPast={selected ? isPastDate(selected.raw?.start_date) : false}
                onEdit={mode === "view" ? switchToEdit : undefined}
                onDelete={mode === "view" ? triggerDelete : undefined}
                onAssign={mode === "view" ? handleAssign : undefined}
                assignedUsers={assignedUsers}
                loadingAssigned={loadingAssigned}
            />

            {/* ── Delete dialog ── */}
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
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <div className="text-sm text-foreground">
                                    {pendingDelete?.kind === "single" ? (
                                        <>
                                            You are about to delete{" "}
                                            <span className="font-semibold">
                                                {pendingDelete.type.toLowerCase()}{" "}
                                                — {pendingDelete.title}
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
