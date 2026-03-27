/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import {
    ClipboardList,
    Users,
    FileCheck,
    BookMarked,
    ShieldAlert,
    ArrowRight,
    Trash2,
    TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAvatar from "@/components/ui-elements/avatars/user-avatar";
import { RoleBadge } from "@/components/ui-elements/badges";
import { AdminDeletionRequestsTable } from "@/features/settingss/components/admin-deletion-requests-table";
import { getAllDeletionRequests } from "@/features/settingss/actions/admin-deletion-actions";

type ActionItem = {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
    color: { icon: string; glow: string; border: string; open: string };
};
type TeacherItem = {
    id: string;
    fullName: string;
    email: string | null;
    profileImage: string | null;
};

function teacherProfileHref(id: string) {
    return `/admin-actions/teachers/${id}`;
}

const ADMIN_LIKE = ["ADMIN", "SUPERADMIN"] as const;

export default async function AdminActionsPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ADMIN_LIKE.includes(roleLabel as any)) redirect("/dashboard");

    const admin = createAdminClient();

    const [{ data: users }, deletionRequests] = await Promise.all([
        admin
            .from("User")
            .select("id, role, status")
            .eq("role", "TEACHER")
            .eq("status", "APPROVED"),

        getAllDeletionRequests(),
    ]);

    const teacherIds = (users ?? []).map((u) => u.id);
    const { data: teacherProfiles } = await admin
        .from("Profile")
        .select("id, firstName, lastName, email, profileImage")
        .in("id", teacherIds.length ? teacherIds : ["__none__"])
        .order("lastName", { ascending: true });

    const teachers: TeacherItem[] = (teacherProfiles ?? []).map((p: any) => ({
        id: String(p.id),
        fullName:
            `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() ||
            p.email ||
            "(unknown)",
        email: p.email ?? null,
        profileImage: p.profileImage ?? null,
    }));

    const actions: ActionItem[] = [
        {
            title: "Change Requests",
            description: "Review and approve employment info change requests.",
            href: "/admin-actions/queue",
            icon: <ClipboardList className="h-5 w-5" />,
            badge: "Queue",
            color: {
                icon: "border-blue-500/20 bg-blue-500/10 text-blue-400 group-hover:border-blue-500/40 group-hover:bg-blue-500/15 group-hover:text-blue-300",
                glow: "from-blue-500/5",
                border: "hover:border-blue-500/30",
                open: "group-hover:text-blue-400",
            },
        },
        {
            title: "Teacher Directory",
            description: "Browse and manage teacher records.",
            href: "/admin-actions/teachers",
            icon: <Users className="h-5 w-5" />,
            badge: "Teachers",
            color: {
                icon: "border-violet-500/20 bg-violet-500/10 text-violet-400 group-hover:border-violet-500/40 group-hover:bg-violet-500/15 group-hover:text-violet-300",
                glow: "from-violet-500/5",
                border: "hover:border-violet-500/30",
                open: "group-hover:text-violet-400",
            },
        },
        {
            title: "Appointment History",
            description: "Track appointment changes and timelines.",
            href: "/admin-actions/appointment-history",
            icon: <FileCheck className="h-5 w-5" />,
            badge: "History",
            color: {
                icon: "border-teal-500/20 bg-teal-500/10 text-teal-400 group-hover:border-teal-500/40 group-hover:bg-teal-500/15 group-hover:text-teal-300",
                glow: "from-teal-500/5",
                border: "hover:border-teal-500/30",
                open: "group-hover:text-teal-400",
            },
        },
        {
            title: "Academic Responsibilities",
            description: "Assign coordinator roles and other duties.",
            href: "/admin-actions/responsibilities",
            icon: <BookMarked className="h-5 w-5" />,
            badge: "Assignments",
            color: {
                icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/15 group-hover:text-emerald-300",
                glow: "from-emerald-500/5",
                border: "hover:border-emerald-500/30",
                open: "group-hover:text-emerald-400",
            },
        },
        {
            title: "Training Compliance",
            description: "Monitor compliance and hour requirements.",
            href: "/admin-actions/compliance",
            icon: <ShieldAlert className="h-5 w-5" />,
            badge: "Compliance",
            color: {
                icon: "border-amber-500/20 bg-amber-500/10 text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-500/15 group-hover:text-amber-300",
                glow: "from-amber-500/5",
                border: "hover:border-amber-500/30",
                open: "group-hover:text-amber-400",
            },
        },
        {
            title: "Salary Increase",
            description:
                "Track teachers eligible for salary increase every 3 years.",
            href: "/admin-actions/salary-increase-eligibility",
            icon: <TrendingUp className="h-5 w-5" />,
            badge: "Eligibility",
            color: {
                icon: "border-rose-500/20 bg-rose-500/10 text-rose-400 group-hover:border-rose-500/40 group-hover:bg-rose-500/15 group-hover:text-rose-300",
                glow: "from-rose-500/5",
                border: "hover:border-rose-500/30",
                open: "group-hover:text-rose-400",
            },
        },
    ];

    const recentTeachers = teachers.slice(0, 8);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 shrink-0">
                                <ShieldAlert className="h-5 w-5 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Admin Actions
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Manage teachers, compliance, and system
                                    operations.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <RoleBadge role={roleLabel} />
                            <Badge variant="outline" className="gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {teachers.length} teachers
                            </Badge>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/dashboard" prefetch={false}>
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link
                                    href="/admin-actions/teachers"
                                    prefetch={false}
                                    className="gap-1.5"
                                >
                                    Teacher directory{" "}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="deletions" className="gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        Account Deactivation
                        {deletionRequests.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {deletionRequests.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Quick actions
                                </h2>
                                <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Open a module. Access is permission-gated.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {actions.map((a) => (
                                    <Link
                                        key={a.href}
                                        href={a.href}
                                        prefetch={false}
                                        className={`group relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden transition-colors ${a.color.border}`}
                                    >
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${a.color.glow} via-transparent to-transparent pointer-events-none`}
                                        />
                                        <div className="relative flex flex-col gap-3 px-4 py-4">
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors ${a.color.icon}`}
                                                >
                                                    {a.icon}
                                                </div>
                                                {a.badge && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[11px]"
                                                    >
                                                        {a.badge}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold leading-tight">
                                                    {a.title}
                                                </p>
                                                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                                                    {a.description}
                                                </p>
                                            </div>
                                            <div
                                                className={`flex items-center gap-1 text-[12px] text-muted-foreground font-medium transition-colors ${a.color.open}`}
                                            >
                                                Open{" "}
                                                <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Teacher snapshot
                                </h2>
                                <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Quick access to recent teachers.
                                </p>
                            </div>
                            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 via-transparent to-transparent pointer-events-none" />
                                <div className="relative p-4 space-y-3">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold tabular-nums">
                                                {teachers.length}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                                Total approved teachers
                                            </p>
                                        </div>
                                        <Badge variant="outline">Recent</Badge>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1.5">
                                        {recentTeachers.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No teachers found.
                                            </p>
                                        ) : (
                                            recentTeachers.map((t) => (
                                                <Link
                                                    key={t.id}
                                                    href={teacherProfileHref(
                                                        t.id,
                                                    )}
                                                    prefetch={false}
                                                    className="group flex items-center gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5 hover:bg-muted/20 hover:border-border/80 transition-colors"
                                                >
                                                    <UserAvatar
                                                        name={t.fullName}
                                                        src={t.profileImage}
                                                        className="h-8 w-8 shrink-0"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate leading-tight">
                                                            {t.fullName}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground truncate">
                                                            {t.email ?? "—"}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <Link href="/teacher-profiles">
                                            Open teacher directory
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="deletions" className="mt-4">
                    <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                        <div className="px-5 py-4 border-b border-border/60">
                            <h2 className="text-sm font-semibold">
                                Account deactivation requests
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                Review and approve deactivation requests. This
                                action is sensitive.
                            </p>
                        </div>
                        <div className="p-4">
                            <AdminDeletionRequestsTable
                                requests={deletionRequests}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
