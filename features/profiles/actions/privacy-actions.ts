"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PrivacySettings = {
    personalInfo:        boolean;
    contactInfo:         boolean;
    address:             boolean;
    familyBackground:    boolean;
    governmentIds:       boolean;
    emergencyContact:    boolean;
    educationCredentials:boolean;
    educationBackground: boolean;
    employmentInfo:      boolean;
    trainings:           boolean;
};

export async function savePrivacySettings(
    settings: PrivacySettings
): Promise<{ ok: true } | { ok: false; error: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) return { ok: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("Profile")
        .update({ privacySettings: settings })
        .eq("id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/profile");
    return { ok: true };
}