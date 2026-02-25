import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type { ProfileState, ProfileChild } from "@/features/profiles/types/profile";
import {
  getInitialProfileState,
  mapDbProfileToState,
  mapFamilyToState,
  mapEducationToState,
  mapEmergencyToState,
  mapStateToDb,
  mapStateToFamily,
  mapStateToEducation,
  mapStateToEmergency,
  mapStateToChildren,
} from "@/features/profiles/lib/map-profile";
import { calculateAge } from "@/app/util/helper";

export function useProfile() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initial = getInitialProfileState();
  const [profileData, setProfileData] = useState<ProfileState>(initial);
  const [tempProfileData, setTempProfileData] = useState<ProfileState>(initial);
  const [userId, setUserId] = useState<string | null>(null);


  const loadProfile = useCallback(async () => {
    setMounted(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.id) return;

    setUserId(user.id);

    const [
      { data: profile, error: profileError },
      { data: hr },
      { data: family },
      { data: children },
      { data: education },
      { data: emergency },
    ] = await Promise.all([
      supabase.from("Profile").select("*").eq("id", user.id).single(),
      supabase.from("ProfileHR").select("*").eq("id", user.id).single(),
      supabase.from("ProfileFamily").select("*").eq("profileId", user.id).single(),
      supabase.from("ProfileChildren").select("*").eq("profileId", user.id).order("createdAt", { ascending: true }),
      supabase.from("ProfileEducation").select("*").eq("profileId", user.id),
      supabase.from("ProfileEmergencyContact").select("*").eq("profileId", user.id).single(),
    ]);


    const base = getInitialProfileState();
    const row = { ...profile, ...hr };
    const mapped = !profileError ? mapDbProfileToState(row, base) : base;

    const combined: ProfileState = {
      ...mapped,
      id: user.id,
      email: user.email || mapped.email || "",
      ...mapFamilyToState(family, children ?? []),
      ...mapEducationToState(education ?? []),
      ...mapEmergencyToState(emergency),
    };

    setProfileData(combined);
    setTempProfileData(combined);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleInputChange = (field: keyof ProfileState, value: string) => {
    setTempProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: keyof ProfileState, date: Date | undefined) => {
    setTempProfileData((prev) => {
      const next = { ...prev, [field]: date };
      if (field === "dateOfBirth") next.age = calculateAge(date);
      return next;
    });
  };

  const handleChildrenChange = (children: ProfileChild[]) => {
    setTempProfileData((prev) => ({ ...prev, children }));
  };

  const startEditing = () => setIsEditing(true);

  const cancelEditing = () => {
    setIsEditing(false);
    setTempProfileData(profileData);
  };

  // ─── Save all tables ────────────────────────────────────────────────────────

  const saveProfile = async () => {
    if (isSaving) return;

    if (
      !tempProfileData.firstName.trim() ||
      !tempProfileData.lastName.trim() ||
      !tempProfileData.middleInitial.trim() ||
      !tempProfileData.contactNumber.trim()
    ) {
      toast.info("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      const currentUser = auth.user;

      if (!currentUser || authError) {
        toast.error("You must be logged in to save your profile.");
        return;
      }

      const uid = currentUser.id;

      // ── 1. Save Profile table ──
      const profileFields = mapStateToDb(tempProfileData);
      const { error: profileError } = await supabase
        .from("Profile")
        .upsert({ ...profileFields, id: uid })
        .select();

      if (profileError) {
        console.error("Profile upsert error:", profileError);
        toast.error(`Failed to save profile, Double check your inputs.`);
        return;
      }

      // ── 2. Save ProfileFamily ──
const { data: familyData, error: familyError } = await supabase
  .from("ProfileFamily")
  .upsert(
    { ...mapStateToFamily(tempProfileData), profileId: uid },
    { onConflict: "profileId" }
  )
  .select();

console.log("Family upsert result:", familyData, familyError);

// ── 3. Save ProfileChildren ──
const { error: deleteError } = await supabase
  .from("ProfileChildren")
  .delete()
  .eq("profileId", uid);
if (deleteError) console.error("ProfileChildren delete error:", deleteError);

const childRows = mapStateToChildren(tempProfileData, uid);
if (childRows.length > 0) {
  const { error: childError } = await supabase
    .from("ProfileChildren")
    .insert(childRows);
  if (childError) console.error("ProfileChildren insert error:", childError);
}

// ── 4. Save ProfileEducation ──
const { error: eduError } = await supabase
  .from("ProfileEducation")
  .upsert(
    mapStateToEducation(tempProfileData, uid),
    { onConflict: "profileId,level" }
  );
if (eduError) console.error("ProfileEducation error:", eduError);

// ── 5. Save ProfileEmergencyContact ──
const { error: emergencyError } = await supabase
  .from("ProfileEmergencyContact")
  .upsert(
    { ...mapStateToEmergency(tempProfileData), profileId: uid },
    { onConflict: "profileId" }
  );

      setProfileData(tempProfileData);
      setIsEditing(false);
      toast.success("Profile saved successfully.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    mounted,
    userId,
    isEditing,
    isSaving,
    profileData,
    tempProfileData,
    setTempProfileData,
    handleInputChange,
    handleDateChange,
    handleChildrenChange,
    startEditing,
    cancelEditing,
    saveProfile,
  };
}