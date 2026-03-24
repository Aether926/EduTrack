/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getPendingProofs } from "@/features/admin-actions/proof-review/lib/queries";
import ProofReviewTable from "@/features/admin-actions/proof-review/components/proof-review-table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileCheck, XCircle } from "lucide-react";

const ALLOWED = ["ADMIN", "SUPERADMIN"] as const;

export default async function ProofReviewPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

    const rows = (await getPendingProofs()) ?? [];
    const pending = rows.filter((r: any) => r.status === "PENDING").length;
    const approved = rows.filter((r: any) => r.status === "APPROVED").length;
    const rejected = rows.filter((r: any) => r.status === "REJECTED").length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">
            {/* ── Gradient header card ── */}
            <div className="relative rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* Gradient backdrop */}
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                <div className="relative px-5 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: icon + title */}
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-3 shrink-0">
                            <FileCheck className="h-5 w-5 text-fuchsia-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl font-semibold tracking-tight">
                                    Proof Review
                                </h1>
                                <Badge variant="secondary" className="text-xs">
                                    {roleLabel}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Review and approve teacher training proof
                                submissions.
                            </p>
                        </div>
                    </div>

                    {/* Right: stat chips */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5">
                            <Clock className="h-3.5 w-3.5 text-yellow-400" />
                            <span className="text-xs font-semibold text-yellow-400 tabular-nums">
                                {pending}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                pending
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400 tabular-nums">
                                {approved}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                approved
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5">
                            <XCircle className="h-3.5 w-3.5 text-red-400" />
                            <span className="text-xs font-semibold text-red-400 tabular-nums">
                                {rejected}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                rejected
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="min-w-0">
                <ProofReviewTable rows={rows} />
            </div>
        </div>
    );
}
