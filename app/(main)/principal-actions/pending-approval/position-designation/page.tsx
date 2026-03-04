import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PositionDesignationPending from "@/components/pending-categories/position-designation";

export default async function Page() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect("/login");

    const { data: userRow } = await supabase
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .single();
    if (userRow?.role !== "PRINCIPAL") redirect("/");

    return <PositionDesignationPending />;
}
