"use server";

import { createClient } from "./supabase/server";

export async function getProfile() {
    const supabase = await createClient();

    try {
        const { data: hrProfiles, error } = await supabase
            .from("Profile")
            .select("*");

        if (error) {
            return { success: false, error: error };
        } else {
            return { success: true, data: hrProfiles };
        }
    } catch (err) {
        return { success: false, error: err };
    }
}

export async function getHrProfiles() {
    const supabase = await createClient();

    try {
        const { data: hrProfiles, error } = await supabase
            .from("ProfileHR")
            .select("*");

        if (error) {
            return { success: false, error: error };
        } else {
            return { success: true, data: hrProfiles };
        }
    } catch (err) {
        return { success: false, error: err };
    }
}

export async function getFullProfile() {
    const supabase = await createClient();

    try {
        const { data: hrProfiles, error } = await supabase.from("Profile")
            .select(`
                *,
                User(*)
                ProfileChildren(*)
                ProfileEducation(*)
                ProfileEmergencyContact(*)
                ProfileFamily(*)
                `);

        if (error) {
            return { success: false, error: error };
        } else {
            return { success: true, data: hrProfiles };
        }
    } catch (err) {
        return { success: false, error: err };
    }
}
