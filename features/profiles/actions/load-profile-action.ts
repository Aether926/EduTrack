"use server";
import { unstable_cache, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getInitialProfileState,
  mapDbProfileToState,
  mapFamilyToState,
  mapEducationToState,
  mapEmergencyToState,
} from "@/features/profiles/lib/map-profile";
import type { ProfileState } from "@/features/profiles/types/profile";

function getCachedProfileData(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient(); 

      const [
        { data: profile, error: profileError },
        { data: hr },
        { data: family },
        { data: children },
        { data: education },
        { data: emergency },
      ] = await Promise.all([
        supabase.from("Profile").select("*").eq("id", userId).single(),
        supabase.from("ProfileHR").select("*").eq("id", userId).single(),
        supabase.from("ProfileFamily").select("*").eq("profileId", userId).single(),
        supabase.from("ProfileChildren").select("*").eq("profileId", userId).order("createdAt", { ascending: true }),
        supabase.from("ProfileEducation").select("*").eq("profileId", userId),
        supabase.from("ProfileEmergencyContact").select("*").eq("profileId", userId).single(),
      ]);

      const base = getInitialProfileState();
      const row = { ...profile, ...hr };
      const mapped = !profileError ? mapDbProfileToState(row, base) : base;

      return {
        ...mapped,
        id: userId,
        email: mapped.email || "",
        ...mapFamilyToState(family, children ?? []),
        ...mapEducationToState(education ?? []),
        ...mapEmergencyToState(emergency),
      };
    },
    ["profile-data", userId],
    { revalidate: 300, tags: [`profile-${userId}`] }
    
  )();
  
}

export async function loadProfileData(userId: string): Promise<ProfileState> {
  return getCachedProfileData(userId);
}

export async function revalidateProfileCache(userId: string) {
  revalidateTag(`profile-${userId}`, "default");
}
