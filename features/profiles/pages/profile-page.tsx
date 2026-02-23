"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";

import ProfileHeader from "@/features/profiles/components/profile-header/profile-header";
import PersonalInfoCard from "@/features/profiles/components/cards/personal-info-card";
import ContactInfoCard from "@/features/profiles/components/cards/contact-info-card";
import TrainingsCard from "@/features/profiles/components/cards/training-card";
import EmploymentInfoCard from "@/features/profiles/components/cards/employment-info-card";
import GovernmentIDsCard from "@/features/profiles/components/cards/government-ids-card";
import EducationCard from "@/features/profiles/components/cards/education-card";
import EducationBackgroundCard from "@/features/profiles/components/cards/education-background-card";
import FamilyBackgroundCard from "@/features/profiles/components/cards/family-background-card";
import EmergencyContactCard from "@/features/profiles/components/cards/emergency-contact-card";
import ServiceRecordCard from "@/features/profiles/components/cards/service-record-card";
import AppointmentHistoryCard from "@/features/profiles/components/cards/appointment-history-card";

import { useProfile } from "@/features/profiles/hooks/use-profile";
import { useProfileTrainings } from "@/features/profiles/hooks/use-profile-trainings";
import { useProfileImage } from "@/features/profiles/hooks/use-profile-image";

export default function ProfilePage() {
  const { theme } = useTheme();
  const bgClass = theme === "light" ? "bg-gray-100" : "bg-gray-950";

  const {
    mounted,
    userId,
    isEditing,
    profileData,
    tempProfileData,
    handleInputChange,
    handleDateChange,
    handleChildrenChange,
    startEditing,
    cancelEditing,
    saveProfile,
  } = useProfile();

  const { preview, previewImage } = useProfileImage();
  const { trainings, trainingsLoading, loadTrainings } = useProfileTrainings();

  const viewerRole = "GUEST";

  useEffect(() => {
    if (!userId) return;
    void loadTrainings(userId);
  }, [userId, loadTrainings]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${bgClass} space-y-6`}>
      <ProfileHeader
        teacherId={userId ?? ""}
        preview={preview}
        isEditing={isEditing}
        tempProfileData={{
          firstName: tempProfileData.firstName,
          middleInitial: tempProfileData.middleInitial,
          lastName: tempProfileData.lastName,
          position: tempProfileData.position,
          username: tempProfileData.username,
        }}
        profileData={profileData}
        onImageChange={previewImage}
        onSave={saveProfile}
        onCancel={cancelEditing}
        onEdit={startEditing}
      />

      <div className="flex flex-col md:flex-row justify-center gap-6 p-4">

        {/* ── Left Column ── */}
        <div className="flex flex-col gap-4 w-full xl:max-w-[500px]">
          <PersonalInfoCard
            data={tempProfileData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onDateChange={handleDateChange}
          />
          <ContactInfoCard
            data={tempProfileData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
          <TrainingsCard trainings={trainings} loading={trainingsLoading} />
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-4 w-full xl:max-w-[700px]">
          <FamilyBackgroundCard
            data={tempProfileData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onChildrenChange={handleChildrenChange}
          />
          <EmploymentInfoCard
            data={tempProfileData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onDateChange={handleDateChange}
            viewerRole={viewerRole}
            from="profile"
            isOwnProfile={true}
          />
          <AppointmentHistoryCard
            teacherId={userId ?? ""}
            isOwnProfile={true}
            from="profile"
          />
          <GovernmentIDsCard
            data={tempProfileData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
          <EducationCard
            data={tempProfileData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
          <EducationBackgroundCard
            data={tempProfileData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
          <EmergencyContactCard
            data={tempProfileData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
          <ServiceRecordCard data={tempProfileData} />
        </div>

      </div>
    </div>
  );
}