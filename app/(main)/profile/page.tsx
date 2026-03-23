import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { loadProfileData } from "@/features/profiles/actions/load-profile-action";
import ProfilePage from "@/features/profiles/pages/profile-page";

export const revalidate = 300;

export default async function Page() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const initialProfile = await loadProfileData(user.id);

    return <ProfilePage userId={user.id} initialProfile={initialProfile} />;
}
