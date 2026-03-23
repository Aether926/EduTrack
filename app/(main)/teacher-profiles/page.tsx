/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TeacherTable from "@/app/(main)/teacher-profiles/component/teacher-table";
import type { TeacherTableRow } from "@/lib/user";

import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui-elements/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function TeacherProfilesPage() {
    const [userRole, setUserRole] = useState<"ADMIN" | "TEACHER" | null>(null);
    const [teachers, setTeachers] = useState<TeacherTableRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            const { data } = await supabase.auth.getUser();
            const authUser = data.user;

            if (!authUser) {
                setTeachers([]);
                setLoading(false);
                return;
            }

            const { data: userRow, error: userErr } = await supabase
                .from("User")
                .select("role,status")
                .eq("id", authUser.id)
                .maybeSingle();

            if (userErr) {
                toast.error("Error loading user session.");
                setTeachers([]);
                setLoading(false);
                return;
            }

            if (userRow) setUserRole(userRow.role as "ADMIN" | "TEACHER");

            if (!userRow || userRow.status !== "APPROVED") {
                setTeachers([]);
                setLoading(false);
                return;
            }

            const { data: profiles, error } = await supabase
                .from("Profile")
                .select(
                    `
                    *,
                    User!inner (
                        status,
                        role
                    )
                `,
                )
                .eq("User.status", "APPROVED")
                .eq("User.role", "TEACHER")
                .order("lastName", { ascending: true });

            if (error) {
                toast.error("Error fetching teachers.");
                setTeachers([]);
                setLoading(false);
                return;
            }

            const profileIds = (profiles ?? []).map((p: any) => p.id);
            const { data: hrProfiles } = await supabase
                .from("ProfileHR")
                .select("id, employeeId, position")
                .in("id", profileIds);

            const hrMap = new Map(
                (hrProfiles ?? []).map((hr: any) => [hr.id, hr]),
            );

            const tableData: TeacherTableRow[] = (profiles ?? [])
                .filter((profile: any) => profile.id !== authUser.id)
                .map((profile: any) => {
                    const hr = hrMap.get(profile.id);
                    return {
                        id: profile.id,
                        employeeid: hr?.employeeId || "N/A",
                        fullname: `${profile.firstName} ${
                            profile.middleInitial
                                ? profile.middleInitial.replace(/\.+$/, "") +
                                  ". "
                                : ""
                        }${profile.lastName}`,
                        position: hr?.position || "N/A",
                        contact: profile.contactNumber || "N/A",
                        email: profile.email,
                        profileImage: profile.profileImage || null,
                        status: profile.User.status,
                        subjectSpecialization:
                            profile.subjectSpecialization || null,
                        emergencyName: profile.emergencyName || null,
                        emergencyContact: profile.emergencyTelephoneNo || null,
                        privacySettings: profile.privacySettings || null,
                    };
                });

            setTeachers(tableData);
            setLoading(false);
        };

        loadData();
    }, []);

    const stats = useMemo(() => {
        const total = teachers.length;
        const approved = teachers.filter((t) => t.status === "APPROVED").length;
        return { total, approved };
    }, [teachers]);

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
                {/* ── Header skeleton ── */}
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-32 rounded-full" />
                                </div>
                                <Skeleton className="h-3.5 w-56" />
                            </div>
                        </div>
                        <div className="flex gap-2 md:shrink-0">
                            <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2 min-w-[110px]">
                                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                                <div className="space-y-1">
                                    <Skeleton className="h-2.5 w-8" />
                                    <Skeleton className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2 min-w-[110px]">
                                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                                <div className="space-y-1">
                                    <Skeleton className="h-2.5 w-14" />
                                    <Skeleton className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Table skeleton ── */}
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/60">
                        <Skeleton className="h-9 w-64 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-border/60 bg-muted/30">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-3.5 w-28" />
                    </div>
                    <div className="divide-y divide-border/60">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-4 gap-4 px-5 py-3.5 items-center"
                            >
                                <Skeleton className="h-4 w-16" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-16 rounded-md" />
                            <Skeleton className="h-8 w-16 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2.5 shrink-0">
                                <Users className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                        Teachers
                                    </h1>
                                    <RoleBadge
                                        role={(
                                            userRole ?? "TEACHER"
                                        ).toLowerCase()}
                                        size="xs"
                                    />
                                    <Badge
                                        variant="outline"
                                        className="text-[11px]"
                                    >
                                        Teacher Profiles
                                    </Badge>
                                </div>
                                <p className="text-[13px] text-muted-foreground">
                                    Directory of all approved teaching staff.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 md:shrink-0">
                            <div className="rounded-lg border border-blue-500/30 bg-card px-3 py-2.5 flex items-center gap-2 min-w-[110px]">
                                <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-1.5 shrink-0">
                                    <Users className="h-3.5 w-3.5 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">
                                        Total
                                    </div>
                                    <div className="text-xl font-bold text-blue-400 tabular-nums mt-0.5">
                                        {stats.total}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-emerald-500/30 bg-card px-3 py-2.5 flex items-center gap-2 min-w-[110px]">
                                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5 shrink-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">
                                        Approved
                                    </div>
                                    <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
                                        {stats.approved}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="min-w-0">
                {teachers.length === 0 ? (
                    <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background flex items-center justify-center py-16">
                        <p className="text-sm text-muted-foreground">
                            No approved teachers found.
                        </p>
                    </div>
                ) : (
                    <TeacherTable
                        data={teachers}
                        viewerRole={userRole ?? "TEACHER"}
                    />
                )}
            </div>
        </div>
    );
}
