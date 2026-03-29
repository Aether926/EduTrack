/* eslint-disable @typescript-eslint/no-explicit-any */
import TeacherTable from "@/app/(main)/teacher-profiles/component/teacher-table";
import { getUserById, type TeacherTableRow } from "@/lib/user";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui-elements/badges";
import { Users, CheckCircle2 } from "lucide-react";
import { getFullProfile, getHrProfiles } from "@/lib/profile";
import { requireAuth } from "@/lib/role";

export default async function TeacherProfilesPage() {
    const authUser = await requireAuth();
    const profiles = await getFullProfile();
    const hrProfiles = await getHrProfiles();

    const { data: userRow, error: userErr } = await getUserById(authUser.id);

    if (!userRow || userErr) {
        return;
    }

    const userRole = userRow.role;
    const userStatus = userRow.status;

    if (userStatus !== "APPROVED" || !profiles.success || !profiles.data) {
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
                    ),
                    ProfileEmergencyContact (
                        name,
                        relationship,
                        address,
                        telephoneNo
                    )
                    `,
        )
        .order("lastName", { ascending: true });

    // console.log("profile:", profiles);
    // console.log("profiles error", error);

    // console.log(profiles);

    if (error) {
        toast.error("Error fetching teachers.");
        setTeachers([]);
        setLoading(false);
        return;
    }

    const { data: hrProfiles } = await supabase.from("ProfileHR").select("*");

    const tableData: TeacherTableRow[] = (profiles ?? [])
        .filter(
            (profile: any) =>
                profile.id !== authUser.id &&
                profile.User?.role === "TEACHER" &&
                profile.User?.status === "APPROVED",
        )
        .map((profile: any) => {
            const hrProf = hrProfiles?.find((hr) => hr.id === profile.id);
            const emergencyContact =
                profile.ProfileEmergencyContact?.[0] ?? null;

            return {
                id: profile.id,
                employeeid: hrProf?.employeeId || "N/A",
                fullname: `${profile.firstName} ${
                    profile.middleInitial
                        ? profile.middleInitial.replace(/\.+$/, "") + ". "
                        : ""
                }${profile.lastName}`,
                position: hrProf?.position || "N/A",
                contact: profile.contactNumber || "N/A",
                email: profile.email,
                profileImage: profile.profileImage || null,
                status: profile.User.status,
                subjectSpecialization: profile.subjectSpecialization || null,
                emergencyName: emergencyContact?.name || null,
                emergencyContact: emergencyContact?.telephoneNo || null,
                privacySettings: profile.privacySettings || null,
            };
        });

    const totalTeachers = teachers.length;
    const approvedTeachers = teachers.filter(
        (t) => t.status === "APPROVED",
    ).length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="relative rounded-xl border border-border/60 bg-linear-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
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
                                        {totalTeachers}
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
                                        {approvedTeachers}
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
                    <div className="rounded-xl border border-border/60 bg-linear-to-br from-card to-background flex items-center justify-center py-16">
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
