import { useState } from "react";
import { saveProfileData } from "@/features/profiles/actions/save-profile-action";
import { toast } from "sonner";
import type { ProfileState, ProfileChild } from "@/features/profiles/types/profile";
import { getInitialProfileState } from "@/features/profiles/lib/map-profile";
import { calculateAge } from "@/app/util/helper";

function hydrateDates(raw: ProfileState): ProfileState {
  return {
    ...raw,
    dateOfBirth: raw.dateOfBirth ? new Date(raw.dateOfBirth) : undefined,
    dateOfOriginalAppointment: raw.dateOfOriginalAppointment
      ? new Date(raw.dateOfOriginalAppointment)
      : undefined,
    dateOfLatestAppointment: raw.dateOfLatestAppointment
      ? new Date(raw.dateOfLatestAppointment)
      : undefined,
  };
}

export function useProfile(initialProfile?: ProfileState) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initial = initialProfile
    ? hydrateDates(initialProfile)
    : getInitialProfileState();

  const [profileData, setProfileData] = useState<ProfileState>(initial);
  const [tempProfileData, setTempProfileData] = useState<ProfileState>(initial);

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

  const saveProfile = async () => {
    if (isSaving) return;

    if (
      !tempProfileData.firstName.trim() ||
      !tempProfileData.lastName.trim() ||
      !tempProfileData.contactNumber.trim()
    ) {
      toast.info("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      await saveProfileData(tempProfileData);
      setProfileData(tempProfileData);
      setIsEditing(false);
      toast.success("Profile saved successfully.");
    } catch (err) {
      toast.error("Failed to save profile. Please try again.");
      
    } finally {
      setIsSaving(false);
    }
  };

  return {
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