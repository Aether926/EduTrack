"use client";

import React, { useEffect, useState } from "react";
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

// All cards that support individual sheet editing
type EditableCard =
    | "personal"
    | "contact"
    | "emergency"
    | "family"
    | "employment"
    | "government"
    | "education"
    | "educationBg";

export default function ProfilePage() {
    const { theme } = useTheme();
    const bgClass = theme === "light" ? "bg-gray-100" : "bg-gray-950";

    const {
        mounted,
        userId,
        isSaving,
        profileData,
        tempProfileData,
        handleInputChange,
        handleDateChange,
        handleChildrenChange,
        cancelEditing,
        saveProfile,
    } = useProfile();

    // ── Per-card Sheet state ──────────────────────────────────────────────────
    const [openCard, setOpenCard] = useState<EditableCard | null>(null);

    const openEdit = (card: EditableCard) => setOpenCard(card);

    const closeEdit = () => {
        cancelEditing(); // resets tempProfileData back to saved profileData
        setOpenCard(null);
    };

    const handleSave = async () => {
        await saveProfile();
        setOpenCard(null); // close sheet after successful save
    };

    // ─────────────────────────────────────────────────────────────────────────

    const [savedFirstName, setSavedFirstName] = React.useState(
        tempProfileData.firstName
    );

    React.useEffect(() => {
        if (tempProfileData.firstName && openCard === null) {
            setSavedFirstName(tempProfileData.firstName);
        }
    }, [tempProfileData.firstName, openCard]);

    const { preview, previewImage } = useProfileImage();
    const { trainings, trainingsLoading, loadTrainings } = useProfileTrainings();

    useEffect(() => {
        if (!userId) return;
        void loadTrainings(userId);
    }, [userId, loadTrainings]);

    if (!mounted) return null;

    return (
        <div className={`min-h-screen ${bgClass} space-y-6`}>
            {/* Header — no more global Edit button, just share/QR/PDF */}
            <ProfileHeader
                teacherId={userId ?? ""}
                preview={preview}
                isEditing={false}
                savedFirstName={savedFirstName}
                tempProfileData={{
                    firstName: tempProfileData.firstName,
                    middleInitial: tempProfileData.middleInitial,
                    lastName: tempProfileData.lastName,
                    position: tempProfileData.position,
                    username: tempProfileData.username,
                }}
                profileData={profileData}
                onImageChange={previewImage}
                showActions={true}
                // onEdit / onSave / onCancel intentionally omitted — header no longer controls editing
            />

            <div className="flex flex-col md:flex-row justify-center gap-6 p-4 md:px-6">
                {/* ── Left Column ── */}
                <div className="flex flex-col gap-4 w-full md:w-1/2 md:max-w-[500px]">
                    <PersonalInfoCard
                        data={tempProfileData}
                        isEditing={openCard === "personal"}
                        onInputChange={handleInputChange}
                        onDateChange={handleDateChange}
                        onEdit={() => openEdit("personal")}
                        onSave={handleSave}
                        onCancel={closeEdit}
                        isOwnProfile={true}
                        isSaving={isSaving}
                    />
                    <ContactInfoCard
                        data={tempProfileData}
                        isEditing={openCard === "contact"}
                        onInputChange={handleInputChange}
                        onEdit={() => openEdit("contact")}
                        onSave={handleSave}
                        onCancel={closeEdit}
                        isOwnProfile={true}
                        isSaving={isSaving}
                    />
                    <EmergencyContactCard
                        data={tempProfileData}
                        isEditing={openCard === "emergency"}
                        onInputChange={handleInputChange}
                        onEdit={() => openEdit("emergency")}
                        onSave={handleSave}
                        onCancel={closeEdit}
                        isOwnProfile={true}
                        isSaving={isSaving}
                    />
                    <div className="hidden md:flex md:flex-col md:gap-4">
                        <TrainingsCard trainings={trainings} loading={trainingsLoading} />
                        <ServiceRecordCard data={tempProfileData} />
                    </div>
                </div>

                {/* ── Right Column ── */}
                <div className="flex flex-col gap-4 w-full md:w-1/2 md:max-w-[500px]">
                    <FamilyBackgroundCard
                        data={tempProfileData}
                        isEditing={openCard === "family"}
                        onInputChange={handleInputChange}
                        onChildrenChange={handleChildrenChange}
                        onEdit={() => openEdit("family")}
                        onSave={handleSave}
                        onCancel={closeEdit}
                        isOwnProfile={true}
                        isSaving={isSaving}
                    />
                    <EmploymentInfoCard
                        data={tempProfileData}
                        isEditing={openCard === "employment"}
                        onInputChange={handleInputChange}
                        onDateChange={handleDateChange}
                        
                        isOwnProfile={true}
                        
                        viewerRole="TEACHER"
                        from="profile"
                    />
                    <AppointmentHistoryCard
                        teacherId={userId ?? ""}
                        isOwnProfile={true}
                        from="profile"
                    />
                    <GovernmentIDsCard
                        data={tempProfileData}
                        isEditing={openCard === "government"}
                        onInputChange={handleInputChange}
                        onEdit={() => openEdit("government")}
                        onSave={handleSave}
                        onCancel={closeEdit}
                        isOwnProfile={true}
                        isSaving={isSaving}
                    />
                    <EducationCard
                        data={tempProfileData}
                        isEditing={openCard === "education"}
                        onInputChange={handleInputChange}
                        onEdit={() => openEdit("education")}
                        onSave={handleSave}
                        onCancel={closeEdit}
                        isOwnProfile={true}
                        isSaving={isSaving}
                    />
                    <EducationBackgroundCard
                        data={tempProfileData}
                        isEditing={openCard === "educationBg"}
                        onInputChange={handleInputChange}
                        onEdit={() => openEdit("educationBg")}
                        onSave={handleSave}
                        onCancel={closeEdit}
                        isOwnProfile={true}
                        isSaving={isSaving}
                    />
                </div>
            </div>

            {/* Trainings & Service Record — mobile only */}
            <div className="md:hidden flex flex-col gap-4 px-4 pb-4">
                <TrainingsCard trainings={trainings} loading={trainingsLoading} />
                <ServiceRecordCard data={tempProfileData} />
            </div>
        </div>
    );
}