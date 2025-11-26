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
        employeeid: "EID-2018456792",
        fullname: "Amber",
        position: "Outrider",
        contact: "09123456789",
        email: "amber@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019123401",
        fullname: "Xingqiu",
        position: "Feiyun Guild Heir",
        contact: "09123456789",
        email: "xingqiu@example.com",
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
        employeeid: "EID-2018902315",
        fullname: "Barbara",
        position: "Deaconess & Idol",
        contact: "09123456789",
        email: "barbara@example.com",
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

    {
        employeeid: "EID-2018770042",
        fullname: "Albedo",
        position: "Chief Alchemist",
        contact: "09123456789",
        email: "albedo@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2024459987",
        fullname: "Klee",
        position: "Explosives Expert",
        contact: "09123456789",
        email: "klee@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2018760043",
        fullname: "Diluc",
        position: "Dawn Winery Owner",
        contact: "09123456789",
        email: "diluc@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2022441123",
        fullname: "Venti",
        position: "Bard",
        contact: "09123456789",
        email: "venti@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019231145",
        fullname: "Lisa",
        position: "Librarian",
        contact: "09123456789",
        email: "lisa@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2021550042",
        fullname: "Eula",
        position: "Spindrift Knight",
        contact: "09123456789",
        email: "eula@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2021213489",
        fullname: "Rosaria",
        position: "Sister of the Church",
        contact: "09123456789",
        email: "rosaria@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019880033",
        fullname: "Kaeya",
        position: "Cavalry Captain",
        contact: "09123456789",
        email: "kaeya@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019981124",
        fullname: "Sucrose",
        position: "Bio-Alchemist",
        contact: "09123456789",
        email: "sucrose@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023459871",
        fullname: "Mona",
        position: "Astrologist",
        contact: "09123456789",
        email: "mona@example.com",
        url: "test",
    },

    {
        employeeid: "EID-2023881221",
        fullname: "Chongyun",
        position: "Exorcist",
        contact: "09123456789",
        email: "chongyun@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019450011",
        fullname: "Beidou",
        position: "Crux Fleet Captain",
        contact: "09123456789",
        email: "beidou@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023331129",
        fullname: "Xiangling",
        position: "Chef",
        contact: "09123456789",
        email: "xiangling@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023112290",
        fullname: "Yae Miko",
        position: "Guuji / Editor",
        contact: "09123456789",
        email: "yae@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2022775411",
        fullname: "Zhongli",
        position: "Consultant",
        contact: "09123456789",
        email: "zhongli@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023991240",
        fullname: "Tartaglia",
        position: "Fatui Harbinger",
        contact: "09123456789",
        email: "childe@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2024221182",
        fullname: "Gorou",
        position: "General",
        contact: "09123456789",
        email: "gorou@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2021445789",
        fullname: "Shenhe",
        position: "Adepti Disciple",
        contact: "09123456789",
        email: "shenhe@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019332201",
        fullname: "Alhaitham",
        position: "Scribe",
        contact: "09123456789",
        email: "alhaitham@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2019442219",
        fullname: "Cyno",
        position: "General Mahamatra",
        contact: "09123456789",
        email: "cyno@example.com",
        url: "test",
    },

    {
        employeeid: "EID-2024120012",
        fullname: "Kazuha",
        position: "Wanderer",
        contact: "09123456789",
        email: "kazuha@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2018662033",
        fullname: "Yoimiya",
        position: "Fireworks Artist",
        contact: "09123456789",
        email: "yoimiya@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2020028891",
        fullname: "Tighnari",
        position: "Forest Watcher",
        contact: "09123456789",
        email: "tighnari@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2020221190",
        fullname: "Collei",
        position: "Ranger Trainee",
        contact: "09123456789",
        email: "collei@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023342229",
        fullname: "Wriothesley",
        position: "Fortress Administrator",
        contact: "09123456789",
        email: "wriothesley@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2021002219",
        fullname: "Freminet",
        position: "Diver",
        contact: "09123456789",
        email: "freminet@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2029781211",
        fullname: "Lyney",
        position: "Magician",
        contact: "09123456789",
        email: "lyney@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2024556671",
        fullname: "Lynette",
        position: "Assistant Magician",
        contact: "09123456789",
        email: "lynette@example.com",
        url: "test",
    },

    {
        employeeid: "EID-2021114451",
        fullname: "Charlotte",
        position: "Journalist",
        contact: "09123456789",
        email: "charlotte@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023447281",
        fullname: "Baizhu",
        position: "Doctor",
        contact: "09123456789",
        email: "baizhu@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2017221982",
        fullname: "Dehya",
        position: "Desert Mercenary",
        contact: "09123456789",
        email: "dehya@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2020017882",
        fullname: "Yoimiya",
        position: "Fireworks Artist",
        contact: "09123456789",
        email: "yoimiya@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2025547782",
        fullname: "Layla",
        position: "Student",
        contact: "09123456789",
        email: "layla@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2024890032",
        fullname: "Diona",
        position: "Bartender",
        contact: "09123456789",
        email: "diona@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2015544721",
        fullname: "Razor",
        position: "Wolf Boy",
        contact: "09123456789",
        email: "razor@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2023110038",
        fullname: "Heizou",
        position: "Detective",
        contact: "09123456789",
        email: "heizou@example.com",
        url: "test",
    },

    {
        employeeid: "EID-2024441882",
        fullname: "Noelle",
        position: "Maid Knight",
        contact: "09123456789",
        email: "noelle@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2014451122",
        fullname: "Ningguang",
        position: "Tianquan",
        contact: "09123456789",
        email: "ningguang@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2022122444",
        fullname: "Beidou",
        position: "Crux Captain",
        contact: "09123456789",
        email: "beidou@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2020022211",
        fullname: "Kuki Shinobu",
        position: "Deputy Leader",
        contact: "09123456789",
        email: "shinobu@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2022991141",
        fullname: "Arlecchino",
        position: "Fatui Harbinger",
        contact: "09123456789",
        email: "arlecchino@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2024199911",
        fullname: "Sethos",
        position: "Eremite Shooter",
        contact: "09123456789",
        email: "sethos@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2024881925",
        fullname: "Gaming",
        position: "Courier Rider",
        contact: "09123456789",
        email: "gaming@example.com",
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
