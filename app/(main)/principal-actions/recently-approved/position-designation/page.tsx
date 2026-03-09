import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import PositionDesignationRecent from "@/components/recently-categories/position-designation";

export default async function Page() {
    const user = await getUser();
    if (!user) redirect("/login");

    const role = user.user_metadata?.role ?? "TEACHER";
    if (role !== "PRINCIPAL") redirect("/");

    return <PositionDesignationRecent />;
}