/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { MyResponsibilitiesClient } from "@/features/responsibilities/components/my-responsibilities-client";

import { ClipboardList, GitPullRequest, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyResponsibilitiesPage() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect("/signin");

    // role badge (use admin client so it works even if RLS is strict)
    const admin = createAdminClient();
    const { data: userRow } = await admin
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .maybeSingle();

    const roleLabel = (userRow?.role ?? "USER").toString();

    const [{ data: responsibilities }, { data: changeRequests }] =
        await Promise.all([
            supabase
                .from("TeacherResponsibility")
                .select("*")
                .eq("teacher_id", auth.user.id)
                .order("created_at", { ascending: false }),
            supabase
                .from("ResponsibilityChangeRequest")
                .select("*")
                .eq("teacher_id", auth.user.id)
                .order("requested_at", { ascending: false }),
        ]);

    const resp = responsibilities ?? [];
    const reqs = changeRequests ?? [];

    const pendingRequests = reqs.filter((r: any) =>
        String(r?.status ?? r?.request_status ?? "")
            .toUpperCase()
            .includes("PENDING"),
    ).length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Left — icon + title */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 shrink-0">
                                <ClipboardList className="h-5 w-5 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    My Responsibilities
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    View and manage your assigned duties and
                                    change requests.
                                </p>
                            </div>
                        </div>

                        {/* Right — role pill */}
                        <div className="flex items-center gap-2">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total responsibilities */}
                <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-4 px-5 py-4">
                        <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 shrink-0">
                            <ClipboardList className="h-4 w-4 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tabular-nums">
                                {resp.length}
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                                Total Responsibilities
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change requests */}
                <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-4 px-5 py-4">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2.5 shrink-0">
                            <GitPullRequest className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tabular-nums">
                                {reqs.length}
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                                Change Requests
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pending requests */}
                <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden sm:col-span-2 lg:col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-4 px-5 py-4">
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 shrink-0">
                            <Clock className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tabular-nums">
                                {pendingRequests}
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                                Pending Requests
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Client UI ── */}
            <MyResponsibilitiesClient
                responsibilities={resp}
                changeRequests={reqs}
            />
        </div>
    );
}
