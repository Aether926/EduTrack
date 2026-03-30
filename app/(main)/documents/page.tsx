/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getMyDocumentChecklist } from "@/features/documents/actions/document-actions";
import { DocumentsChecklistCard } from "@/features/documents/components/document-checklist-card";
import { FileText, CheckCircle2, Clock } from "lucide-react";

export const revalidate = 60;

export default async function DocumentsPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const items = await getMyDocumentChecklist();

    const totalItems = items.length;
    const requiredItems = items.filter(
        (it: any) => !!it?.documentType?.required,
    );
    const requiredTotal = requiredItems.length;
    const completed = requiredItems.filter((it: any) => {
        const s = String(it?.submission?.status ?? "").toUpperCase();
        return s === "APPROVED";
    }).length;
    const pending = Math.max(0, requiredTotal - completed);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Left: icon + title + badge */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-2.5 shrink-0">
                                <FileText className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    My 201 File
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Manage and submit your required document
                                    checklist.
                                </p>
                            </div>
                        </div>

                        {/* Right: stat mini-cards */}
                        <div className="flex gap-2 md:shrink-0">
                            <div className="rounded-lg border border-orange-500/30 bg-card px-3 py-2.5 flex items-center gap-2">
                                <div className="rounded-md border border-orange-500/20 bg-orange-500/10 p-1.5 shrink-0">
                                    <FileText className="h-3.5 w-3.5 text-orange-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">
                                        Items
                                    </div>
                                    <div className="text-xl font-bold text-orange-400 tabular-nums mt-0.5">
                                        {totalItems}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-emerald-500/30 bg-card px-3 py-2.5 flex items-center gap-2">
                                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5 shrink-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">
                                        Completed
                                    </div>
                                    <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
                                        {completed}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-amber-500/30 bg-card px-3 py-2.5 flex items-center gap-2">
                                <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-1.5 shrink-0">
                                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">
                                        Pending
                                    </div>
                                    <div className="text-xl font-bold text-amber-400 tabular-nums mt-0.5">
                                        {pending}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DocumentsChecklistCard items={items} />
        </div>
    );
}
