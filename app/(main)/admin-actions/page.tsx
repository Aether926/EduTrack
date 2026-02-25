import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  ClipboardList, Users, FileCheck,
  BookMarked, ShieldAlert, ArrowRight, Trash2,
} from "lucide-react";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDeletionRequestsTable } from "@/features/settingss/components/admin-deletion-requests-table";
import { getAllDeletionRequests } from "@/features/settingss/actions/admin-deletion-actions";

type ActionItem = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

type TeacherItem = {
  id: string;
  fullName: string;
  email: string | null;
};

function teacherProfileHref(id: string) {
  return `/admin-actions/teachers/${id}`;
}

export default async function AdminActionsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const { data: userRow } = await supabase
    .from("User").select("role").eq("id", auth.user.id).single();
  if (userRow?.role !== "ADMIN") redirect("/");

  const { data: users } = await supabase
    .from("User").select("id, role").eq("role", "TEACHER");
  const teacherIds = (users ?? []).map((u) => u.id);

  const { data: teacherProfiles } = await supabase
    .from("Profile")
    .select("id, firstName, lastName, email")
    .in("id", teacherIds.length ? teacherIds : ["__none__"])
    .order("lastName", { ascending: true });

  const teachers: TeacherItem[] = (teacherProfiles ?? []).map((p) => ({
    id: String(p.id),
    fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.email || "(unknown)",
    email: p.email ?? null,
  }));

  const deletionRequests = await getAllDeletionRequests();

  const actions: ActionItem[] = [
    {
      title: "HR Change Requests",
      description: "Review and approve employment info change requests.",
      href: "/admin-actions/queue",
      icon: <ClipboardList className="h-5 w-5" />,
      badge: "Queue",
    },
    {
      title: "Teacher Directory",
      description: "Browse and manage teacher records.",
      href: "/admin-actions/teachers",
      icon: <Users className="h-5 w-5" />,
      badge: "Teachers",
    },
    {
      title: "Appointment History",
      description: "Track appointment changes and timelines.",
      href: "/admin-actions/appointment-history",
      icon: <FileCheck className="h-5 w-5" />,
      badge: "History",
    },
    {
      title: "Academic Responsibilities",
      description: "Assign coordinator roles and other duties.",
      href: "/admin-actions/responsibilities",
      icon: <BookMarked className="h-5 w-5" />,
      badge: "Assignments",
    },
    {
      title: "Training Compliance",
      description: "Monitor compliance and hour requirements.",
      href: "/admin-actions/compliance",
      icon: <ShieldAlert className="h-5 w-5" />,
      badge: "Compliance",
    },
  ];

  const recentTeachers = teachers.slice(0, 8);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6">
        {/* header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Admin</Badge>
              <Badge variant="outline">Actions</Badge>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Admin Actions</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Manage requests, records, and compliance.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/admin-actions/teachers" className="gap-2">
                Teacher directory <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deletions" className="gap-2">
              <Trash2 className="h-3.5 w-3.5" />
              Account Deletions
              {deletionRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">{deletionRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview tab — original content */}
          <TabsContent value="overview">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Quick actions</CardTitle>
                  <CardDescription>Open a module. Access is permission-gated.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {actions.map((a) => (
                      <Card key={a.href} className="group">
                        <CardHeader className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                              <div className="rounded-md border bg-card p-2">{a.icon}</div>
                              {a.badge ? <Badge variant="secondary">{a.badge}</Badge> : null}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-base">{a.title}</CardTitle>
                            <CardDescription className="text-sm">{a.description}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button asChild variant="outline" className="w-full justify-between">
                            <Link href={a.href}>Open <ArrowRight className="h-4 w-4" /></Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">Teacher snapshot</CardTitle>
                  <CardDescription>Quick access to recent teachers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-semibold">{teachers.length}</div>
                      <div className="text-xs text-muted-foreground">Total teachers</div>
                    </div>
                    <Badge variant="outline">Recent</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {recentTeachers.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No teachers found.</div>
                    ) : (
                      recentTeachers.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{t.fullName}</div>
                            <div className="truncate text-xs text-muted-foreground">{t.email ?? "—"}</div>
                          </div>
                          <Button asChild variant="ghost" size="sm" className="shrink-0">
                            <Link href={teacherProfileHref(t.id)}>Open</Link>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/admin-actions/teachers">Browse all teachers</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deletions tab */}
          <TabsContent value="deletions">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Account Deletion Requests</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Review pending deletion requests. The Delete button activates after the grace period expires.
                </p>
              </div>
              <AdminDeletionRequestsTable requests={deletionRequests} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}