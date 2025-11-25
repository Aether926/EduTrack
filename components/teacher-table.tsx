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

export type Teacher = {
    employeeid: string;
    fullname: string;
    position: string;
    contact: string;
    email: string;
    url: string;
};

// Sample Data
const teacherData: Teacher[] = [
    {
        employeeid: "EID-2023456711",
        fullname: "Hu Tao",
        position: "Funeral Director",
        contact: "09123456789",
        email: "hutao@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2021678944",
        fullname: "Jean",
        position: "Acting Grand Master",
        contact: "09123456789",
        email: "jean@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019567328",
        fullname: "Clorinde",
        position: "Champion Duelist",
        contact: "09123456789",
        email: "clorinde@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2024891567",
        fullname: "Raiden Shogun",
        position: "Electro Archon",
        contact: "09123456789",
        email: "raiden@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2018456792",
        fullname: "Amber",
        position: "Outrider",
        contact: "09123456789",
        email: "amber@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2022345598",
        fullname: "Yelan",
        position: "Intelligence Agent",
        contact: "09123456789",
        email: "yelan@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019786412",
        fullname: "Faruzan",
        position: "Machinist Scholar",
        contact: "09123456789",
        email: "faruzan@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019235784",
        fullname: "Ayaka",
        position: "Shirasagi Princess",
        contact: "09123456789",
        email: "ayaka@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023789415",
        fullname: "Skirk",
        position: "Swordmaster Mentor",
        contact: "09123456789",
        email: "skirk@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2018346791",
        fullname: "Keqing",
        position: "Qixing Yuheng",
        contact: "09123456789",
        email: "keqing@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019456123",
        fullname: "Ganyu",
        position: "Qixing Secretary",
        contact: "09123456789",
        email: "ganyu@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023678942",
        fullname: "Navia",
        position: "Spina di Rosula Leader",
        contact: "09123456789",
        email: "navia@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2018135794",
        fullname: "Xianyun",
        position: "Adeptus Advisor",
        contact: "09123456789",
        email: "xianyun@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023789124",
        fullname: "Citlali",
        position: "Priestess",
        contact: "09123456789",
        email: "citlali@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019347856",
        fullname: "Yanfei",
        position: "Legal Advisor",
        contact: "09123456789",
        email: "yanfei@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023124679",
        fullname: "Nilou",
        position: "Star Dancer",
        contact: "09123456789",
        email: "nilou@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2018893457",
        fullname: "Nefer",
        position: "Beast Handler",
        contact: "09123456789",
        email: "nefer@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2024123589",
        fullname: "Furina",
        position: "Opera Performer",
        contact: "09123456789",
        email: "furina@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019224578",
        fullname: "Chiori",
        position: "Fashion Designer",
        contact: "09123456789",
        email: "chiori@example.com",
        url: "test",
    },
];

const teacherColumns: ColumnDef<Teacher>[] = [
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
        accessorKey: "employeeid",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Employee Id
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("employeeid")}</div>,
    },
    {
        accessorKey: "fullname",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Full Name
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("fullname")}</div>,
    },
    {
        accessorKey: "position",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Position
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("position")}</div>,
    },
    {
        accessorKey: "contact",
        header: () => <div>Contact Number</div>,
        cell: ({ row }) => <div>{row.getValue("contact")}</div>,
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Email
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="lowercase">{row.getValue("email")}</div>
        ),
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
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function TeacherTable() {
    const handleDelete = (selectedRows: Teacher[]) => {
        console.log("Deleting:", selectedRows);
        // Implement your delete logic here
    };

    return (
        <DataTable
            data={teacherData}
            columns={teacherColumns}
            filterColumn="fullname"
            filterPlaceholder="Filter names..."
            pageSize={8}
            showDeleteButton={true}
            onDeleteClick={handleDelete}
            getRowUrl={(row) => row.url}
        />
    );
}
