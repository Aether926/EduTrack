import type { Metadata } from "next";
import "../(main)/globals.css";

export const metadata: Metadata = {
    title: "Account Status",
    description: "",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}