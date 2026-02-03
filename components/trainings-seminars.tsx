"use client";

import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TrainingSeminar = {
  id: string;        // attendance row id
  trainingId: string; // professionalDevelopment id
  type: string;
  title: string;
  level: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  sponsor: string;
  status: string;
};

const trainingSeminarColumns: ColumnDef<TrainingSeminar>[] = [
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
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Type <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Title <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Level <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center w-full">{row.getValue("level")}</div>,
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Start Date <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center w-full">{row.getValue("startDate")}</div>,
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        End Date <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center w-full">{row.getValue("endDate")}</div>,
  },
  {
    accessorKey: "totalHours",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Total Hours <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center w-full">{row.getValue("totalHours")}</div>,
  },
  {
    accessorKey: "sponsor",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Sponsoring Agency <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("sponsor")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div className="text-center w-full">{row.getValue("status")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>View details (next)</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Upload proof (next)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function TrainingsSeminars({ data }: { data: TrainingSeminar[] }) {
  // teacher page: no Add button for Phase 1
  const handleDelete = (selectedRows: TrainingSeminar[]) => {
    console.log("Selected:", selectedRows);
  };

  return (
    <DataTable
      data={data}
      columns={trainingSeminarColumns}
      filterColumn="title"
      filterPlaceholder="Filter trainings..."
      pageSize={8}
      showAddButton={false}
      showDeleteButton={false}
      onDeleteClick={handleDelete}
    />
  );
}
