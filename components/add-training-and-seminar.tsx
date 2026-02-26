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
  Loader2,
  AlertTriangle,
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

import type { TrainingSeminarTableRow, ProfessionalDevelopment } from "@/lib/user";
import {
  createProfessionalDevelopment,
  deleteMultipleProfessionalDevelopment,
  updateProfessionalDevelopment,
} from "@/app/actions/training";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AddTrainingAndSeminarProps {
  data: TrainingSeminarTableRow[];
}

type Mode = "create" | "view" | "edit";

type PendingDelete =
  | { kind: "single"; id: string; title: string; type: string }
  | { kind: "bulk"; ids: string[]; count: number };

const DELETE_WARNING =
  "Deleting this training/seminar will also remove it from all assigned teachers’ records (attendance/proof/compliance references). This action cannot be undone.";

export default function AddTrainingAndSeminar({ data }: AddTrainingAndSeminarProps) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("create");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<ProfessionalDevelopment | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
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

  const isReadOnly = mode === "view";

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
      const ids = pendingDelete.kind === "single" ? [pendingDelete.id] : pendingDelete.ids;

      const result = await deleteMultipleProfessionalDevelopment(ids);

      if (result.success) {
        toast.success(
          pendingDelete.kind === "single"
            ? "Deleted successfully."
            : `Successfully deleted ${result.count} item(s).`
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
        end_date: formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : undefined,
        venue: formData.venue || undefined,
        description: formData.description || undefined,
      };

      if (mode === "create") {
        const result = await createProfessionalDevelopment(payload);
        if (result.success) {
          toast.success(
            `${formData.type === "TRAINING" ? "Training" : "Seminar"} created successfully`
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

        const result = await updateProfessionalDevelopment({ id: selected.id, ...payload });
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
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
          <Badge variant="outline" className="capitalize">
            {String(row.getValue("type")).toLowerCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Title <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="min-w-0">
              <div className="font-medium truncate max-w-[520px]">{r.title}</div>
              <div className="md:hidden mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{r.level}</span>
                <span>•</span>
                <span className="font-mono">{r.date}</span>
                <span>•</span>
                <span className="font-mono">{r.totalHours}h</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{row.getValue("level")}</div>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{row.getValue("date")}</div>
        ),
      },
      {
        accessorKey: "totalHours",
        header: "Hours",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{row.getValue("totalHours")} hrs</div>
        ),
      },
      {
        accessorKey: "sponsor",
        header: "Sponsor",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground truncate max-w-[240px]">
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
              <Button variant="outline" size="icon" aria-label="Actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  router.push(`/add-training-seminar/${row.original.id}/assign`);
                }}
              >
                Assign Teachers
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => openView(row.original)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(row.original)}>Edit</DropdownMenuItem>

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
    [router]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _id, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase().trim();
      if (!q) return true;
      return (
        String(row.original.title ?? "").toLowerCase().includes(q) ||
        String(row.original.sponsor ?? "").toLowerCase().includes(q) ||
        String(row.original.level ?? "").toLowerCase().includes(q) ||
        String(row.original.type ?? "").toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      <Card className="min-w-0">
        <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Records</CardTitle>
            <CardDescription>
              {filteredCount} result{filteredCount === 1 ? "" : "s"} • 10 per page
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="hidden md:block w-[360px]">
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search title, sponsor, level..."
              />
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Training/Seminar
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {mode === "create"
                      ? "Add Training or Seminar"
                      : mode === "edit"
                      ? "Edit Training/Seminar"
                      : "Training/Seminar Details"}
                  </DialogTitle>
                  <DialogDescription>
                    {mode === "create"
                      ? "Fill in the details to add a new training or seminar record."
                      : mode === "edit"
                      ? "Update the details and save changes."
                      : "View the complete details."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: "TRAINING" | "SEMINAR") =>
                          setFormData({ ...formData, type: value })
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRAINING">Training</SelectItem>
                          <SelectItem value="SEMINAR">Seminar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="level">Level *</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value: "REGIONAL" | "NATIONAL" | "INTERNATIONAL") =>
                          setFormData({ ...formData, level: value })
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REGIONAL">Regional</SelectItem>
                          <SelectItem value="NATIONAL">National</SelectItem>
                          <SelectItem value="INTERNATIONAL">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="sponsor">Sponsoring Agency *</Label>
                      <Input
                        id="sponsor"
                        value={formData.sponsoring_agency}
                        onChange={(e) => setFormData({ ...formData, sponsoring_agency: e.target.value })}
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hours">Total Hours *</Label>
                      <Input
                        id="hours"
                        type="number"
                        min="1"
                        value={formData.total_hours}
                        onChange={(e) => setFormData({ ...formData, total_hours: e.target.value })}
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={isReadOnly}
                            className={cn(
                              "justify-start text-left font-normal",
                              !formData.start_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.start_date ? (
                              format(formData.start_date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.start_date}
                            onSelect={(date) => setFormData({ ...formData, start_date: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Label>End Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={isReadOnly}
                            className={cn(
                              "justify-start text-left font-normal",
                              !formData.end_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.end_date ? (
                              format(formData.end_date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.end_date}
                            onSelect={(date) => setFormData({ ...formData, end_date: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="venue">Venue (Optional)</Label>
                      <Input
                        id="venue"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        disabled={isReadOnly}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                      Close
                    </Button>

                    {mode !== "view" ? (
                      <Button type="submit" disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {isSubmitting
                          ? mode === "edit"
                            ? "Saving..."
                            : "Creating..."
                          : mode === "edit"
                          ? "Save Changes"
                          : "Create"}
                      </Button>
                    ) : null}
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

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
          {selectedRows.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => table.resetRowSelection()}>
                  Clear
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => openBulkDelete(selectedRows)}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => {
                      const id = header.column.id;

                      const hideOnSmall =
                        id === "level" || id === "date" || id === "totalHours" || id === "sponsor"
                          ? "hidden md:table-cell"
                          : "";

                      const actionsCol = id === "actions" ? "w-[1%]" : "";

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
                      className="border-b last:border-b-0 hover:bg-accent/40"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const id = cell.column.id;
                        const hideOnSmall =
                          id === "level" || id === "date" || id === "totalHours" || id === "sponsor"
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

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {pageCount || 1}
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

      {/* strict delete warning dialog */}
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
                      {pendingDelete.type.toLowerCase()} — {pendingDelete.title}
                    </span>
                    .
                  </>
                ) : pendingDelete?.kind === "bulk" ? (
                  <>
                    You are about to delete{" "}
                    <span className="font-semibold">
                      {pendingDelete.count} selected record(s)
                    </span>
                    .
                  </>
                ) : null}
              </div>

              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <div className="font-semibold mb-1">Warning</div>
                <div className="text-muted-foreground">{DELETE_WARNING}</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
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