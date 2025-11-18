"use client";

import { redirect } from "next/navigation";
import { DropdownMenuItem } from "./ui/dropdown-menu";

interface Props {
    path: string;
    children: React.ReactNode;
}

export default function FooterRedirect({ path, children }: Props) {
    return (
        <DropdownMenuItem onClick={() => redirect(path)}>
            <span>{children}</span>
        </DropdownMenuItem>
    );
}
