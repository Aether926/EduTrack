/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

import { getMyDocumentChecklist } from "@/features/documents/actions/document-actions";
import { DocumentsChecklistCard } from "@/features/documents/components/document-checklist-card";

import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect("/signin");

    const { data: me } = await supabase
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .maybeSingle();

    const roleLabel = (me?.role ?? "USER").toString();

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
            {/* header card */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Left — icon + title */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-2.5 shrink-0">
                                <FileText className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    My 201 File
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    View and manage your personal document
                                    submissions.
                                </p>
                            </div>
                        </div>

                        {/* Right — role pill + stat badges */}
                        <div className="flex flex-col gap-2 xl:flex-1 xl:flex-row xl:items-center xl:gap-2 xl:justify-end">
                            <div className="flex gap-2">
                                <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {roleLabel}
                                </span>
                                <Badge variant="outline" className="gap-1.5">
                                    <FileText className="h-3.5 w-3.5" />
                                    {totalItems} item
                                    {totalItems === 1 ? "" : "s"}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Badge
                                    variant="outline"
                                    className="gap-1.5 text-emerald-400 border-emerald-500/30"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {completed} completed
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="gap-1.5 text-teal-400 border-teal-500/30"
                                >
                                    <Clock className="h-3.5 w-3.5" />
                                    {pending} pending
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* existing UI */}
            <DocumentsChecklistCard items={items} />
        </div>
    );
}
