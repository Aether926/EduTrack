/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TeacherTable from "@/app/(main)/teacher-profiles/component/teacher-table";
import type { TeacherTableRow } from "@/lib/user";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

            // get current user's role + status
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

            // if current user is PENDING (or not approved), don't fetch teacher rows at all
            if (!userRow || userRow.status !== "APPROVED") {
                setTeachers([]);
                setLoading(false);
                return;
            }

            // fetch approved TEACHER profiles only, exclude own profile row
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
                .eq("User.role", "TEACHER") // don't include ADMIN in table
                .order("lastName", { ascending: true });

            if (error) {
                toast.error("Error fetching teachers.");
                setTeachers([]);
                setLoading(false);
                return;
            }

            const tableData: TeacherTableRow[] = (profiles ?? [])
                .filter((profile: any) => profile.id !== authUser.id)
                .map((profile: any) => ({
                    id: profile.id,
                    employeeid: profile.employeeId || "N/A",
                    fullname: `${profile.firstName} ${
                        profile.middleInitial
                            ? profile.middleInitial.replace(/\.+$/, "") + ". "
                            : ""
                    }${profile.lastName}`,
                    position: profile.position || "N/A",
                    contact: profile.contactNumber || "N/A",
                    email: profile.email,
                    profileImage: profile.profileImage || null,
                    status: profile.User.status,
                }));

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

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{userRole ?? "USER"}</Badge>
                    <Badge variant="outline">Teacher Profiles</Badge>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Teachers
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Directory of all approved teaching staff.
                        </p>
                    </div>

                    {/* Stat mini-cards */}
                    <div className="flex gap-3">
                        <div className="rounded-lg border border-blue-500/30 bg-card px-4 py-2.5 flex items-center gap-3 min-w-[110px]">
                            <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-1.5">
                                <Users className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-[11px] text-muted-foreground leading-none">
                                    Total
                                </div>
                                <div className="text-xl font-bold text-blue-400 tabular-nums mt-0.5">
                                    {loading ? "—" : stats.total}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-emerald-500/30 bg-card px-4 py-2.5 flex items-center gap-3 min-w-[110px]">
                            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-[11px] text-muted-foreground leading-none">
                                    Approved
                                </div>
                                <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
                                    {loading ? "—" : stats.approved}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="min-w-0">
                {loading ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Teachers
                            </CardTitle>
                            <CardDescription>
                                Loading directory…
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ) : teachers.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            No approved teachers found.
                        </CardContent>
                    </Card>
                ) : (
                    <TeacherTable data={teachers} />
                )}
            </div>
        </div>
    );
}