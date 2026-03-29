"use server";
import { createClient } from "@/lib/supabase/server";
import type {
    ProfileFamily,
    ProfileChild,
} from "@/features/profiles/types/family-background";

export async function fetchFamilyBackground(profileId: string) {
    const supabase = await createClient();
    const [
        { data: family, error: familyError },
        { data: children, error: childrenError },
    ] = await Promise.all([
        supabase
            .from("ProfileFamily")
            .select("*")
            .eq("profileId", profileId)
            .single(),
        supabase
            .from("ProfileChildren")
            .select("*")
            .eq("profileId", profileId)
            .order("createdAt", { ascending: true }),
    ]);

    if (familyError && familyError.code !== "PGRST116")
        throw new Error(familyError.message);
    if (childrenError) throw new Error(childrenError.message);

    return {
        family: family ?? null,
        children: (children ?? []) as ProfileChild[],
    };
}

export async function saveFamilyBackground(
    profileId: string,
    family: ProfileFamily,
) {
    const supabase = await createClient();
    const payload = {
        profileId,
        spouseSurname: family.spouseSurname || null,
        spouseFirstName: family.spouseFirstName || null,
        spouseMiddleName: family.spouseMiddleName || null,
        spouseNameExtension: family.spouseNameExtension || null,
        spouseOccupation: family.spouseOccupation || null,
        spouseEmployerName: family.spouseEmployerName || null,
        spouseBusinessAddress: family.spouseBusinessAddress || null,
        spouseTelephoneNo: family.spouseTelephoneNo || null,
        fatherSurname: family.fatherSurname || null,
        fatherFirstName: family.fatherFirstName || null,
        fatherMiddleName: family.fatherMiddleName || null,
        fatherNameExtension: family.fatherNameExtension || null,
        motherSurname: family.motherSurname || null,
        motherFirstName: family.motherFirstName || null,
        motherMiddleName: family.motherMiddleName || null,
    };

    const { error } = family.id
        ? await supabase
              .from("ProfileFamily")
              .update(payload)
              .eq("id", family.id)
        : await supabase.from("ProfileFamily").insert({ ...payload });

    if (error) throw new Error(error.message);
}

export async function saveChildren(
    profileId: string,
    children: ProfileChild[],
) {
    const supabase = await createClient();

    const { error: deleteError } = await supabase
        .from("ProfileChildren")
        .delete()
        .eq("profileId", profileId);

    if (deleteError) throw new Error(deleteError.message);
    if (children.length === 0) return;

    const rows = children
        .filter((c) => c.name.trim())
        .map((c) => ({
            profileId,
            name: c.name.trim(),
            dateOfBirth: c.dateOfBirth || null,
        }));

    if (rows.length === 0) return;

    const { error: insertError } = await supabase
        .from("ProfileChildren")
        .insert(rows);
    if (insertError) throw new Error(insertError.message);
}
