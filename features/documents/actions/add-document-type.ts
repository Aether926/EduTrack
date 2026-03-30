"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult<T = null> =
    | { ok: true; data?: T }
    | { ok: false; error: string };

export type DocumentTypeRow = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    required: boolean;
    allowed_mime: string[] | null;
    max_mb: number | null;
};

export async function getDocumentTypes(): Promise<DocumentTypeRow[]> {
    const admin = createAdminClient();
    const { data } = await admin.from("DocumentType").select("*").order("name");
    return (data ?? []) as DocumentTypeRow[];
}

export async function createDocumentType(payload: {
    name: string;
    code: string;
    description?: string;
    required: boolean;
    max_mb?: number;
}): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { ok: false, error: "Not authenticated" };

        const role = auth.user.user_metadata?.role ?? "TEACHER";
        if (!["ADMIN", "SUPERADMIN"].includes(role))
            return { ok: false, error: "Unauthorized" };

        if (!payload.name.trim())
            return { ok: false, error: "Name is required." };
        if (!payload.code.trim())
            return { ok: false, error: "Code is required." };

        const admin = createAdminClient();

        // Check for duplicate code
        const { data: existing } = await admin
            .from("DocumentType")
            .select("id")
            .eq("code", payload.code.toUpperCase().trim())
            .maybeSingle();

        if (existing)
            return {
                ok: false,
                error: "A document type with this code already exists.",
            };

        const { error } = await admin.from("DocumentType").insert({
            name: payload.name.trim(),
            code: payload.code.toUpperCase().trim().replace(/\s+/g, "_"),
            description: payload.description?.trim() || null,
            required: payload.required,
            max_mb: payload.max_mb || null,
        });

        if (error) return { ok: false, error: error.message };

        revalidatePath("/admin-actions/documents");
        revalidatePath("/documents");
        return { ok: true };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : "Something went wrong",
        };
    }
}

export async function updateDocumentType(
    id: string,
    payload: {
        name: string;
        description?: string;
        required: boolean;
        max_mb?: number;
    },
): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { ok: false, error: "Not authenticated" };

        const role = auth.user.user_metadata?.role ?? "TEACHER";
        if (!["ADMIN", "SUPERADMIN"].includes(role))
            return { ok: false, error: "Unauthorized" };

        if (!payload.name.trim())
            return { ok: false, error: "Name is required." };

        const admin = createAdminClient();
        const { error } = await admin
            .from("DocumentType")
            .update({
                name: payload.name.trim(),
                description: payload.description?.trim() || null,
                required: payload.required,
                max_mb: payload.max_mb || null,
            })
            .eq("id", id);

        if (error) return { ok: false, error: error.message };

        revalidatePath("/admin-actions/documents");
        revalidatePath("/documents");
        return { ok: true };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : "Something went wrong",
        };
    }
}

export async function toggleDocumentTypeRequired(
    id: string,
    required: boolean,
): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { ok: false, error: "Not authenticated" };

        const role = auth.user.user_metadata?.role ?? "TEACHER";
        if (!["ADMIN", "SUPERADMIN"].includes(role))
            return { ok: false, error: "Unauthorized" };

        const admin = createAdminClient();
        const { error } = await admin
            .from("DocumentType")
            .update({ required })
            .eq("id", id);

        if (error) return { ok: false, error: error.message };

        revalidatePath("/admin-actions/documents");
        return { ok: true };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : "Something went wrong",
        };
    }
}
