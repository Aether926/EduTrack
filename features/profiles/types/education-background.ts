export type EducationLevel =
  | "ELEMENTARY"
  | "SECONDARY"
  | "VOCATIONAL"
  | "COLLEGE"
  | "GRADUATE";

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  ELEMENTARY: "Elementary",
  SECONDARY: "Secondary",
  VOCATIONAL: "Vocational / Trade Course",
  COLLEGE: "College",
  GRADUATE: "Graduate Studies",
};

export const EDUCATION_LEVELS: EducationLevel[] = [
  "ELEMENTARY",
  "SECONDARY",
  "VOCATIONAL",
  "COLLEGE",
  "GRADUATE",
];

export type ProfileEducation = {
  id?: string;
  profileId: string;
  level: EducationLevel;
  schoolName: string;
  degreeOrCourse: string;
  attendanceFrom: string;  // year as string in form
  attendanceTo: string;    // year as string in form
  highestUnitsEarned: string;
  yearGraduated: string;   // year as string in form
  scholarshipHonors: string;
};

export type EducationByLevel = Record<EducationLevel, ProfileEducation>;

export function getInitialEducationRow(
  profileId: string,
  level: EducationLevel
): ProfileEducation {
  return {
    profileId,
    level,
    schoolName: "",
    degreeOrCourse: "",
    attendanceFrom: "",
    attendanceTo: "",
    highestUnitsEarned: "",
    yearGraduated: "",
    scholarshipHonors: "",
  };
}

export function getInitialEducationByLevel(profileId: string): EducationByLevel {
  return Object.fromEntries(
    EDUCATION_LEVELS.map((level) => [level, getInitialEducationRow(profileId, level)])
  ) as EducationByLevel;
}