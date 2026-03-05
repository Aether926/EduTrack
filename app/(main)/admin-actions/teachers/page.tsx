import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AdminTeacherTable from "@/features/admin-actions/teachers/components/teacher-table";

import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2 } from "lucide-react";



export default async function AdminTeachersPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const { data: viewer } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  const roleLabel = (viewer?.role ?? "USER").toString();

  if (viewer?.role !== "ADMIN") redirect("/");

  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, middleInitial, email, profileImage, contactNumber")
    .order("lastName", { ascending: true });

  const safeProfiles = profiles ?? [];

  if (safeProfiles.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
        {/* header (same style) */}
        <div className="rounded-xl border bg-card p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{roleLabel}</Badge>
              <Badge variant="outline">Manage Users</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-2">
                <Users className="h-3.5 w-3.5" />
                0 teachers
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                0 approved
              </Badge>
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
    fullname: `${p.firstName ?? ""} ${p.middleInitial ?? ""} ${p.lastName ?? ""}`.trim(),
    email: p.email ?? "",
    contact: p.contactNumber ?? "",
    profileImage: p.profileImage ?? null,
    employeeid: hrMap.get(p.id)?.employeeId ?? "",
    position: hrMap.get(p.id)?.position ?? "",
    status: "active",
  }));

  const total = teachers.length;
  const approved = total; // your table is showing profiles; treat as approved list here

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header (same style as other pages) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Manage Users</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              {total} teachers
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {approved} approved
            </Badge>
          </div>
        </div>
      </div>

      <AdminTeacherTable data={teachers} />
    </div>
  );
}