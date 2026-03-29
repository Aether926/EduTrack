import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { fetchArchivedUsers } from "@/features/archive/actions/archive-actions";
import ArchiveTable from "@/features/archive/components/archive-table";
import { Archive } from "lucide-react";

export default async function SuperadminArchivePage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const role = user.user_metadata?.role ?? null;
    if (role !== "SUPERADMIN") redirect("/dashboard");

    const archivedUsers = await fetchArchivedUsers();

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-slate-400/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-slate-500/20 bg-slate-500/10 p-2.5 shrink-0">
                            <Archive className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                Archive
                            </h1>
                            <p className="text-[13px] text-muted-foreground mt-0.5">
                                View, restore archived accounts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ArchiveTable
                users={archivedUsers}
                isSuperadmin={true}
                basePath="/superadmin/archive"
            />
        </div>
    );
}
