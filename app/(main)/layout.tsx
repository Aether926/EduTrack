import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { MobileTopbar } from "@/components/ui-elements/mobile-topbar";
import { DeletionWarningBanner } from "@/features/settingss/components/deletion-warning-banner";
import { getUser, createClient } from "@/lib/supabase/server";
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
    const email = user.email ?? "";

    // Fetch real profile data from DB
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from("Profile")
        .select("firstName, username, profileImage")
        .eq("id", user.id)
        .single();

    // First name from profile, fallback to metadata name or email prefix
    const firstName =
        profile?.firstName?.trim() ||
        user.user_metadata?.name?.split(" ")[0] ||
        user.email?.split("@")[0] ||
        "User";

    const username = profile?.username ?? null;
    const profileImage = profile?.profileImage ?? null;

    // displayName still used by UserProvider / MobileTopbar
    const displayName =
        user.user_metadata?.name || user.email?.split("@")[0] || "User";

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
                        firstName={firstName}
                        username={username}
                        profileImage={profileImage}
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
