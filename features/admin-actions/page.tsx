/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import { AdminResponsibilitiesClient } from "@/features/admin-actions/responsibilities/components/admin-responsibility-client";
import { Badge } from "@/components/ui/badge";
import { BookMarked, CheckCircle2, Clock } from "lucide-react";

const ALLOWED = ["ADMIN", "SUPERADMIN" ] as const;

export default async function AdminResponsibilitiesPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "USER").toString();
    if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

    const admin = createAdminClient();

    const { data: responsibilities } = await admin
        .from("TeacherResponsibility")
        .select("*")
        .order("created_at", { ascending: false });

    const teacherIds = [
        ...new Set(
            (responsibilities ?? [])
                .map((r: any) => r.teacher_id)
                .filter(Boolean),
        ),
    ];

    const { data: profiles } = await admin
        .from("Profile")
        .select("id, firstName, lastName, email")
        .in("id", teacherIds.length ? teacherIds : ["__none__"]);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const mergedResponsibilities = (responsibilities ?? []).map((r: any) => ({
        ...r,
        teacher: profileMap.get(r.teacher_id) ?? null,
    }));

    const { data: changeRequests } = await admin
        .from("ResponsibilityChangeRequest")
        .select("*")
        .order("requested_at", { ascending: false });

    const crTeacherIds = [
        ...new Set(
            (changeRequests ?? [])
                .map((r: any) => r.teacher_id)
                .filter(Boolean),
        ),
    ];
    const crRespIds = [
        ...new Set(
            (changeRequests ?? [])
                .map((r: any) => r.responsibility_id)
                .filter(Boolean),
        ),
    ];

    const [{ data: crProfiles }, { data: respTitles }] = await Promise.all([
        admin
            .from("Profile")
            .select("id, firstName, lastName, email")
            .in("id", crTeacherIds.length ? crTeacherIds : ["__none__"]),
        admin
            .from("TeacherResponsibility")
            .select("id, title")
            .in("id", crRespIds.length ? crRespIds : ["__none__"]),
    ]);

    const crProfileMap = new Map((crProfiles ?? []).map((p: any) => [p.id, p]));
    const respTitleMap = new Map((respTitles ?? []).map((r: any) => [r.id, r]));

    const mergedChangeRequests = (changeRequests ?? []).map((r: any) => ({
        ...r,
        teacher: crProfileMap.get(r.teacher_id) ?? null,
        responsibility: respTitleMap.get(r.responsibility_id) ?? null,
    }));

    const teachers = (profiles ?? []).map((p: any) => ({
        id: p.id,
        fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
    }));

    const total = mergedResponsibilities.length;
    const active = mergedResponsibilities.filter(
        (r: any) => r.status === "ACTIVE",
    ).length;
    const pending = mergedChangeRequests.filter(
        (r: any) => r.status === "PENDING",
    ).length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Header ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-400/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 shrink-0">
                                <BookMarked className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Academic Responsibilities
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Assign coordinator roles and other duties.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                            <Badge variant="outline" className="gap-1.5">
                                <BookMarked className="h-3.5 w-3.5" />
                                {total} assigned
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {active} active
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {pending} pending
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <AdminResponsibilitiesClient
                responsibilities={mergedResponsibilities}
                changeRequests={mergedChangeRequests}
                teachers={teachers}
            />
        </div>
    );
}
