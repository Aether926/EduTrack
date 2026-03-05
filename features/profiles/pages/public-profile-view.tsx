"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";

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

import type { TrainingRow } from "@/features/profiles/types/trainings";
import type { ViewerRole } from "@/features/profiles/types/viewer-role";
import type { ProfileState } from "@/features/profiles/types/profile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProfile = Record<string, any>;
type FromSource = "qr" | "teacher";

function toDate(v: unknown): Date | undefined {
    if (!v) return undefined;
    const d = v instanceof Date ? v : new Date(String(v));
    return Number.isNaN(d.getTime()) ? undefined : d;
}

function str(v: unknown): string {
    if (v === null || v === undefined) return "";
    return String(v);
}

export default function PublicProfileView(props: {
    profile: AnyProfile;
    from?: FromSource;
    trainings?: TrainingRow[];
    viewerRole: ViewerRole;
}) {
    const { profile, from = "teacher", trainings = [], viewerRole } = props;

    const { theme } = useTheme();
    const bgClass = theme === "light" ? "bg-gray-100" : "bg-gray-950";

    const [hasSession, setHasSession] = useState(false);

    useEffect(() => {
        const run = async () => {
            const { data } = await supabase.auth.getSession();
            setHasSession(Boolean(data.session));
        };
        void run();
    }, []);

    const data = useMemo<ProfileState>(
        () => ({
            id: str(profile?.id),
            firstName: str(profile?.firstName),
            middleInitial: str(profile?.middleInitial),
            lastName: str(profile?.lastName),
            username: str(profile?.username),
            age: str(profile?.age),
            gender: str(profile?.gender),
            dateOfBirth: toDate(profile?.dateOfBirth),
            civilStatus: str(profile?.civilStatus),
            nationality: str(profile?.nationality),
            religion: str(profile?.religion),
            contactNumber: str(profile?.contactNumber),
            address: str(profile?.address),
            email: str(profile?.email),
            telephoneNo: str(profile?.telephoneNo),
            employeeId: str(profile?.employeeId),
            position: str(profile?.position),
            plantillaNo: str(profile?.plantillaNo),
            dateOfOriginalAppointment: toDate(
                profile?.dateOfOriginalAppointment,
            ),
            dateOfLatestAppointment: toDate(profile?.dateOfLatestAppointment),
            pagibigNo: str(profile?.pagibigNo),
            philHealthNo: str(profile?.philHealthNo),
            gsisNo: str(profile?.gsisNo),
            tinNo: str(profile?.tinNo),
            sssNo: str(profile?.sssNo),
            umidNo: str(profile?.umidNo),
            philSysNo: str(profile?.philSysNo),
            agencyEmployeeNo: str(profile?.agencyEmployeeNo),
            subjectSpecialization: str(profile?.subjectSpecialization),
            bachelorsDegree: str(profile?.bachelorsDegree),
            postGraduate: str(profile?.postGraduate),
            nameExtension: str(profile?.nameExtension),
            placeOfBirth: str(profile?.placeOfBirth),
            height: str(profile?.height),
            weight: str(profile?.weight),
            bloodType: str(profile?.bloodType),
            citizenship: str(profile?.citizenship),
            dualCitizenshipType: str(profile?.dualCitizenshipType),
            dualCitizenshipCountry: str(profile?.dualCitizenshipCountry),
            residentialHouseNo: str(profile?.residentialHouseNo),
            residentialStreet: str(profile?.residentialStreet),
            residentialSubdivision: str(profile?.residentialSubdivision),
            residentialBarangay: str(profile?.residentialBarangay),
            residentialCity: str(profile?.residentialCity),
            residentialProvince: str(profile?.residentialProvince),
            residentialZipCode: str(profile?.residentialZipCode),
            permanentHouseNo: str(profile?.permanentHouseNo),
            permanentStreet: str(profile?.permanentStreet),
            permanentSubdivision: str(profile?.permanentSubdivision),
            permanentBarangay: str(profile?.permanentBarangay),
            permanentCity: str(profile?.permanentCity),
            permanentProvince: str(profile?.permanentProvince),
            permanentZipCode: str(profile?.permanentZipCode),
            sameAsResidential: Boolean(profile?.sameAsResidential),
            spouseSurname: str(profile?.spouseSurname),
            spouseFirstName: str(profile?.spouseFirstName),
            spouseMiddleName: str(profile?.spouseMiddleName),
            spouseNameExtension: str(profile?.spouseNameExtension),
            spouseOccupation: str(profile?.spouseOccupation),
            spouseEmployerName: str(profile?.spouseEmployerName),
            spouseBusinessAddress: str(profile?.spouseBusinessAddress),
            spouseTelephoneNo: str(profile?.spouseTelephoneNo),
            fatherSurname: str(profile?.fatherSurname),
            fatherFirstName: str(profile?.fatherFirstName),
            fatherMiddleName: str(profile?.fatherMiddleName),
            fatherNameExtension: str(profile?.fatherNameExtension),
            motherSurname: str(profile?.motherSurname),
            motherFirstName: str(profile?.motherFirstName),
            motherMiddleName: str(profile?.motherMiddleName),
            children: Array.isArray(profile?.children) ? profile.children : [],
            educationElementarySchool: str(profile?.educationElementarySchool),
            educationElementaryDegree: str(profile?.educationElementaryDegree),
            educationElementaryFrom: str(profile?.educationElementaryFrom),
            educationElementaryTo: str(profile?.educationElementaryTo),
            educationElementaryUnits: str(profile?.educationElementaryUnits),
            educationElementaryGraduated: str(
                profile?.educationElementaryGraduated,
            ),
            educationElementaryHonors: str(profile?.educationElementaryHonors),
            educationSecondarySchool: str(profile?.educationSecondarySchool),
            educationSecondaryDegree: str(profile?.educationSecondaryDegree),
            educationSecondaryFrom: str(profile?.educationSecondaryFrom),
            educationSecondaryTo: str(profile?.educationSecondaryTo),
            educationSecondaryUnits: str(profile?.educationSecondaryUnits),
            educationSecondaryGraduated: str(
                profile?.educationSecondaryGraduated,
            ),
            educationSecondaryHonors: str(profile?.educationSecondaryHonors),
            educationVocationalSchool: str(profile?.educationVocationalSchool),
            educationVocationalDegree: str(profile?.educationVocationalDegree),
            educationVocationalFrom: str(profile?.educationVocationalFrom),
            educationVocationalTo: str(profile?.educationVocationalTo),
            educationVocationalUnits: str(profile?.educationVocationalUnits),
            educationVocationalGraduated: str(
                profile?.educationVocationalGraduated,
            ),
            educationVocationalHonors: str(profile?.educationVocationalHonors),
            educationCollegeSchool: str(profile?.educationCollegeSchool),
            educationCollegeDegree: str(profile?.educationCollegeDegree),
            educationCollegeFrom: str(profile?.educationCollegeFrom),
            educationCollegeTo: str(profile?.educationCollegeTo),
            educationCollegeUnits: str(profile?.educationCollegeUnits),
            educationCollegeGraduated: str(profile?.educationCollegeGraduated),
            educationCollegeHonors: str(profile?.educationCollegeHonors),
            educationGraduateSchool: str(profile?.educationGraduateSchool),
            educationGraduateDegree: str(profile?.educationGraduateDegree),
            educationGraduateFrom: str(profile?.educationGraduateFrom),
            educationGraduateTo: str(profile?.educationGraduateTo),
            educationGraduateUnits: str(profile?.educationGraduateUnits),
            educationGraduateGraduated: str(
                profile?.educationGraduateGraduated,
            ),
            educationGraduateHonors: str(profile?.educationGraduateHonors),
            emergencyName: str(profile?.emergencyName),
            emergencyRelationship: str(profile?.emergencyRelationship),
            emergencyAddress: str(profile?.emergencyAddress),
            emergencyTelephoneNo: str(profile?.emergencyTelephoneNo),
            profileImage: profile?.profileImage ?? null,
        }),
        [profile],
    );

    const isAdmin = viewerRole === "ADMIN";
    const isTeacher = viewerRole === "TEACHER";
    const noop = () => {};

    return (
        <div className={`min-h-screen ${bgClass} space-y-6`}>
            {from === "qr" && !hasSession && (
                <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
                    <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
                        <div className="text-sm opacity-80">
                            Viewing a teacher profile via QR. Sign in to access
                            more features.
                        </div>
                        <div className="flex gap-2">
                            <a
                                href="/signin"
                                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm"
                            >
                                Login
                            </a>
                            <a
                                href="/signUp"
                                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                            >
                                Sign up
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <ProfileHeader
                teacherId={str(profile?.id)}
                preview={data.profileImage ?? null}
                isEditing={false}
                tempProfileData={{
                    firstName: data.firstName,
                    middleInitial: data.middleInitial,
                    lastName: data.lastName,
                    position: data.position,
                    username: data.username,
                }}
                showActions={false}
                onImageChange={noop}
                onSave={noop}
                onCancel={noop}
                onEdit={noop}
            />

            {/* ── TEACHER view ── */}
            {isTeacher && (
                <div className="flex flex-col md:flex-row justify-center gap-6 p-4 md:px-6">
                    <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                        <PersonalInfoCard
                            data={data}
                            isEditing={false}
                            onInputChange={noop}
                            onDateChange={noop}
                            
                        />
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                        <ContactInfoCard
                            data={data}
                            isEditing={false}
                            onInputChange={noop}
                        />
                        <EmergencyContactCard
                            data={data}
                            isEditing={false}
                            onInputChange={noop}
                        />
                    </div>
                </div>
            )}

            {/* ── ADMIN view ── */}
            {isAdmin && (
                <>
                    <div className="flex flex-col md:flex-row justify-center gap-6 p-4 md:px-6">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                            <PersonalInfoCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                                onDateChange={noop}
                            />
                            <ContactInfoCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                            />
                            <EmergencyContactCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                            />
                            {/* Trainings & Service Record — tablet/desktop: after emergency contact */}
                            <div className="hidden md:flex md:flex-col md:gap-4">
                                <TrainingsCard
                                    trainings={trainings}
                                    loading={false}
                                    viewerRole={viewerRole}
                                />
                                <ServiceRecordCard data={data} />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                            <FamilyBackgroundCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                                onChildrenChange={noop}
                            />
                            <EmploymentInfoCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                                onDateChange={noop}
                                viewerRole={viewerRole}
                                from={from}
                                isOwnProfile={false}
                            />
                            <AppointmentHistoryCard
                                teacherId={str(profile?.id)}
                                isOwnProfile={false}
                                from={from}
                            />
                            <GovernmentIDsCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                            />
                            <EducationCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                            />
                            <EducationBackgroundCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                            />
                        </div>
                    </div>

                    {/* Trainings & Service Record — mobile only, at the very bottom */}
                    <div className="md:hidden flex flex-col gap-4 px-4 pb-4">
                        <TrainingsCard
                            trainings={trainings}
                            loading={false}
                            viewerRole={viewerRole}
                        />
                        <ServiceRecordCard data={data} />
                    </div>
                </>
            )}
        </div>
    );
}
