import { createClient } from "@/lib/supabase/server";
import PublicProfileView from "@/components/public-profile-view";

export default async function TeacherPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return <div className="p-6">not authenticated</div>;
  }

  const { data: profile, error } = await supabase
    .from("Profile")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) {
    return <div className="p-6">profile not found</div>;
  }

  return <PublicProfileView profile={profile} from="teacher" />;
}
