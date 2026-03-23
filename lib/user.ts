import { createClient } from "./supabase/server";

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
    type: "TRAINING" | "SEMINAR";
    level: "REGIONAL" | "NATIONAL" | "INTERNATIONAL";
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
    type: "TRAINING" | "SEMINAR";
    level: "REGIONAL" | "NATIONAL" | "INTERNATIONAL";
    sponsoring_agency: string;
    total_hours: number;
    start_date: string;
    end_date?: string;
    venue?: string;
    description?: string;
    teacher_ids?: string[];
};

export async function getCurrentUser() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (!data || error) {
        return { success: false, error: "No user currently logged in!" };
    }

    return { success: true, data: data };
}

export async function getUserById(id: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from("User")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) {
            return { success: false, error };
        } else {
            return { success: true, data };
        }
    } catch (error) {
        return { success: false, error };
    }
}
