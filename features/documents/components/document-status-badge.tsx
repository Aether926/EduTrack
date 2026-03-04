import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/features/documents/types/documents";

const CONFIG: Record<DocumentStatus, { label: string; className: string }> = {
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800 border-green-300" },
  SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-800 border-blue-300" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-300" },
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600 border-gray-300" },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const config = CONFIG[status] ?? CONFIG.DRAFT;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}