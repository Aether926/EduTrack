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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ActivitySummaryProps {
    items: {
        type: string;
        title: string;
    }[];
}

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
        employeeid: "EID-2024011523",
        fullname: "Maria Angelica Reyes",
        position: "Senior High School Teacher II",
        contact: "09171234567",
        email: "mareyes@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023082944",
        fullname: "John Carlo D. Santos",
        position: "ICT Coordinator",
        contact: "09183456712",
        email: "jcsantos@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023100879",
        fullname: "Louise Anne T. Cruz",
        position: "Guidance Counselor",
        contact: "09281234567",
        email: "lacruz@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2022125648",
        fullname: "Patrick Joseph Mendoza",
        position: "Administrative Assistant II",
        contact: "09061239876",
        email: "pjmendoza@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2024053121",
        fullname: "Kimberly Joy Flores",
        position: "Master Teacher I",
        contact: "09351236789",
        email: "kjflores@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023072298",
        fullname: "Edison Mark Villanueva",
        position: "Registrar",
        contact: "09981234567",
        email: "emvillanueva@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2024119085",
        fullname: "Rowena Grace Manlangit",
        position: "School Nurse",
        contact: "09194567234",
        email: "rgmanlangit@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023067801",
        fullname: "Geraldine Rose Caballero",
        position: "Teacher III",
        contact: "09182345678",
        email: "grcaballero@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023091567",
        fullname: "Michael Angelo Bautista",
        position: "Teacher I",
        contact: "09175674321",
        email: "mabautista@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023114588",
        fullname: "Sophia Mae L. Tan",
        position: "Teacher II",
        contact: "09273458901",
        email: "smtan@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2022109345",
        fullname: "Christian Dale Ramos",
        position: "Science Coordinator",
        contact: "09162347985",
        email: "cdramos@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023038741",
        fullname: "Hannah Joy Perez",
        position: "English Department Head",
        contact: "09354781239",
        email: "hjperez@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023078812",
        fullname: "Ronald James F. Vergara",
        position: "Teacher III",
        contact: "09198745231",
        email: "rjfvergara@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2022056893",
        fullname: "Lara Beatrice Gomez",
        position: "Kinder Teacher",
        contact: "09285732145",
        email: "lbgomez@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2024021655",
        fullname: "Neil Joseph D. Mercado",
        position: "Math Teacher II",
        contact: "09174239856",
        email: "njdmercado@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023048793",
        fullname: "Jasmin Rose L. Dela Cruz",
        position: "Filipino Teacher I",
        contact: "09263578124",
        email: "jrdcruz@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023119004",
        fullname: "Francis Adrian Tolentino",
        position: "MAPEH Teacher",
        contact: "09384751290",
        email: "fatolentino@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2022047219",
        fullname: "Cheska Divine Uy",
        position: "Teacher I",
        contact: "09189453217",
        email: "cduy@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023095562",
        fullname: "Harold Vincent M. Ramos",
        position: "Araling Panlipunan Teacher",
        contact: "09173489421",
        email: "hvmramos@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023123499",
        fullname: "Nico Andrew S. Villafuerte",
        position: "Teacher II",
        contact: "09357812490",
        email: "nasvillafuerte@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2021078832",
        fullname: "Sheila Marie O. Padilla",
        position: "Master Teacher II",
        contact: "09283475621",
        email: "smopadilla@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2020045691",
        fullname: "Jerome Paolo B. Enriquez",
        position: "School Clerk",
        contact: "09174839201",
        email: "jpenriquez@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2022114584",
        fullname: "Alyssa Grace T. Andrade",
        position: "Grade 3 Teacher",
        contact: "09346572189",
        email: "agandrade@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2022129855",
        fullname: "Darren Cole Javier",
        position: "Teacher I",
        contact: "09167345218",
        email: "dcjavier@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023016720",
        fullname: "Gwyneth Maureen C. Ramos",
        position: "SPED Teacher",
        contact: "09284567123",
        email: "gmcramos@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2021089981",
        fullname: "Nathaniel James U. Concepcion",
        position: "Administrative Assistant I",
        contact: "09984567213",
        email: "njconcepcion@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023110092",
        fullname: "Maricar Hazel M. Legaspi",
        position: "Librarian",
        contact: "09187645210",
        email: "mhlegaspi@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2024092211",
        fullname: "Oscar Benjamin T. Laurel",
        position: "Principal II",
        contact: "09289451237",
        email: "oblaurel@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023105542",
        fullname: "Diana Rose P. Balagtas",
        position: "Assistant Principal",
        contact: "09175823904",
        email: "drbalagtas@school.edu.ph",
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
