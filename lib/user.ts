import { createClient } from "./supabase/server";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    status: string;
}

export interface UserWithProfile {
    id: string;
    firstName: string;
    lastName: string;
    middleInitial: string;
    email: string;
    role: string;
    status: string;
    contactNumber: string;
    createdAt: string;
}

export type Teacher = {
  id: string;
  user_id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  middle_initial: string | null;
  email: string;
  contact_number: string | null;
  position: string;
  profile_image: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
};

export type TeacherTableRow = {
  id: string;
  employeeid: string;
  fullname: string;
  position: string;
  contact: string;
  email: string;
  profileImage: string | null;
  status: string;
  subjectSpecialization: string | null;
};

export type ProfessionalDevelopment = {
  id: string;
  title: string;
  type: 'TRAINING' | 'SEMINAR';
  level: 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
  sponsoring_agency: string;
  total_hours: number;
  start_date: string;
  end_date: string | null;
  venue: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TrainingSeminarTableRow = {
  id: string;
  title: string;
  type: "TRAINING" | "SEMINAR";
  level: "REGIONAL" | "NATIONAL" | "INTERNATIONAL";
  date: string;
  totalHours: number;
  sponsor: string;
  raw: ProfessionalDevelopment;
};


export type CreateProfessionalDevelopmentInput = {
  title: string;
  type: 'TRAINING' | 'SEMINAR';
  level: 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
  sponsoring_agency: string;
  total_hours: number;
  start_date: string;
  end_date?: string;
  venue?: string;
  description?: string;
  teacher_ids?: string[]; 
};


export async function getUsers() {
    const supabase = await createClient();
    const { data: users } = await supabase
        .from("User")
        .select()
        .order("createdAt", { ascending: false });

    return users;
}

export async function getUsersWithPending(
    users: User[]
): Promise<UserWithProfile[]> {
    const supabase = await createClient();

    try {
        const pendingUsers = users.filter((user) => user.status === "PENDING");
        const pendingProfiles = await Promise.all(
            pendingUsers.map(async (user) => {
                const { data: profile } = await supabase
                    .from("Profile")
                    .select("firstName, lastName, middleInitial, contactNumber")
                    .eq("id", user.id)
                    .single();

                return {
                    id: user.id,
                    firstName: profile?.firstName || "",
                    lastName: profile?.lastName || "",
                    middleInitial: profile?.middleInitial || "",
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    contactNumber: profile?.contactNumber || "",
                    createdAt: user.createdAt,
                };
            })
        );

        return pendingProfiles;
    } catch (error) {
        
        return [];
    }
}

export async function getUsersWithRejected(
    users: User[]
): Promise<UserWithProfile[]> {
    const supabase = await createClient();

    try {
        const rejectedUsers = users.filter(
            (user) => user.status === "REJECTED"
        );
        const rejectedProfiles = await Promise.all(
            rejectedUsers.map(async (user) => {
                const { data: profile } = await supabase
                    .from("Profile")
                    .select("firstName, lastName, middleInitial, contactNumber")
                    .eq("id", user.id)
                    .single();

                return {
                    id: user.id,
                    firstName: profile?.firstName || "",
                    lastName: profile?.lastName || "",
                    middleInitial: profile?.middleInitial || "",
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    contactNumber: profile?.contactNumber || "",
                    createdAt: user.createdAt,
                };
            })
        );

        return rejectedProfiles;
    } catch (error) {
        
        return [];
    }
}