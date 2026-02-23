"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import PdViewModal from "@/components/pd-view-modal";

export type TrainingSeminarRow = {
  id: string;
  trainingId: string; 
  type: string;
  title: string;
  level: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  approvedHours: string | null;
  sponsor: string;
  status: string;
};

export default function TrainingsSeminars({ data }: { data: TrainingSeminarRow[] }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);

  const columns: ColumnDef<TrainingSeminarRow>[] = useMemo(
    () => [
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
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
        cell: ({ row }) => (
          <div className="text-center w-full">{row.getValue("level") as string}</div>
        ),
      },
      {
        accessorKey: "startDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Start Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center w-full">{row.getValue("startDate") as string}</div>
        ),
      },
      {
        accessorKey: "endDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            End Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center w-full">{row.getValue("endDate") as string}</div>
        ),
      },
     {
  accessorKey: "totalHours",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Completed Hours <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const approvedHours = row.original.approvedHours;
        const totalHours = row.getValue("totalHours") as string;
        const isApproved = status === "APPROVED";

        return (
          <div className="text-center w-full">
            {isApproved && approvedHours ? (
              <span className="text-green-600 font-medium">{approvedHours}h</span>
            ) : (
              <span className="text-muted-foreground">{totalHours}h</span>
            )}
          </div>
        );
      },
    },
      {
        accessorKey: "sponsor",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sponsoring Agency <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="text-center w-full">{row.getValue("status") as string}</div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const canUpload = row.original.status === "ENROLLED" || row.original.status === "REJECTED";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setSelectedTrainingId(row.original.trainingId);
                    setDetailsOpen(true);
                  }}
                >
                  View details
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {canUpload ? (
                  <DropdownMenuItem asChild>
                    <a href={`/professional-dev/${row.original.id}/upload-proof`}>
                      Upload proof
                    </a>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled>Upload proof</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumn="title"
        filterPlaceholder="Search trainings..."
        pageSize={10}
        showAddButton={false}
        showDeleteButton={false}
      />

      <PdViewModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        trainingId={selectedTrainingId}
      />
    </>
  );
}
