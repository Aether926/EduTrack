/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { HRQueueClient } from "@/features/admin-actions/queue/components/queue-client";
import { ListChecks, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ALLOWED_ROLES = [
    "ADMIN",
    "HR_ADMIN",
    "PRINCIPAL",
    "SUPERADMIN",
    "HR",
] as const;

export default async function AdminQueuePage() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect("/signin");

    const admin = createAdminClient();
    const { data: viewer } = await admin
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .maybeSingle();

    const roleLabel = (viewer?.role ?? "USER").toString();
    if (!ALLOWED_ROLES.includes(roleLabel as any)) redirect("/dashboard");

    // ── Employment / ProfileHR ──
    const { data: hrRequests } = await admin
        .from("ProfileHRChangeRequest")
        .select("*")
        .order("requested_at", { ascending: false });

    const hrTeacherIds = [
        ...new Set((hrRequests ?? []).map((r: any) => r.teacher_id)),
    ];
    const { data: hrProfiles } = await admin
        .from("Profile")
        .select("id, firstName, lastName, email")
        .in("id", hrTeacherIds.length ? hrTeacherIds : ["__none__"]);

    const hrProfileMap = new Map((hrProfiles ?? []).map((p: any) => [p.id, p]));
    const mergedHR = (hrRequests ?? []).map((r: any) => ({
        ...r,
        teacher: hrProfileMap.get(r.teacher_id) ?? null,
    }));

    // ── Appointment ──
    const { data: apptRequests } = await admin
        .from("AppointmentChangeRequest")
        .select("*")
        .order("requested_at", { ascending: false });

    const apptTeacherIds = [
        ...new Set((apptRequests ?? []).map((r: any) => r.teacher_id)),
    ];
    const { data: apptProfiles } = await admin
        .from("Profile")
        .select("id, firstName, lastName, email")
        .in("id", apptTeacherIds.length ? apptTeacherIds : ["__none__"]);

    const apptProfileMap = new Map(
        (apptProfiles ?? []).map((p: any) => [p.id, p]),
    );
    const mergedAppt = (apptRequests ?? []).map((r: any) => ({
        ...r,
        teacher: apptProfileMap.get(r.teacher_id) ?? null,
    }));

    // ── Responsibility ──
    const { data: respRequests } = await admin
        .from("ResponsibilityChangeRequest")
        .select("*")
        .order("requested_at", { ascending: false });

    const respTeacherIds = [
        ...new Set((respRequests ?? []).map((r: any) => r.teacher_id)),
    ];
    const { data: respProfiles } = await admin
        .from("Profile")
        .select("id, firstName, lastName, email")
        .in("id", respTeacherIds.length ? respTeacherIds : ["__none__"]);

    const respProfileMap = new Map(
        (respProfiles ?? []).map((p: any) => [p.id, p]),
    );
    const mergedResp = (respRequests ?? []).map((r: any) => ({
        ...r,
        teacher: respProfileMap.get(r.teacher_id) ?? null,
    }));

    const totalRequests =
        mergedHR.length + mergedAppt.length + mergedResp.length;

    const totalPending =
        mergedHR.filter((r: any) => r.status === "PENDING").length +
        mergedAppt.filter((r: any) => r.status === "PENDING").length +
        mergedResp.filter((r: any) => r.status === "PENDING").length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header — blue theme matching account-approval pattern ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3 md:flex-1">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2.5 shrink-0">
                                <ListChecks className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    HR Queue
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Review and approve HR change requests from
                                    teachers.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:justify-end">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                            <Badge variant="outline" className="gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {totalRequests} total
                            </Badge>
                            <Badge
                                variant="outline"
                                className="gap-1.5 text-amber-400 border-amber-500/30"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                {totalPending} pending
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <HRQueueClient
                hrRequests={mergedHR}
                apptRequests={mergedAppt}
                respRequests={mergedResp}
            />
        </div>
    );
}
