import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import SuperadminSidebar from "@/components/superadmin-sidebar";

export default async function SuperadminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();
    if (!user) redirect("/signin");

    const role = user.user_metadata?.role ?? null;
    if (role !== "SUPERADMIN") redirect("/dashboard");

    const displayName =
        user.user_metadata?.name || user.email?.split("@")[0] || "Superadmin";
    const email = user.email ?? "";

    return (
        <SidebarProvider>
            <SuperadminSidebar
                displayName={displayName}
                email={email}
            />
            <SidebarInset>
                <main className="min-w-0">
                    <div className="absolute top-2 left-2 z-50">
                        <SidebarTrigger className="fixed hover:bg-gray-200" />
                    </div>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}