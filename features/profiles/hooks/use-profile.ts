import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type { ProfileState } from "@/features/profiles/types/profile";
import { getInitialProfileState, mapDbProfileToState, mapStateToDb } from "@/features/profiles/lib/map-profile";
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

    const [{ data: profile, error: profileError }, { data: hr }] = await Promise.all([
    supabase.from("Profile").select("*").eq("id", user.id).single(),
    supabase.from("ProfileHR").select("*").eq("id", user.id).single(),
  ]); 

    const base = getInitialProfileState();

    const row = { ...profile, ...hr };

  const mapped = !profileError ? mapDbProfileToState(row, base) : base;

    const combined: ProfileState = {
      ...mapped,
      id: user.id,
      email: user.email || mapped.email || "",
    };

    setProfileData(combined);
    setTempProfileData(combined);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleInputChange = (field: keyof ProfileState, value: string) => {
    setTempProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: keyof ProfileState, date: Date | undefined) => {
    setTempProfileData((prev) => {
      const next = { ...prev, [field]: date };

      if (field === "dateOfBirth") {
        next.age = calculateAge(date);
      }

      return next;
    });
  };

  const startEditing = () => setIsEditing(true);

  const cancelEditing = () => {
    setIsEditing(false);
    setTempProfileData(profileData);
  };

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

    const profileFields = mapStateToDb(tempProfileData);

    const { error } = await supabase
      .from("Profile")
      .upsert({ ...profileFields, id: currentUser.id })
      .select();

    if (error) {
      console.error("Profile save error:", error);
      toast.error(`Failed to save profile: ${error.message}`);
      return;
    }

    setProfileData(tempProfileData);
    setIsEditing(false);
    toast.success("Changes saved.");
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

    startEditing,
    cancelEditing,
    saveProfile,
  };
}
