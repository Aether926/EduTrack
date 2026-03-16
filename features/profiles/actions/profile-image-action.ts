"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadProfileImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) return { ok: false, error: "Not authenticated" };

    const file = formData.get("file") as File;
    if (!file) return { ok: false, error: "No file provided" };

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        return { ok: false, error: "Only image files are allowed (JPEG, PNG, WebP, GIF)" };
    }

    // Validate file size — 5MB max
    if (file.size > 5 * 1024 * 1024) {
        return { ok: false, error: "File size must be under 5MB" };
    }

    const ext      = file.name.split(".").pop() ?? "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    // Delete old file first — ignore error if doesn't exist
    await supabase.storage
        .from("profile-picture")
        .remove([
            `${user.id}/avatar.jpg`,
            `${user.id}/avatar.jpeg`,
            `${user.id}/avatar.png`,
            `${user.id}/avatar.webp`,
            `${user.id}/avatar.gif`,
        ]);

    // Upload new file
    const { error: uploadError } = await supabase.storage
        .from("profile-picture")
        .upload(filePath, file, { upsert: true });

    if (uploadError) return { ok: false, error: uploadError.message };

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from("profile-picture")
        .getPublicUrl(filePath);

    // Save URL to Profile table
    const { error: dbError } = await supabase
        .from("Profile")
        .update({ profileImage: publicUrl })
        .eq("id", user.id);

    if (dbError) return { ok: false, error: dbError.message };

    revalidatePath("/profile");
    revalidatePath("/teacher-profiles");
    revalidatePath("/admin-actions/teachers");

    return { ok: true, url: publicUrl };
}

export async function deleteProfileImage(): Promise<{ ok: true } | { ok: false; error: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) return { ok: false, error: "Not authenticated" };

    // Delete all possible extensions
    await supabase.storage
        .from("profile-picture")
        .remove([
            `${user.id}/avatar.jpg`,
            `${user.id}/avatar.jpeg`,
            `${user.id}/avatar.png`,
            `${user.id}/avatar.webp`,
            `${user.id}/avatar.gif`,
        ]);

    // Clear profileImage in Profile table
    const { error: dbError } = await supabase
        .from("Profile")
        .update({ profileImage: null })
        .eq("id", user.id);

    if (dbError) return { ok: false, error: dbError.message };

    revalidatePath("/profile");
    revalidatePath("/teacher-profiles");
    revalidatePath("/admin-actions/teachers");

    return { ok: true };
}