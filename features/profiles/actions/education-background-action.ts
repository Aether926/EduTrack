/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabaseClient";
import type { ProfileState } from "@/features/profiles/types/profile";
import { mapEducationToState, mapStateToEducation } from "@/features/profiles/lib/map-profile";

function hasAnyEducationValue(row: any) {
  return (
    row.schoolName ||
    row.degreeOrCourse ||
    row.attendanceFrom !== null ||
    row.attendanceTo !== null ||
    row.highestUnitsEarned ||
    row.yearGraduated !== null ||
    row.scholarshipHonors
  );
}

export async function fetchEducationBackgroundToState(profileId: string): Promise<Partial<ProfileState>> {
  const { data, error } = await supabase
    .from("ProfileEducation")
    .select("*")
    .eq("profileId", profileId);

  if (error) throw new Error(error.message);

  return mapEducationToState(data ?? []);
}

/**
 * Save education background from ProfileState into ProfileEducation.
 * Reliable approach: delete all rows for profileId, then insert only non-empty levels.
 */
export async function saveEducationBackgroundFromState(profileId: string, state: ProfileState): Promise<void> {
  const rows = mapStateToEducation(state, profileId).filter(hasAnyEducationValue);

  // delete existing
  const { error: delErr } = await supabase
    .from("ProfileEducation")
    .delete()
    .eq("profileId", profileId);

  if (delErr) throw new Error(delErr.message);

  // insert new (only if user filled anything)
  if (rows.length === 0) return;

  const { error: insErr } = await supabase.from("ProfileEducation").insert(rows);
  if (insErr) throw new Error(insErr.message);
}