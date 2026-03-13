import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import AdminTeacherTable from "@/features/admin-actions/teachers/components/teacher-table";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2 } from "lucide-react";

const ALLOWED = new Set(["ADMIN", "PRINCIPAL", "SUPERADMIN"]);

export default async function AdminTeachersPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.has(roleLabel)) redirect("/");

    const admin = createAdminClient();

    const { data: users } = await admin
        .from("User")
        .select("id")
        .eq("status", "APPROVED")
        .eq("role", "TEACHER");

    const approvedTeacherIds = (users ?? []).map((u) => u.id);

    if (approvedTeacherIds.length === 0) {
    }

    const { data: profiles } = await admin
        .from("Profile")
        .select("id, firstName, lastName, middleInitial, email, profileImage, contactNumber")
        .in("id", approvedTeacherIds)
        .order("lastName", { ascending: true });

    const safeProfiles = profiles ?? [];

    if (safeProfiles.length === 0) {
        return (
            <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
                <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-violet-400/5 pointer-events-none" />
                    <div className="relative px-5 py-5 md:px-6 md:py-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 shrink-0">
                                    <Users className="h-5 w-5 text-violet-400" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                        Teacher Directory
                                    </h1>
                                    <p className="text-[13px] text-muted-foreground mt-0.5">
                                        Browse and manage teacher records.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {roleLabel}
                                </span>
                                <Badge variant="outline" className="gap-1.5">
                                    <Users className="h-3.5 w-3.5" />0 teachers
                                </Badge>
                                <Badge variant="outline" className="gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />0
                                    approved
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                    No teachers found.
                </div>
            </div>
        );
    }

    const profileIds = safeProfiles.map((p) => p.id);
    const { data: hrRows } = await admin
        .from("ProfileHR")
        .select("id, employeeId, position")
        .in("id", profileIds);

    const hrMap = new Map((hrRows ?? []).map((hr) => [hr.id, hr]));

    const teachers = safeProfiles.map((p) => ({
        id: p.id,
        fullname:
            `${p.firstName ?? ""} ${p.middleInitial ?? ""} ${p.lastName ?? ""}`.trim(),
        email: p.email ?? "",
        contact: p.contactNumber ?? "",
        profileImage: p.profileImage ?? null,
        employeeid: hrMap.get(p.id)?.employeeId ?? "",
        position: hrMap.get(p.id)?.position ?? "",
        status: "active",
    }));

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Header ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-violet-400/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 shrink-0">
                                <Users className="h-5 w-5 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Teacher Directory
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Browse and manage teacher records.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                            <Badge variant="outline" className="gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {teachers.length} teachers
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {teachers.length} approved
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <AdminTeacherTable data={teachers} />
        </div>
    );
}
