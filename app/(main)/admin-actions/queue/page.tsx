/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import { HRQueueClient } from "@/features/admin-actions/queue/components/queue-client";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, BookMarked, ClipboardList } from "lucide-react";

const ALLOWED_ROLES = new Set([
    "ADMIN",
    "HR_ADMIN",
    "PRINCIPAL",
    "SUPERADMIN",
    "HR",
]);

export default async function AdminQueuePage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "USER").toString();
    if (!ALLOWED_ROLES.has(roleLabel)) redirect("/dashboard");

    const admin = createAdminClient();

    const [
        { data: hrRequests },
        { data: apptRequests },
        { data: respRequests },
    ] = await Promise.all([
        admin
            .from("ProfileHRChangeRequest")
            .select("*")
            .order("requested_at", { ascending: false }),
        admin
            .from("AppointmentChangeRequest")
            .select("*")
            .order("requested_at", { ascending: false }),
        admin
            .from("ResponsibilityChangeRequest")
            .select("*")
            .order("requested_at", { ascending: false }),
    ]);

    const allTeacherIds = [
        ...new Set([
            ...(hrRequests ?? []).map((r: any) => r.teacher_id),
            ...(apptRequests ?? []).map((r: any) => r.teacher_id),
            ...(respRequests ?? []).map((r: any) => r.teacher_id),
        ]),
    ];

    const { data: profiles } = allTeacherIds.length
        ? await admin
              .from("Profile")
              .select("id, firstName, lastName, email")
              .in("id", allTeacherIds)
        : { data: [] };

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const merge = (rows: any[]) =>
        rows.map((r) => ({
            ...r,
            teacher: profileMap.get(r.teacher_id) ?? null,
        }));

    const mergedHR = merge(hrRequests ?? []);
    const mergedAppt = merge(apptRequests ?? []);
    const mergedResp = merge(respRequests ?? []);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Header ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-400/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2.5 shrink-0">
                                <ClipboardList className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    HR Change Requests
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Review and approve employment info change
                                    requests.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                            <Badge variant="outline" className="gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {mergedHR.length} employments
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" />
                                {mergedAppt.length} appointments
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <BookMarked className="h-3.5 w-3.5" />
                                {mergedResp.length} responsibilities
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
