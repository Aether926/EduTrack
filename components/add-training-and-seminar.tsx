"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createProfessionalDevelopment,
  deleteMultipleProfessionalDevelopment,
} from "@/app/actions/training";
import { updateProfessionalDevelopment } from "@/app/actions/training";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TrainingSeminarTableRow, ProfessionalDevelopment } from "@/lib/user";

interface AddTrainingAndSeminarProps {
  data: TrainingSeminarTableRow[];
}

type Mode = "create" | "view" | "edit";

export default function AddTrainingAndSeminar({ data }: AddTrainingAndSeminarProps) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("create");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selected, setSelected] = useState<ProfessionalDevelopment | null>(null);

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
          toast.success(`${formData.type === "TRAINING" ? "Training" : "Seminar"} created successfully`);
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
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (selectedRows: TrainingSeminarTableRow[]) => {
    if (selectedRows.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedRows.length} item(s)? This action cannot be undone.`
    );
    if (!confirmed) return;

    const ids = selectedRows.map((row) => row.id);

    const result = await deleteMultipleProfessionalDevelopment(ids);

    if (result.success) {
      toast.success(`Successfully deleted ${result.count} item(s)`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const trainingSeminarColumns: ColumnDef<TrainingSeminarTableRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllRowsSelected() ||
            (table.getIsSomeRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
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
      cell: ({ row }) => <div className="font-medium">{row.getValue("type")}</div>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="max-w-[300px]">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "level",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Level <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue("level")}</div>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue("date")}</div>,
    },
    {
      accessorKey: "totalHours",
      header: "Total Hours",
      cell: ({ row }) => <div className="text-center">{row.getValue("totalHours")} hrs</div>,
    },
    {
      accessorKey: "sponsor",
      header: "Sponsoring Agency",
      cell: ({ row }) => <div className="max-w-[200px]">{row.getValue("sponsor")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
                onSelect={(e) => {e.preventDefault();router.push(`/add-training-seminar/${row.original.id}/assign`);}}>Assign Teachers
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openView(row.original)}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={async () => {
                const confirmed = confirm("Are you sure you want to delete this item?");
                if (!confirmed) return;

                const result = await deleteMultipleProfessionalDevelopment([row.original.id]);
                if (result.success) {
                  toast.success("Deleted successfully");
                  router.refresh();
                } else {
                  toast.error(result.error || "Failed to delete");
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Training/Seminar
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {mode === "create" ? "Add Training or Seminar" : mode === "edit" ? "Edit Training/Seminar" : "Training/Seminar Details"}
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
                    placeholder="e.g., ICT Integration in Teaching"
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
                    placeholder="e.g., DepEd Regional Office"
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
                    placeholder="e.g., 8"
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
                        {formData.start_date ? format(formData.start_date, "PPP") : <span>Pick a date</span>}
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
                        {formData.end_date ? format(formData.end_date, "PPP") : <span>Pick a date</span>}
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
                    placeholder="e.g., Regional Office Conference Room"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the training/seminar"
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save Changes" : "Create"}
                  </Button>
                ) : null}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={data}
        columns={trainingSeminarColumns}
        filterColumn="title"
        filterPlaceholder="Search by title..."
        pageSize={10}
        showDeleteButton={true}
        onDeleteClick={handleDelete}
      />
    </div>
  );
}
