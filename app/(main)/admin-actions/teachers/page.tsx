import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AdminTeacherTable from "@/features/admin-actions/teachers/components/teacher-table";

export const dynamic = "force-dynamic";

export default async function AdminTeachersPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: viewer } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (viewer?.role !== "ADMIN") redirect("/");

  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, middleInitial, email, profileImage, contactNumber")
    .order("lastName", { ascending: true });

  if (!profiles || profiles.length === 0) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Teacher Profiles</h1>
          <p className="text-sm text-muted-foreground">No teachers found.</p>
        </div>
      </main>
    );
  }

  const profileIds = profiles.map((p) => p.id);

  const { data: hrRows } = await admin
    .from("ProfileHR")
    .select("id, employeeId, position")
    .in("id", profileIds);

  const hrMap = new Map((hrRows ?? []).map((hr) => [hr.id, hr]));

  // shape data to match TeacherTableRow
  const teachers = profiles.map((p) => ({
    id: p.id,
    fullname: `${p.firstName ?? ""} ${p.middleInitial ?? ""} ${p.lastName ?? ""}`.trim(),
    email: p.email ?? "",
    contact: p.contactNumber ?? "",
    profileImage: p.profileImage ?? null,
    employeeid: hrMap.get(p.id)?.employeeId ?? "",
    position: hrMap.get(p.id)?.position ?? "",
    status: "active",
  }));

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            Teacher Profiles
          </h1>
          <p className="text-sm text-muted-foreground">
            View and directly edit HR records for all teachers.
          </p>
        </header>

        <AdminTeacherTable data={teachers} />
      </div>
    </main>
  );
}