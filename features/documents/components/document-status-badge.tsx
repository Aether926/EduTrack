import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/features/documents/types/documents";

const CONFIG: Record<DocumentStatus, { label: string; className: string }> = {
    APPROVED: {
        label: "Approved",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    SUBMITTED: {
        label: "Submitted",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    },
    DRAFT: {
        label: "Draft",
        className: "bg-muted/40 text-muted-foreground border-border",
    },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
    const config = CONFIG[status] ?? CONFIG.DRAFT;
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
}
