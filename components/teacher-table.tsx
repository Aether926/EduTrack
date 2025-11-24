"use client";

import PaginationBar from "./pagination";
import { useRouter } from "next/navigation";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const data: DataSet[] = [
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

export type DataSet = {
    employeeid: string;
    fullname: string;
    position: string;
    contact: string;
    email: string;
    url: string;
};

export const columns: ColumnDef<DataSet>[] = [
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
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Employee Id
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div>{row.getValue("employeeid")}</div>,
    },
    {
        accessorKey: "fullname",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Full Name
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div>{row.getValue("fullname")}</div>,
    },
    {
        accessorKey: "position",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Position
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div>{row.getValue("position")}</div>,
    },
    {
        accessorKey: "contact",
        header: () => {
            return <div>Contact Number</div>;
        },
        cell: ({ row }) => <div>{row.getValue("contact")}</div>,
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Email
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="lowercase">{row.getValue("email")}</div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: () => {
            return (
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
            );
        },
    },
];

export function DataTable() {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const handleRowClick = (url: string, event: React.MouseEvent) => {
        // Don't navigate if clicking on checkbox or action menu
        const target = event.target as HTMLElement;
        if (
            target.closest("button") ||
            target.closest('[role="checkbox"]') ||
            target.closest('input[type="checkbox"]')
        ) {
            return;
        }
        router.push(url);
    };

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        initialState: {
            //Row limiter per page
            pagination: {
                pageSize: 8,
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="flex justify-center text-3xl font-semibold mt-4">
                Teacher Profiles
            </div>
            <div className="flex-1">
                <div className="flex items-center py-2">
                    <div className="flex flex-row">
                        <div className="relative max-w-sm pr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Filter names..."
                                value={
                                    (table
                                        .getColumn("fullname")
                                        ?.getFilterValue() as string) ?? ""
                                }
                                onChange={(event) =>
                                    table
                                        .getColumn("fullname")
                                        ?.setFilterValue(event.target.value)
                                }
                                className="max-w-sm pl-10 pr-4 mr-20"
                            />
                        </div>
                        {table.getFilteredSelectedRowModel().rows.length >
                            1 && (
                            <Button className="mr-2 !bg-red-700 !text-white hover:!bg-red-800">
                                Delete
                            </Button>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() && "selected"
                                        }
                                        onClick={(e) =>
                                            handleRowClick(row.original.url, e)
                                        }
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="sticky bottom-0 bg-background border-t py-4 z-10 mt-auto">
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                    <div className="text-muted-foreground text-sm mr-auto">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                    </div>
                    <div className="md:absolute md:left-1/2 md:-translate-x-1/2">
                        <PaginationBar table={table} />
                    </div>
                </div>
            </div>
        </div>
    );
}
