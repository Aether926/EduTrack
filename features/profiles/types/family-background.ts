// PDS CS Form 212 — Section II: Family Background

export type ProfileFamily = {
  id?: string;
  profileId: string;

  // Spouse (Item 22)
  spouseSurname: string;
  spouseFirstName: string;
  spouseMiddleName: string;
  spouseNameExtension: string;
  spouseOccupation: string;
  spouseEmployerName: string;
  spouseBusinessAddress: string;
  spouseTelephoneNo: string;

  // Father (Item 24)
  fatherSurname: string;
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherNameExtension: string;

  // Mother's Maiden Name (Item 25)
  motherSurname: string;
  motherFirstName: string;
  motherMiddleName: string;
};

export type ProfileChild = {
  id?: string;
  profileId: string;
  name: string;
  dateOfBirth: string; // "YYYY-MM-DD" string for form; displayed as formatted date
};

export type FamilyBackgroundState = {
  family: ProfileFamily;
  children: ProfileChild[];
};

export const getInitialFamily = (profileId: string): ProfileFamily => ({
  profileId,
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
});

export const getInitialChild = (profileId: string): ProfileChild => ({
  profileId,
  name: "",
  dateOfBirth: "",
});