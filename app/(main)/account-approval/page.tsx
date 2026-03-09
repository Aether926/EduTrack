/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";

import AccessRequestPanel from "@/features/account-approval/components/access-request-panel";

import { Badge } from "@/components/ui/badge";
import { Users, Clock, XCircle, ShieldCheck } from "lucide-react";

const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPERADMIN", "HR"] as const;

export default async function AccessRequestPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    // Role from metadata — zero DB call
    const roleLabel = (user.user_metadata?.role ?? "USER").toString();
    if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

    const admin = createAdminClient();

    const [
        { count: pendingCount },
        { count: rejectedCount },
        { count: totalCount },
    ] = await Promise.all([
        admin.from("User").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
        admin.from("User").select("*", { count: "exact", head: true }).eq("status", "REJECTED"),
        admin.from("User").select("*", { count: "exact", head: true }).in("status", ["PENDING", "REJECTED"]),
    ]);

    const pending = pendingCount ?? 0;
    const rejected = rejectedCount ?? 0;
    const total = totalCount ?? pending + rejected;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3 md:flex-1">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 shrink-0">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Account Approval
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Review and manage user registration requests.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:justify-end">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                            <Badge variant="outline" className="gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {total} total
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 text-amber-400 border-amber-500/30">
                                <Clock className="h-3.5 w-3.5" />
                                {pending} pending
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 text-rose-400 border-rose-500/30">
                                <XCircle className="h-3.5 w-3.5" />
                                {rejected} rejected
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <AccessRequestPanel />
        </div>
    );
}