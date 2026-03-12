/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import { AppointmentHistoryClient } from "@/features/admin-actions/appointment-history/components/appointment-history-client";

import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList } from "lucide-react";

const ALLOWED = new Set(["ADMIN", "PRINCIPAL", "SUPERADMIN"]);

export default async function AppointmentHistoryPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.has(roleLabel)) redirect("/");

    const admin = createAdminClient();

    const [{ data: history }, { data: profiles }] = await Promise.all([
        admin
            .from("AppointmentHistory")
            .select(
                "id, teacher_id, position, appointment_type, start_date, end_date, memo_no, remarks, created_by, created_at, approved_by, approved_at, status, school_id",
            )
            .order("created_at", { ascending: false }),
        admin
            .from("Profile")
            .select("id, firstName, lastName")
            .order("lastName", { ascending: true }),
    ]);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const merged = (history ?? []).map((row: any) => ({
        ...row,
        teacher: profileMap.get(row.teacher_id) ?? null,
    }));

    const teachers = (profiles ?? []).map((p: any) => ({
        id: p.id,
        fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
    }));

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-teal-400/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-2.5 shrink-0">
                                <ClipboardList className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Appointment History
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Track appointment changes and timelines.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                            <Badge variant="outline" className="gap-1.5">
                                <ClipboardList className="h-3.5 w-3.5" />
                                {merged.length} record
                                {merged.length === 1 ? "" : "s"}
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {teachers.length} teacher
                                {teachers.length === 1 ? "" : "s"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
            <AppointmentHistoryClient rows={merged} teachers={teachers} />
        </div>
    );
}
