import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserManagementTable from "@/features/superadmin/components/user-management-table";
import { Shield } from "lucide-react";

export default async function SuperadminUsersPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const role = user.user_metadata?.role ?? null;
    if (role !== "SUPERADMIN") redirect("/dashboard");

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* Header */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-rose-400/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 shrink-0">
                            <Shield className="h-5 w-5 text-rose-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                User Management
                            </h1>
                            <p className="text-[13px] text-muted-foreground mt-0.5">
                                Manage user access, roles, and account status.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <UserManagementTable actorId={user.id} />
        </div>
    );
}