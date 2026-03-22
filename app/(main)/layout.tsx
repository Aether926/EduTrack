import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { MobileTopbar } from "@/components/ui-elements/mobile-topbar";
import { DeletionWarningBanner } from "@/features/settingss/components/deletion-warning-banner";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserProvider } from "@/components/user-context";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();
    if (!user) redirect("/signin");

    const role = user.user_metadata?.role ?? null;
    const displayName =
        user.user_metadata?.name || user.email?.split("@")[0] || "User";
    const email = user.email ?? "";

    return (
        <div className={`${geistSans.variable} ${geistMono.variable}`}>
            <UserProvider
                role={role}
                userId={user.id}
                displayName={displayName}
                email={email}
            >
                <SidebarProvider>
                    <AppSidebar
                        role={role}
                        displayName={displayName}
                        email={email}
                        userId={user.id}
                    />
                    <SidebarInset className="min-w-0">
                        <DeletionWarningBanner />
                        <MobileTopbar
                            userId={user.id}
                            displayName={displayName}
                        />
                        <main className="min-w-0 overflow-x-hidden">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </UserProvider>
        </div>
    );
}
