/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getPendingProofs } from "@/features/proof-review/lib/queries";
import ProofReviewTable from "@/features/proof-review/components/proof-review-table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPERADMIN", "HR"] as const;

export default async function ProofReviewPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

    const rows = (await getPendingProofs()) ?? [];
    const pending  = rows.filter((r: any) => r.status === "PENDING").length;
    const approved = rows.filter((r: any) => r.status === "APPROVED").length;
    const rejected = rows.filter((r: any) => r.status === "REJECTED").length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{roleLabel}</Badge>
                    <Badge variant="outline">Proof Review</Badge>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Proof Review</h1>
                        <p className="text-sm text-muted-foreground mt-1">Review and approve teacher training proof submissions.</p>
                    </div>
                    <div className="flex flex-col [@media(min-width:360px)]:flex-row gap-2">
                        <div className="rounded-lg border border-yellow-500/30 bg-card px-3 py-2.5 flex items-center gap-2 [@media(min-width:360px)]:flex-1 min-w-0">
                            <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-1.5 shrink-0">
                                <Clock className="h-3.5 w-3.5 text-yellow-400" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] text-muted-foreground leading-none">Pending</div>
                                <div className="text-xl font-bold text-yellow-400 tabular-nums mt-0.5">{pending}</div>
                            </div>
                        </div>
                        <div className="flex gap-2 [@media(min-width:360px)]:contents">
                            <div className="rounded-lg border border-emerald-500/30 bg-card px-3 py-2.5 flex items-center gap-2 flex-1 min-w-0">
                                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5 shrink-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">Approved</div>
                                    <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">{approved}</div>
                                </div>
                            </div>
                            <div className="rounded-lg border border-red-500/30 bg-card px-3 py-2.5 flex items-center gap-2 flex-1 min-w-0">
                                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-1.5 shrink-0">
                                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">Rejected</div>
                                    <div className="text-xl font-bold text-red-400 tabular-nums mt-0.5">{rejected}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="min-w-0">
                <ProofReviewTable rows={rows} />
            </div>
        </div>
    );
}