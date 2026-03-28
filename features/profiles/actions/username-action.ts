"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateUsername(
    firstName: string,
    lastName: string,
): Promise<string> {
    const supabase = await createClient();
    const base =
        `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}`
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9.]/g, "");

    // Check if base username exists
    const { data } = await supabase
        .from("Profile")
        .select("username")
        .ilike("username", `${base}%`);

    const taken = (data ?? []).map((r) => r.username);
    if (!taken.includes(base)) return base;

    // Append number until unique
    let i = 1;
    while (taken.includes(`${base}${i}`)) i++;
    return `${base}${i}`;
}

export async function updateUsername(
    newUsername: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) return { ok: false, error: "Not authenticated" };

    // Check cooldown — once per day
    const { data: profile } = await supabase
        .from("Profile")
        .select("lastUsernameChange")
        .eq("id", user.id)
        .single();

    if (profile?.lastUsernameChange) {
        const last = new Date(profile.lastUsernameChange).getTime();
        const elapsed = Date.now() - last;
        const oneDayMs = 1000 * 60 * 60 * 24;

        if (elapsed < oneDayMs) {
            const hoursLeft = Math.ceil(
                (oneDayMs - elapsed) / (1000 * 60 * 60),
            );
            return {
                ok: false,
                error: `You can change your username again in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}.`,
            };
        }
    }

    // Check if username is taken
    const { data: existing } = await supabase
        .from("Profile")
        .select("id")
        .eq("username", newUsername)
        .neq("id", user.id)
        .maybeSingle();

    if (existing) return { ok: false, error: "Username is already taken." };

    // Update username
    const { error } = await supabase
        .from("Profile")
        .update({
            username: newUsername,
            lastUsernameChange: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/profile");
    return { ok: true };
}
