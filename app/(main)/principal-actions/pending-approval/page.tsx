import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Clock } from "lucide-react";
import { PENDING_CATEGORIES } from "@/components/approvals/registry";
import { CategoryCard } from "@/components/approvals/category-card";

export default async function PendingApprovalPage() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect("/login");

    const { data: userRow } = await supabase
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .single();
    if (userRow?.role !== "PRINCIPAL") redirect("/");

    // TODO: For live counts, fetch from Supabase here and mutate PENDING_CATEGORIES
    // before rendering. Example:
    // const counts = await Promise.all(
    //   PENDING_CATEGORIES.map(cat =>
    //     supabase.from("PendingChanges")
    //       .select("id", { count: "exact" })
    //       .eq("category", cat.slug)
    //       .eq("status", "pending")
    //   )
    // );
    // Then pass counts[i].count into each card.

    const totalPending = PENDING_CATEGORIES.reduce(
        (sum, c) => sum + c.pendingCount,
        0,
    );

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
                <header className="mb-6">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                        Pending Approval
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                        Select a category to review pending change requests
                    </p>
                </header>

                {totalPending > 0 && (
                    <div className="flex items-center gap-2 mb-6 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 rounded-lg px-4 py-2.5 text-sm font-medium w-fit">
                        <Clock className="h-4 w-4" />
                        {totalPending} total pending{" "}
                        {totalPending === 1 ? "request" : "requests"} across all
                        categories
                    </div>
                )}

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {PENDING_CATEGORIES.map((cat) => (
                        <CategoryCard
                            key={cat.slug}
                            config={cat}
                            mode="pending"
                            baseHref="/principal-actions/pending-approval"
                        />
                    ))}
                </section>
            </div>
        </main>
    );
}
