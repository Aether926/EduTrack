"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";
import { EyeOff } from "lucide-react";

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
import type { PrivacySettings } from "@/features/profiles/actions/privacy-actions";

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

// ── All-private placeholder ────────────────────────────────────────────────────
function AllPrivateCard() {
    return (
        <div className="flex justify-center items-center py-12 md:py-24 px-4">
            <div className="rounded-xl border border-border/40 bg-muted/10 px-6 py-10 md:px-12 md:py-16 flex flex-col items-center gap-3 w-full max-w-lg text-center">
                <EyeOff className="h-8 w-8 md:h-12 md:w-12 shrink-0 opacity-30" />
                <p className="text-lg md:text-xl font-semibold">
                    Profile is private
                </p>
                <p className="text-sm text-muted-foreground">
                    This teacher has chosen to keep their profile information
                    private.
                </p>
            </div>
        </div>
    );
}

// ── Default privacy settings ───────────────────────────────────────────────────
const DEFAULT_PRIVACY: PrivacySettings = {
    contactInfo: false,
    emergencyContact: false,
    showPosition: false,
    educationCredentials: false,
    educationBackground: false,
};

export default function PublicProfileView(props: {
    profile: AnyProfile;
    from?: FromSource;
    trainings?: TrainingRow[];
    viewerRole: ViewerRole;
    hasSession?: boolean;
    showRecordButton?: boolean;
    isArchived?: boolean;
}) {
    const {
        profile,
        from = "teacher",
        trainings = [],
        viewerRole,
        hasSession = false,
        showRecordButton = false,
        isArchived = false,
    } = props;

    const { theme } = useTheme();
    const bgClass = theme === "light" ? "bg-gray-100" : "bg-gray-950";

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
            dateOfOriginalDeployment: toDate(profile?.dateOfOriginalDeployment),
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
            privacySettings: profile?.privacySettings ?? null,
        }),
        [profile],
    );

    const isAdmin = ["ADMIN", "SUPERADMIN"].includes(viewerRole);
    const isTeacher = viewerRole === "TEACHER";
    const noop = () => {};

    // ── Privacy settings — only applies to teacher viewing teacher ────────────
    const privacy: PrivacySettings = isTeacher
        ? { ...DEFAULT_PRIVACY, ...(data.privacySettings ?? {}) }
        : DEFAULT_PRIVACY;

    const can = (key: keyof PrivacySettings) => isAdmin || privacy[key];

    const allPrivate =
        hasSession &&
        isTeacher &&
        !(
            can("contactInfo") ||
            can("emergencyContact") ||
            can("educationCredentials") ||
            can("educationBackground") ||
            can("showPosition")
        );

    return (
        <div className={`min-h-screen ${bgClass}`}>
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

            <div className="space-y-6">
                <ProfileHeader
                    teacherId={str(profile?.id)}
                    preview={data.profileImage ?? null}
                    isEditing={false}
                    tempProfileData={{
                        firstName: data.firstName,
                        middleInitial: data.middleInitial,
                        lastName: data.lastName,
                        position: can("showPosition") ? data.position : "",
                        username: data.username,
                    }}
                    showActions={true}
                    showRecordsButton={isAdmin}
                    showShareMenu={false}
                    isArchived={isArchived}
                    onImageChange={noop}
                    onSave={noop}
                    onCancel={noop}
                    onEdit={noop}
                />

                {/* ── Not logged in — contact + emergency only ── */}
                {!hasSession && (
                    <div className="flex flex-col md:flex-row justify-center gap-6 p-4 md:px-6">
                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                            <ContactInfoCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                            />
                        </div>
                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                            <EmergencyContactCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                            />
                        </div>
                    </div>
                )}

                {/* ── Teacher viewing teacher — privacy controlled ── */}
                {hasSession &&
                    isTeacher &&
                    (allPrivate ? (
                        <AllPrivateCard />
                    ) : (
                        (() => {
                            // Build ordered list of visible sections (excluding educationBackground)
                            const mainSections: React.ReactNode[] = [];
                            if (can("contactInfo"))
                                mainSections.push(
                                    <ContactInfoCard
                                        key="contactInfo"
                                        data={data}
                                        isEditing={false}
                                        onInputChange={noop}
                                    />,
                                );
                            if (can("emergencyContact"))
                                mainSections.push(
                                    <EmergencyContactCard
                                        key="emergencyContact"
                                        data={data}
                                        isEditing={false}
                                        onInputChange={noop}
                                    />,
                                );
                            if (can("educationCredentials"))
                                mainSections.push(
                                    <EducationCard
                                        key="educationCredentials"
                                        data={data}
                                        isEditing={false}
                                        onInputChange={noop}
                                    />,
                                );

                            const showEduBg = can("educationBackground");
                            const totalVisible =
                                mainSections.length + (showEduBg ? 1 : 0);

                            // Single card — center it
                            if (totalVisible === 1) {
                                return (
                                    <div className="flex justify-center p-4 md:px-6">
                                        <div className="w-full md:w-1/2 xl:max-w-[500px]">
                                            {mainSections[0] ?? (
                                                <EducationBackgroundCard
                                                    data={data}
                                                    isEditing={false}
                                                    onInputChange={noop}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            if (showEduBg) {
                                // Education History visible: left = all others stacked, right = education history alone
                                return (
                                    <div className="flex flex-col md:flex-row justify-center gap-6 p-4 md:px-6">
                                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                                            {mainSections}
                                        </div>
                                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                                            <EducationBackgroundCard
                                                data={data}
                                                isEditing={false}
                                                onInputChange={noop}
                                            />
                                        </div>
                                    </div>
                                );
                            } else {
                                // Education History NOT visible: zigzag — left gets [0,2,4...], right gets [1,3,5...]
                                const leftCol = mainSections.filter(
                                    (_, i) => i % 2 === 0,
                                );
                                const rightCol = mainSections.filter(
                                    (_, i) => i % 2 === 1,
                                );
                                return (
                                    <div className="flex flex-col md:flex-row justify-center gap-6 p-4 md:px-6">
                                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                                            {leftCol}
                                        </div>
                                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                                            {rightCol}
                                        </div>
                                    </div>
                                );
                            }
                        })()
                    ))}

                {/* ── Admin — sees everything ── */}
                {isAdmin && (
                    <div className="flex flex-col md:flex-row justify-center gap-6 p-4 md:px-6">
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
                            <TrainingsCard
                                trainings={trainings}
                                loading={false}
                                viewerRole={viewerRole}
                            />
                            <ServiceRecordCard data={data} />
                        </div>
                        <div className="flex flex-col gap-4 w-full md:w-1/2 xl:max-w-[500px]">
                            <FamilyBackgroundCard
                                data={data}
                                isEditing={false}
                                onInputChange={noop}
                                onChildrenChange={noop}
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
                )}
            </div>
        </div>
    );
}
