import { ReactNode } from "react";

export type ApprovalCategoryConfig = {
    /** Display name shown on the index card */
    label: string;
    /** Short description shown under the label */
    description: string;
    /** Icon element (lucide-react recommended) */
    icon: ReactNode;
    /** Tailwind classes for the icon container background */
    iconBg: string;
    /** Slug used for the drill-down route, e.g. "position-designation" */
    slug: string;
    /** Live pending count — fetch from Supabase in your page, pass in via registry */
    pendingCount: number;
    /** Live approved count */
    approvedCount: number;
    /** Live rejected count */
    rejectedCount: number;
};
