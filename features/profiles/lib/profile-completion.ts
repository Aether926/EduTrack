import type { ProfileState } from "@/features/profiles/types/profile";

export type CompletionSection = {
  label: string;
  completed: boolean;
  fields: string[];
};

export type CompletionResult = {
  percentage: number;
  sections: CompletionSection[];
  completedCount: number;
  totalCount: number;
};

function check(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function calculateProfileCompletion(data: ProfileState): CompletionResult {
  const sections: CompletionSection[] = [
    // ── Basic Info ──
    {
      label: "Basic Information",
      completed: false,
      fields: [],
    },
    // ── Contact ──
    {
      label: "Contact & Address",
      completed: false,
      fields: [],
    },
    // ── Physical Info ──
    {
      label: "Physical Information",
      completed: false,
      fields: [],
    },
    // ── Government IDs ──
    {
      label: "Government IDs",
      completed: false,
      fields: [],
    },
    // ── Employment ──
    {
      label: "Employment Info",
      completed: false,
      fields: [],
    },
    // ── Family Background ──
    {
      label: "Family Background",
      completed: false,
      fields: [],
    },
    // ── Education ──
    {
      label: "Educational Background",
      completed: false,
      fields: [],
    },
    // ── Emergency Contact ──
    {
      label: "Emergency Contact",
      completed: false,
      fields: [],
    },
  ];

  // ── Basic Info ──
  const basicMissing: string[] = [];
  if (!check(data.firstName)) basicMissing.push("First Name");
  if (!check(data.lastName)) basicMissing.push("Last Name");
  if (!check(data.dateOfBirth)) basicMissing.push("Date of Birth");
  if (!check(data.placeOfBirth)) basicMissing.push("Place of Birth");
  if (!check(data.civilStatus)) basicMissing.push("Civil Status");
  if (!check(data.gender)) basicMissing.push("Gender");
  if (!check(data.nationality)) basicMissing.push("Nationality");
  if (!check(data.religion)) basicMissing.push("Religion");
  if (!check(data.citizenship)) basicMissing.push("Citizenship");
  sections[0].fields = basicMissing;
  sections[0].completed = basicMissing.length === 0;

  // ── Contact & Address ──
  const contactMissing: string[] = [];
  if (!check(data.contactNumber)) contactMissing.push("Contact Number");
  if (!check(data.residentialCity)) contactMissing.push("Residential City");
  if (!check(data.residentialProvince)) contactMissing.push("Residential Province");
  if (!check(data.residentialBarangay)) contactMissing.push("Residential Barangay");
  sections[1].fields = contactMissing;
  sections[1].completed = contactMissing.length === 0;

  // ── Physical Info ──
  const physicalMissing: string[] = [];
  if (!check(data.height)) physicalMissing.push("Height");
  if (!check(data.weight)) physicalMissing.push("Weight");
  if (!check(data.bloodType)) physicalMissing.push("Blood Type");
  sections[2].fields = physicalMissing;
  sections[2].completed = physicalMissing.length === 0;

  // ── Government IDs ──
  const idsMissing: string[] = [];
  if (!check(data.gsisNo)) idsMissing.push("GSIS No.");
  if (!check(data.pagibigNo)) idsMissing.push("PAG-IBIG No.");
  if (!check(data.philHealthNo)) idsMissing.push("PhilHealth No.");
  if (!check(data.tinNo)) idsMissing.push("TIN No.");
  if (!check(data.sssNo)) idsMissing.push("SSS No.");
  sections[3].fields = idsMissing;
  sections[3].completed = idsMissing.length === 0;

  // ── Employment ──
  const employmentMissing: string[] = [];
  if (!check(data.employeeId)) employmentMissing.push("Employee ID");
  if (!check(data.position)) employmentMissing.push("Position");
  if (!check(data.plantillaNo)) employmentMissing.push("Plantilla No.");
  if (!check(data.dateOfOriginalAppointment)) employmentMissing.push("Date of Original Appointment");
  sections[4].fields = employmentMissing;
  sections[4].completed = employmentMissing.length === 0;

  // ── Family Background ──
  const familyMissing: string[] = [];
  if (!check(data.fatherSurname)) familyMissing.push("Father's Surname");
  if (!check(data.fatherFirstName)) familyMissing.push("Father's First Name");
  if (!check(data.motherSurname)) familyMissing.push("Mother's Surname");
  if (!check(data.motherFirstName)) familyMissing.push("Mother's First Name");
  sections[5].fields = familyMissing;
  sections[5].completed = familyMissing.length === 0;

  // ── Education ──
  const educationMissing: string[] = [];
  if (!check(data.educationElementarySchool)) educationMissing.push("Elementary School");
  if (!check(data.educationSecondarySchool)) educationMissing.push("Secondary School");
  if (!check(data.educationCollegeSchool)) educationMissing.push("College School");
  if (!check(data.educationCollegeDegree)) educationMissing.push("College Degree");
  sections[6].fields = educationMissing;
  sections[6].completed = educationMissing.length === 0;

  // ── Emergency Contact ──
  const emergencyMissing: string[] = [];
  if (!check(data.emergencyName)) emergencyMissing.push("Contact Name");
  if (!check(data.emergencyRelationship)) emergencyMissing.push("Relationship");
  if (!check(data.emergencyTelephoneNo)) emergencyMissing.push("Contact Number");
  sections[7].fields = emergencyMissing;
  sections[7].completed = emergencyMissing.length === 0;

  const completedCount = sections.filter((s) => s.completed).length;
  const totalCount = sections.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return { percentage, sections, completedCount, totalCount };
}

export function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function getCompletionTextColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600 dark:text-green-400";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}