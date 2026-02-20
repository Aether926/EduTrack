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

    employeeId: "",
    position: "Teacher I",
    plantillaNo: "",

    pagibigNo: "",
    philHealthNo: "",
    gsisNo: "",
    tinNo: "",

    dateOfOriginalAppointment: undefined,
    dateOfLatestAppointment: undefined,

    subjectSpecialization: "",
    bachelorsDegree: "",
    postGraduate: "",

    profileImage: null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbProfileToState(row: any, fallback: ProfileState): ProfileState {
  if (!row) return fallback;

  return {
    ...fallback,
    ...row,
    dateOfBirth: toDate(row?.dateOfBirth),
    dateOfOriginalAppointment: toDate(row?.dateOfOriginalAppointment),
    dateOfLatestAppointment: toDate(row?.dateOfLatestAppointment),
  };
}

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
  };
}
