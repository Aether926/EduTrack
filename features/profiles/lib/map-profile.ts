/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ProfileState } from "@/features/profiles/types/profile";
import { toDate } from "@/features/profiles/lib/date";

export function getInitialProfileState(): ProfileState {
    return {
        firstName: "",
        middleInitial: "",
        lastName: "",
        username: "",
        age: "",
        gender: "Male",
        dateOfBirth: undefined,
        civilStatus: "Single",
        nationality: "Filipino",
        religion: "Roman Catholic",
        contactNumber: "",
        address: "",
        email: "",
        telephoneNo: "",
        employeeId: "",
        position: "Teacher I",
        plantillaNo: "",
        pagibigNo: "",
        philHealthNo: "",
        gsisNo: "",
        tinNo: "",
        sssNo: "",
        umidNo: "",
        philSysNo: "",
        agencyEmployeeNo: "",
        dateOfOriginalAppointment: undefined,
        dateOfLatestAppointment: undefined,
        subjectSpecialization: "",
        bachelorsDegree: "",
        postGraduate: "",
        nameExtension: "",
        placeOfBirth: "",
        height: "",
        weight: "",
        bloodType: "",
        citizenship: "Filipino",
        dualCitizenshipType: "",
        dualCitizenshipCountry: "",
        residentialCountry: "PH",
        residentialCountryName: "Philippines",
        residentialRegion: "",
        residentialRegionName: "",
        residentialHouseNo: "",
        residentialStreet: "",
        residentialSubdivision: "",
        residentialBarangay: "",
        residentialCity: "",
        residentialProvince: "",
        residentialZipCode: "",
        permanentCountry: "PH",
        permanentCountryName: "Philippines",
        permanentRegion: "",
        permanentRegionName: "",
        permanentHouseNo: "",
        permanentStreet: "",
        permanentSubdivision: "",
        permanentBarangay: "",
        permanentCity: "",
        permanentProvince: "",
        permanentZipCode: "",
        sameAsResidential: false,
        // Family
        spouseSurname: "",
        spouseFirstName: "",
        spouseMiddleName: "",
        spouseNameExtension: "",
        spouseOccupation: "",
        spouseEmployerName: "",
        spouseBusinessAddress: "",
        spouseTelephoneNo: "",
        fatherSurname: "",
        fatherFirstName: "",
        fatherMiddleName: "",
        fatherNameExtension: "",
        motherSurname: "",
        motherFirstName: "",
        motherMiddleName: "",
        children: [],
        // Education
        educationElementarySchool: "",
        educationElementaryDegree: "",
        educationElementaryFrom: "",
        educationElementaryTo: "",
        educationElementaryUnits: "",
        educationElementaryGraduated: "",
        educationElementaryHonors: "",
        educationSecondarySchool: "",
        educationSecondaryDegree: "",
        educationSecondaryFrom: "",
        educationSecondaryTo: "",
        educationSecondaryUnits: "",
        educationSecondaryGraduated: "",
        educationSecondaryHonors: "",
        educationVocationalSchool: "",
        educationVocationalDegree: "",
        educationVocationalFrom: "",
        educationVocationalTo: "",
        educationVocationalUnits: "",
        educationVocationalGraduated: "",
        educationVocationalHonors: "",
        educationCollegeSchool: "",
        educationCollegeDegree: "",
        educationCollegeFrom: "",
        educationCollegeTo: "",
        educationCollegeUnits: "",
        educationCollegeGraduated: "",
        educationCollegeHonors: "",
        educationGraduateSchool: "",
        educationGraduateDegree: "",
        educationGraduateFrom: "",
        educationGraduateTo: "",
        educationGraduateUnits: "",
        educationGraduateGraduated: "",
        educationGraduateHonors: "",
        // Emergency Contact
        emergencyName: "",
        emergencyRelationship: "",
        emergencyAddress: "",
        emergencyTelephoneNo: "",
        profileImage: null,
    };
}

// ─── Map DB rows → ProfileState ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbProfileToState(
    row: any,
    fallback: ProfileState,
): ProfileState {
    if (!row) return fallback;

    return {
        ...fallback,
        ...row,
        dateOfBirth: toDate(row?.dateOfBirth),
        dateOfOriginalAppointment: toDate(row?.dateOfOriginalAppointment),
        dateOfLatestAppointment: toDate(row?.dateOfLatestAppointment),
        height: row?.height != null ? String(row.height) : "",
        weight: row?.weight != null ? String(row.weight) : "",
        sameAsResidential: row?.sameAsResidential ?? false,
        sssNo: row?.sssNo ?? "",
        umidNo: row?.umidNo ?? "",
        philSysNo: row?.philSysNo ?? "",
        agencyEmployeeNo: row?.agencyEmployeeNo ?? "",
        nameExtension: row?.nameExtension ?? "",
        placeOfBirth: row?.placeOfBirth ?? "",
        bloodType: row?.bloodType ?? "",
        telephoneNo: row?.telephoneNo ?? "",
        citizenship: row?.citizenship ?? "Filipino",
        dualCitizenshipType: row?.dualCitizenshipType ?? "",
        dualCitizenshipCountry: row?.dualCitizenshipCountry ?? "",
        residentialCountry: row?.residentialCountry ?? "PH",
        residentialCountryName: row?.residentialCountryName ?? "Philippines",
        residentialRegion: row?.residentialRegion ?? "",
        residentialRegionName: row?.residentialRegionName ?? "",
        residentialHouseNo: row?.residentialHouseNo ?? "",
        residentialStreet: row?.residentialStreet ?? "",
        residentialSubdivision: row?.residentialSubdivision ?? "",
        residentialBarangay: row?.residentialBarangay ?? "",
        residentialCity: row?.residentialCity ?? "",
        residentialProvince: row?.residentialProvince ?? "",
        residentialZipCode: row?.residentialZipCode ?? "",
        permanentCountry: row?.permanentCountry ?? "PH",
        permanentCountryName: row?.permanentCountryName ?? "Philippines",
        permanentRegion: row?.permanentRegion ?? "",
        permanentRegionName: row?.permanentRegionName ?? "",
        permanentHouseNo: row?.permanentHouseNo ?? "",
        permanentStreet: row?.permanentStreet ?? "",
        permanentSubdivision: row?.permanentSubdivision ?? "",
        permanentBarangay: row?.permanentBarangay ?? "",
        permanentCity: row?.permanentCity ?? "",
        permanentProvince: row?.permanentProvince ?? "",
        permanentZipCode: row?.permanentZipCode ?? "",
        children: [],
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFamilyToState(
    family: any,
    children: any[],
): Partial<ProfileState> {
    if (!family) return { children: [] };

    return {
        spouseSurname: family.spouseSurname ?? "",
        spouseFirstName: family.spouseFirstName ?? "",
        spouseMiddleName: family.spouseMiddleName ?? "",
        spouseNameExtension: family.spouseNameExtension ?? "",
        spouseOccupation: family.spouseOccupation ?? "",
        spouseEmployerName: family.spouseEmployerName ?? "",
        spouseBusinessAddress: family.spouseBusinessAddress ?? "",
        spouseTelephoneNo: family.spouseTelephoneNo ?? "",
        fatherSurname: family.fatherSurname ?? "",
        fatherFirstName: family.fatherFirstName ?? "",
        fatherMiddleName: family.fatherMiddleName ?? "",
        fatherNameExtension: family.fatherNameExtension ?? "",
        motherSurname: family.motherSurname ?? "",
        motherFirstName: family.motherFirstName ?? "",
        motherMiddleName: family.motherMiddleName ?? "",
        children: children.map((c) => ({
            id: c.id,
            name: c.name ?? "",
            dateOfBirth: c.dateOfBirth ?? "",
        })),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEducationToState(rows: any[]): Partial<ProfileState> {
    const get = (level: string) => rows.find((r) => r.level === level);

    const mapRow = (row: any, prefix: string): Record<string, string> => ({
        [`${prefix}School`]: row?.schoolName ?? "",
        [`${prefix}Degree`]: row?.degreeOrCourse ?? "",
        [`${prefix}From`]: row?.attendanceFrom?.toString() ?? "",
        [`${prefix}To`]: row?.attendanceTo?.toString() ?? "",
        [`${prefix}Units`]: row?.highestUnitsEarned ?? "",
        [`${prefix}Graduated`]: row?.yearGraduated?.toString() ?? "",
        [`${prefix}Honors`]: row?.scholarshipHonors ?? "",
    });

    return {
        ...mapRow(get("ELEMENTARY"), "educationElementary"),
        ...mapRow(get("SECONDARY"), "educationSecondary"),
        ...mapRow(get("VOCATIONAL"), "educationVocational"),
        ...mapRow(get("COLLEGE"), "educationCollege"),
        ...mapRow(get("GRADUATE"), "educationGraduate"),
    } as Partial<ProfileState>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEmergencyToState(contact: any): Partial<ProfileState> {
    if (!contact) return {};
    return {
        emergencyName: contact.name ?? "",
        emergencyRelationship: contact.relationship ?? "",
        emergencyAddress: contact.address ?? "",
        emergencyTelephoneNo: contact.telephoneNo ?? "",
    };
}

// ─── Map ProfileState → DB payloads ──────────────────────────────────────────

export function mapStateToDb(profile: ProfileState) {
    return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleInitial: profile.middleInitial,
        username: profile.username,
        gender: profile.gender,
        age: profile.age ? Number(profile.age) : null,
        civilStatus: profile.civilStatus,
        nationality: profile.nationality,
        religion: profile.religion,
        contactNumber: profile.contactNumber,
        address: profile.address,
        email: profile.email,
        pagibigNo: profile.pagibigNo,
        philHealthNo: profile.philHealthNo,
        gsisNo: profile.gsisNo,
        tinNo: profile.tinNo,
        subjectSpecialization: profile.subjectSpecialization,
        bachelorsDegree: profile.bachelorsDegree,
        postGraduate: profile.postGraduate,
        profileImage: profile.profileImage ?? null,
        dateOfBirth: profile.dateOfBirth
            ? profile.dateOfBirth.toISOString().split("T")[0]
            : null,
        sssNo: profile.sssNo || null,
        umidNo: profile.umidNo || null,
        philSysNo: profile.philSysNo || null,
        agencyEmployeeNo: profile.agencyEmployeeNo || null,
        nameExtension: profile.nameExtension || null,
        placeOfBirth: profile.placeOfBirth || null,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        bloodType: profile.bloodType || null,
        telephoneNo: profile.telephoneNo || null,
        citizenship: profile.citizenship || "Filipino",
        dualCitizenshipType: profile.dualCitizenshipType || null,
        dualCitizenshipCountry: profile.dualCitizenshipCountry || null,
        residentialCountry: profile.residentialCountry || "PH",
        residentialRegion: profile.residentialRegion || null,
        residentialHouseNo: profile.residentialHouseNo || null,
        residentialStreet: profile.residentialStreet || null,
        residentialSubdivision: profile.residentialSubdivision || null,
        residentialBarangay: profile.residentialBarangay || null,
        residentialCity: profile.residentialCity || null,
        residentialProvince: profile.residentialProvince || null,
        residentialZipCode: profile.residentialZipCode || null,
        permanentCountry: profile.permanentCountry || "PH",
        permanentRegion: profile.permanentRegion || null,
        permanentHouseNo: profile.permanentHouseNo || null,
        permanentStreet: profile.permanentStreet || null,
        permanentSubdivision: profile.permanentSubdivision || null,
        permanentBarangay: profile.permanentBarangay || null,
        permanentCity: profile.permanentCity || null,
        permanentProvince: profile.permanentProvince || null,
        permanentZipCode: profile.permanentZipCode || null,
        sameAsResidential: profile.sameAsResidential,
    };
}

export function mapStateToFamily(profile: ProfileState) {
    return {
        spouseSurname: profile.spouseSurname || null,
        spouseFirstName: profile.spouseFirstName || null,
        spouseMiddleName: profile.spouseMiddleName || null,
        spouseNameExtension:
            profile.spouseNameExtension === "N/A"
                ? null
                : profile.spouseNameExtension || null,
        spouseOccupation: profile.spouseOccupation || null,
        spouseEmployerName: profile.spouseEmployerName || null,
        spouseBusinessAddress: profile.spouseBusinessAddress || null,
        spouseTelephoneNo: profile.spouseTelephoneNo || null,
        fatherSurname: profile.fatherSurname || null,
        fatherFirstName: profile.fatherFirstName || null,
        fatherMiddleName: profile.fatherMiddleName || null,
        fatherNameExtension:
            profile.fatherNameExtension === "N/A"
                ? null
                : profile.fatherNameExtension || null,
        motherSurname: profile.motherSurname || null,
        motherFirstName: profile.motherFirstName || null,
        motherMiddleName: profile.motherMiddleName || null,
    };
}

export function mapStateToEducation(profile: ProfileState, profileId: string) {
    const levels = [
        { level: "ELEMENTARY", prefix: "educationElementary" },
        { level: "SECONDARY", prefix: "educationSecondary" },
        { level: "VOCATIONAL", prefix: "educationVocational" },
        { level: "COLLEGE", prefix: "educationCollege" },
        { level: "GRADUATE", prefix: "educationGraduate" },
    ] as const;

    return levels.map(({ level, prefix }) => ({
        profileId,
        level,
        schoolName:
            (profile[`${prefix}School` as keyof ProfileState] as string) ||
            null,
        degreeOrCourse:
            (profile[`${prefix}Degree` as keyof ProfileState] as string) ||
            null,
        attendanceFrom: (profile[
            `${prefix}From` as keyof ProfileState
        ] as string)
            ? parseInt(profile[`${prefix}From` as keyof ProfileState] as string)
            : null,
        attendanceTo: (profile[`${prefix}To` as keyof ProfileState] as string)
            ? parseInt(profile[`${prefix}To` as keyof ProfileState] as string)
            : null,
        highestUnitsEarned:
            (profile[`${prefix}Units` as keyof ProfileState] as string) || null,
        yearGraduated: (profile[
            `${prefix}Graduated` as keyof ProfileState
        ] as string)
            ? parseInt(
                  profile[`${prefix}Graduated` as keyof ProfileState] as string,
              )
            : null,
        scholarshipHonors:
            (profile[`${prefix}Honors` as keyof ProfileState] as string) ||
            null,
    }));
}

export function mapStateToEmergency(profile: ProfileState) {
    return {
        name: profile.emergencyName || null,
        relationship: profile.emergencyRelationship || null,
        address: profile.emergencyAddress || null,
        telephoneNo: profile.emergencyTelephoneNo || null,
    };
}

export function mapStateToChildren(
    profile: ProfileState,
    profileId: string,
): { profileId: string; name: string; dateOfBirth: string | null }[] {
    return profile.children
        .filter((c) => c.name.trim())
        .map((c) => ({
            profileId,
            name: c.name.trim(),
            dateOfBirth: c.dateOfBirth || null,
        }));
}
