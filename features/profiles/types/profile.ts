export type TempProfileData = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  position: string;
  username: string;
};

export type ProfileState = {
  id?: string;

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

  contactNumber: string;
  address: string;
  email: string;

  employeeId: string;
  position: string;
  plantillaNo: string;

  pagibigNo: string;
  philHealthNo: string;
  gsisNo: string;
  tinNo: string;

  dateOfOriginalAppointment?: Date;
  dateOfLatestAppointment?: Date;

  subjectSpecialization: string;
  bachelorsDegree: string;
  postGraduate: string;

  // optional if you store it
  profileImage?: string | null;
};
