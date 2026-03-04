// PDS CS Form 212 — Section I: Personal Information
// Extends existing Profile table with missing PDS fields

export type BloodType = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
export type CitizenshipType = "Filipino" | "Dual Citizenship";
export type DualCitizenshipBy = "by birth" | "by naturalization";
export type Sex = "Male" | "Female";
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated" | "Other";

// Existing Profile fields (already in DB — for reference/form binding)
export type ProfileBase = {
  id: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  gender: string;
  dateOfBirth: string;
  civilStatus: string;
  contactNumber: string;
  email: string;
  address: string; // legacy flat field — kept for backward compat
  nationality: string;
  religion: string;
  profileImage: string;
};

// NEW fields added by PDS migration
export type ProfilePersonalInfoPDS = {
  nameExtension: string;        // Jr., Sr., III
  placeOfBirth: string;
  height: string;               // stored as string for form; convert to numeric on save
  weight: string;               // stored as string for form; convert to numeric on save
  bloodType: BloodType | "";
  citizenship: CitizenshipType | "";
  dualCitizenshipType: DualCitizenshipBy | "";
  dualCitizenshipCountry: string;
  telephoneNo: string;          // landline (contactNumber = mobile, already exists)
  // Residential address (structured)
  residentialHouseNo: string;
  residentialStreet: string;
  residentialSubdivision: string;
  residentialBarangay: string;
  residentialCity: string;
  residentialProvince: string;
  residentialZipCode: string;
  // Permanent address
  permanentHouseNo: string;
  permanentStreet: string;
  permanentSubdivision: string;
  permanentBarangay: string;
  permanentCity: string;
  permanentProvince: string;
  permanentZipCode: string;
  sameAsResidential: boolean;
};

// Combined state used by the form
export type PersonalInfoFormState = ProfileBase & ProfilePersonalInfoPDS;

// What we UPSERT to Supabase (only the new PDS fields)
export type PersonalInfoPDSPayload = Omit<ProfilePersonalInfoPDS, "sameAsResidential"> & {
  sameAsResidential: boolean;
  height: number | null;
  weight: number | null;
};