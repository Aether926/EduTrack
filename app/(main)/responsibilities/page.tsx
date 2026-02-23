import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyResponsibilitiesClient } from "@/features/responsibilities/components/my-responsibilities-client";

export const dynamic = "force-dynamic";

export default async function MyResponsibilitiesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const [
  { data: responsibilities },
  { data: changeRequests },
] = await Promise.all([
  supabase
    .from("TeacherResponsibility")
    .select("*")
    .order("created_at", { ascending: false }),
  supabase
    .from("ResponsibilityChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false }),

])

  return (
    <MyResponsibilitiesClient
      responsibilities={responsibilities ?? []}
      changeRequests={changeRequests ?? []}

    />
  );
}