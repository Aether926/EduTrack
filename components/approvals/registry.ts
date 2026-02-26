import { LayoutList } from "lucide-react";
import { createElement } from "react";
import { ApprovalCategoryConfig } from "./category-type";

// Pending categories shown on /principal-actions/pending-approval
export const PENDING_CATEGORIES: ApprovalCategoryConfig[] = [
    {
        label: "Position / Designation",
        description: "Requests to add, edit, delete, or reorder positions.",
        icon: createElement(LayoutList, { className: "h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" }),
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        slug: "position-designation",
        pendingCount: 4,   // TODO: replace with live Supabase count
        approvedCount: 0,
        rejectedCount: 0,
    },
    // Add more entries here ↓
];

// Recently reviewed categories shown on /principal-actions/recently-approved
export const RECENTLY_CATEGORIES: ApprovalCategoryConfig[] = [
    {
        label: "Position / Designation",
        description: "History of approved and rejected position change requests.",
        icon: createElement(LayoutList, { className: "h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" }),
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        slug: "position-designation",
        pendingCount: 0,
        approvedCount: 3,  // TODO: replace with live Supabase count
        rejectedCount: 1,
    },
    // Add more entries here ↓
];