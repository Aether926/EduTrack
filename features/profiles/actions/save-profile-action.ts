"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  mapStateToDb,
  mapStateToFamily,
  mapStateToEducation,
  mapStateToEmergency,
  mapStateToChildren,
} from "@/features/profiles/lib/map-profile";
import type { ProfileState } from "@/features/profiles/types/profile";

export async function saveProfileData(state: ProfileState): Promise<void> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) throw new Error("Not authenticated");

  const uid = user.id;

  const profileFields = mapStateToDb(state);
  const { error: profileError } = await supabase
    .from("Profile")
    .upsert({ ...profileFields, id: uid })
    .select();

  if (profileError) throw new Error(`Profile save failed: ${profileError.message}`);

  await supabase
    .from("ProfileFamily")
    .upsert({ ...mapStateToFamily(state), profileId: uid }, { onConflict: "profileId" });

  await supabase.from("ProfileChildren").delete().eq("profileId", uid);
  const childRows = mapStateToChildren(state, uid);
  if (childRows.length > 0) {
    await supabase.from("ProfileChildren").insert(childRows);
  }

  await supabase
    .from("ProfileEducation")
    .upsert(mapStateToEducation(state, uid), { onConflict: "profileId,level" });

  await supabase
    .from("ProfileEmergencyContact")
    .upsert({ ...mapStateToEmergency(state), profileId: uid }, { onConflict: "profileId" });

  
  revalidateTag(`profile-${uid}`, "default");
  revalidatePath("/profile");
  
  revalidatePath("/teacher-profiles");
  revalidatePath("/admin-actions/teachers");    
}
