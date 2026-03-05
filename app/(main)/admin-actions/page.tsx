/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { TrendingUp } from "lucide-react";

import {
  ClipboardList,
  Users,
  FileCheck,
  BookMarked,
  ShieldAlert,
  ArrowRight,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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

const ADMIN_LIKE = [
    "ADMIN",
    "HR",
    "HR_ADMIN",
    "PRINCIPAL",
    "SUPERADMIN",
] as const;

export default async function AdminActionsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  // dynamic role badge (and auth gate)
  const admin = createAdminClient();
  const { data: me } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (me?.role ?? "USER").toString();

  // keep it flexible for future roles
  if (!ADMIN_LIKE.includes(roleLabel as any)) redirect("/dashboard");

  // teacher snapshot
  const { data: users } = await admin
    .from("User")
    .select("id, role, status")
    .eq("role", "TEACHER")
    .eq("status", "APPROVED");

  const teacherIds = (users ?? []).map((u) => u.id);

  const { data: teacherProfiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .in("id", teacherIds.length ? teacherIds : ["__none__"])
    .order("lastName", { ascending: true });

  const teachers: TeacherItem[] = (teacherProfiles ?? []).map((p: any) => ({
    id: String(p.id),
    fullName:
      `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() ||
      p.email ||
      "(unknown)",
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
        {
            title: "Salary Increase",
            description:
                "Track teachers eligible for salary increase every 3 years.",
            href: "/admin-actions/salary-increase-eligibility",
            icon: <TrendingUp className="h-5 w-5" />,
            badge: "Eligibility",
        },
    ];

  const recentTeachers = teachers.slice(0, 8);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-6">
            {/* header card (same style as your other pages) */}
            <div className="rounded-xl border bg-card p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{roleLabel}</Badge>
                        <Badge variant="outline">Admin Actions</Badge>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <Button
                            asChild
                            variant="secondary"
                            className="w-full sm:w-auto"
                        >
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                            <Link
                                href="/admin-actions/teachers"
                                className="gap-2"
                            >
                                Teacher directory{" "}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="deletions" className="gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        Account Deletions
                        {deletionRequests.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {deletionRequests.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Quick actions
                                </CardTitle>
                                <CardDescription>
                                    Open a module. Access is permission-gated.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {actions.map((a) => (
                                        <Card
                                            key={a.href}
                                            className="group transition-colors hover:bg-muted/20"
                                        >
                                            <CardHeader className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                                                        <div className="rounded-md border bg-card p-2">
                                                            {a.icon}
                                                        </div>
                                                        {a.badge ? (
                                                            <Badge variant="secondary">
                                                                {a.badge}
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <CardTitle className="text-base">
                                                        {a.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-sm">
                                                        {a.description}
                                                    </CardDescription>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-0">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    className="w-full justify-between"
                                                >
                                                    <Link href={a.href}>
                                                        Open{" "}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-base">
                                    Teacher snapshot
                                </CardTitle>
                                <CardDescription>
                                    Quick access to recent teachers.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-2xl font-semibold">
                                            {teachers.length}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Total approved teachers
                                        </div>
                                    </div>
                                    <Badge variant="outline">Recent</Badge>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    {recentTeachers.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                            No teachers found.
                                        </div>
                                    ) : (
                                        recentTeachers.map((t) => (
                                            <Link
                                                key={t.id}
                                                href={teacherProfileHref(t.id)}
                                                className="block rounded-lg border bg-muted/10 p-3 transition-colors hover:bg-muted/20"
                                            >
                                                <div className="text-sm font-medium truncate">
                                                    {t.fullName}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {t.email ?? "—"}
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>

                                <Button
                                    asChild
                                    variant="secondary"
                                    className="w-full"
                                >
                                    <Link href="/admin-actions/teachers">
                                        Open teacher directory
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="deletions">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Account deletion requests
                            </CardTitle>
                            <CardDescription>
                                Review and approve deletion requests. This
                                action is sensitive.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminDeletionRequestsTable
                                requests={deletionRequests}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}