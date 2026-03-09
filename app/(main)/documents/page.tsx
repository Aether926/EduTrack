/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getMyDocumentChecklist } from "@/features/documents/actions/document-actions";
import { DocumentsChecklistCard } from "@/features/documents/components/document-checklist-card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Clock } from "lucide-react";

export const revalidate = 60;

export default async function DocumentsPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const items = await getMyDocumentChecklist();

    const totalItems = items.length;
    const requiredItems = items.filter((it: any) => !!it?.documentType?.required);
    const requiredTotal = requiredItems.length;
    const completed = requiredItems.filter((it: any) => {
        const s = String(it?.submission?.status ?? "").toUpperCase();
        return s === "APPROVED";
    }).length;
    const pending = Math.max(0, requiredTotal - completed);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            <div className="rounded-xl border bg-card p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">My 201 File</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="gap-2">
                            <FileText className="h-3.5 w-3.5" />
                            {totalItems} item{totalItems === 1 ? "" : "s"}
                        </Badge>
                        <Badge variant="secondary" className="gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {completed} completed
                        </Badge>
                        <Badge variant="secondary" className="gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            {pending} pending
                        </Badge>
                    </div>
                </div>
            </div>

            <DocumentsChecklistCard items={items} />
        </div>
    );
}