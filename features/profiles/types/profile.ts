export type TempProfileData = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  position: string;
  username: string;
};

export type ProfileChild = {
  id?: string;
  name: string;
  dateOfBirth: string;
};

export type ProfileState = {
  id?: string;

  // ── Basic ──
  firstName: string;
  middleInitial: string;
  lastName: string;
  username: string;
  age: string;
  gender: string;
  dateOfBirth?: Date;
  civilStatus: string;
  nationality: string;
  religion: string;

  // ── Contact ──
  contactNumber: string;
  address: string;
  email: string;
  telephoneNo: string;

  // ── Employment ──
  employeeId: string;
  position: string;
  plantillaNo: string;
  dateOfOriginalAppointment?: Date;
  dateOfLatestAppointment?: Date;
  dateOfOriginalDeployment?: Date;

  // ── Government IDs ──
  pagibigNo: string;
  philHealthNo: string;
  gsisNo: string;
  tinNo: string;
  sssNo: string;
  umidNo: string;
  philSysNo: string;
  agencyEmployeeNo: string;

  // ── Education (flat/legacy) ──
  subjectSpecialization: string;
  bachelorsDegree: string;
  postGraduate: string;

  // ── PDS Personal Info ──
  nameExtension: string;
  placeOfBirth: string;
  height: string;
  weight: string;
  bloodType: string;
  citizenship: string;
  dualCitizenshipType: string;
  dualCitizenshipCountry: string;

  // ── Residential Address ──
  residentialHouseNo: string;
  residentialStreet: string;
  residentialSubdivision: string;
  residentialBarangay: string;
  residentialCity: string;
  residentialProvince: string;
  residentialZipCode: string;

  // ── Permanent Address ──
  permanentHouseNo: string;
  permanentStreet: string;
  permanentSubdivision: string;
  permanentBarangay: string;
  permanentCity: string;
  permanentProvince: string;
  permanentZipCode: string;
  sameAsResidential: boolean;

  // ── Family Background ──
  spouseSurname: string;
  spouseFirstName: string;
  spouseMiddleName: string;
  spouseNameExtension: string;
  spouseOccupation: string;
  spouseEmployerName: string;
  spouseBusinessAddress: string;
  spouseTelephoneNo: string;
  fatherSurname: string;
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherNameExtension: string;
  motherSurname: string;
  motherFirstName: string;
  motherMiddleName: string;
  children: ProfileChild[];

  // ── Education Background (structured PDS) ──
  educationElementarySchool: string;
  educationElementaryDegree: string;
  educationElementaryFrom: string;
  educationElementaryTo: string;
  educationElementaryUnits: string;
  educationElementaryGraduated: string;
  educationElementaryHonors: string;

  educationSecondarySchool: string;
  educationSecondaryDegree: string;
  educationSecondaryFrom: string;
  educationSecondaryTo: string;
  educationSecondaryUnits: string;
  educationSecondaryGraduated: string;
  educationSecondaryHonors: string;

  educationVocationalSchool: string;
  educationVocationalDegree: string;
  educationVocationalFrom: string;
  educationVocationalTo: string;
  educationVocationalUnits: string;
  educationVocationalGraduated: string;
  educationVocationalHonors: string;

  educationCollegeSchool: string;
  educationCollegeDegree: string;
  educationCollegeFrom: string;
  educationCollegeTo: string;
  educationCollegeUnits: string;
  educationCollegeGraduated: string;
  educationCollegeHonors: string;

  educationGraduateSchool: string;
  educationGraduateDegree: string;
  educationGraduateFrom: string;
  educationGraduateTo: string;
  educationGraduateUnits: string;
  educationGraduateGraduated: string;
  educationGraduateHonors: string;

  // ── Emergency Contact ──
  emergencyName: string;
  emergencyRelationship: string;
  emergencyAddress: string;
  emergencyTelephoneNo: string;

  profileImage?: string | null;
};