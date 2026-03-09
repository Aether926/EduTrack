import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
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
  const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const email = user.email ?? "";

  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <UserProvider role={role} userId={user.id} displayName={displayName} email={email}>
        <SidebarProvider>
          <AppSidebar role={role} displayName={displayName} email={email} userId={user.id} />
          <SidebarInset>
            <DeletionWarningBanner />
            <main className="min-w-0">
              <div className="absolute top-2 left-2 z-50">
                <SidebarTrigger className="fixed hover:bg-gray-200" />
              </div>
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </UserProvider>
    </div>
  );
}