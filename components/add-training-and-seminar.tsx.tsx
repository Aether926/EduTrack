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
    title: string;
    level: string;
    date: string;
    totalHours: string;
    sponsor: string;
    url: string;
};

// Sample Data
const trainingSeminarData: TrainingSeminar[] = [
    {
        title: "Ley Line Reading",
        level: "Regional",
        date: "2023-07-02",
        totalHours: "6",
        sponsor: "Sumeru Akademiya",
        url: "test",
    },
    {
        title: "Vision Handling Protocols",
        level: "National",
        date: "2023-05-19",
        totalHours: "8",
        sponsor: "Knights of Favonius",
        url: "test",
    },
    {
        title: "Adeptal Contract Basics",
        level: "National",
        date: "2023-09-13",
        totalHours: "7",
        sponsor: "Liyue Qixing",
        url: "test",
    },
    {
        title: "Electro Safety Guidelines",
        level: "Regional",
        date: "2023-06-04",
        totalHours: "5",
        sponsor: "Inazuma Shogunate",
        url: "test",
    },
    {
        title: "Fonta Technology Primer",
        level: "International",
        date: "2023-11-22",
        totalHours: "10",
        sponsor: "Fontaine Research Institute",
        url: "test",
    },
];

const trainingSeminarColumns: ColumnDef<TrainingSeminar>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllRowsSelected() ||
                    (table.getIsSomeRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllRowsSelected(!!value)
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
        accessorKey: "title",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Title
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
        accessorKey: "level",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Level
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-center w-full">{row.getValue("level")}</div>
        ),
    },
    {
        accessorKey: "date",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Date
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-center w-full">{row.getValue("date")}</div>
        ),
    },
    {
        accessorKey: "totalHours",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Total Hours
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-center w-full">
                {row.getValue("totalHours")}
            </div>
        ),
    },
    {
        accessorKey: "sponsor",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Sponsoring Agency
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("sponsor")}</div>,
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
                    <DropdownMenuItem>Accept</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Deny</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function AddTrainingAndSeminar() {
    const handleAdd = (selectedRows: TrainingSeminar[]) => {
        console.log("Added:", selectedRows);
        // Add logic here
    };

    const handleDelete = (selectedRows: TrainingSeminar[]) => {
        console.log("Deleted:", selectedRows);
        // Delete logic here
    };

    return (
        <DataTable
            data={trainingSeminarData}
            columns={trainingSeminarColumns}
            filterColumn="fullname"
            filterPlaceholder="Filter names..."
            pageSize={8}
            showAddButton={true}
            showDeleteButton={true}
            onAddClick={handleAdd}
            onDeleteClick={handleDelete}
            getRowUrl={(row) => row.url}
        />
    );
}
