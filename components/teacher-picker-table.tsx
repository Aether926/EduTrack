"use client";

import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TeacherTableRow } from "@/lib/user";

export default function TeacherPickerTable({
  data,
  onAssign,
}: {
  data: TeacherTableRow[];
  onAssign: (rows: TeacherTableRow[]) => void;
}) {
  const cols: ColumnDef<TeacherTableRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllRowsSelected()
              ? true
              : table.getIsSomeRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
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
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Employee ID <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("employeeid")}</div>,
    },
    {
      accessorKey: "fullname",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Full Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const fullname = row.getValue("fullname") as string;
        const profileImage = row.original.profileImage;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImage || undefined} />
              <AvatarFallback>
                {fullname ? fullname.split(" ").map((n) => n[0]).join("") : "T"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{fullname}</span>
          </div>
        );
      },
    },
    { accessorKey: "position", header: "Position" },
    { accessorKey: "contact", header: "Contact" },
    { accessorKey: "email", header: "Email" },
  ];

  return (
    <DataTable
      data={data}
      columns={cols}
      filterColumn="fullname"
      filterPlaceholder="Search teachers..."
      pageSize={10}
      showAddButton={true}
      showDeleteButton={false}
      onAddClick={onAssign}
    />
  );
}
