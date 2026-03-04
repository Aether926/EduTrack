import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import { RECENTLY_CATEGORIES } from "@/components/approvals/registry";
import { CategoryCard } from "@/components/approvals/category-card";

export default async function RecentlyApprovedPage() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect("/login");

    const { data: userRow } = await supabase
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .single();
    if (userRow?.role !== "PRINCIPAL") redirect("/");

    // TODO: fetch live counts from Supabase, same pattern as pending-approval/page.tsx

    const totalApproved = RECENTLY_CATEGORIES.reduce(
        (sum, c) => sum + c.approvedCount,
        0,
    );
    const totalRejected = RECENTLY_CATEGORIES.reduce(
        (sum, c) => sum + c.rejectedCount,
        0,
    );

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
                <header className="mb-6">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                        Recently Approved
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                        Browse reviewed change requests by category
                    </p>
                </header>

                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground">
                        <CalendarCheck className="h-4 w-4" />
                        {totalApproved + totalRejected} total reviewed
                    </div>
                    {totalApproved > 0 && (
                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg px-4 py-2 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            {totalApproved} approved
                        </div>
                    )}
                    {totalRejected > 0 && (
                        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-2 text-sm font-medium">
                            <XCircle className="h-4 w-4" />
                            {totalRejected} rejected
                        </div>
                    )}
                </div>

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {RECENTLY_CATEGORIES.map((cat) => (
                        <CategoryCard
                            key={cat.slug}
                            config={cat}
                            mode="recent"
                            baseHref="/principal-actions/recently-approved"
                        />
                    ))}
                </section>
            </div>
        </main>
    );
}
