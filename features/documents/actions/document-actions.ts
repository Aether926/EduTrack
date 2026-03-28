"use server";

import { insertActivity } from "@/lib/database/activity";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult<T = null> =
    | { ok: true; data?: T }
    | { ok: false; error: string };

function errMsg(e: unknown) {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return "Something went wrong";
}

// ── Checklist (now includes pending requests) ─────────────────────────────────

export async function getMyDocumentChecklist() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const admin = createAdminClient();

    const [{ data: docTypes }, { data: submissions }, { data: requests }] =
        await Promise.all([
            admin
                .from("DocumentType")
                .select("*")
                .order("required", { ascending: false }),
            admin
                .from("TeacherDocument")
                .select("*")
                .eq("teacher_id", auth.user.id),
            admin
                .from("DocumentRequest")
                .select("*")
                .eq("teacher_id", auth.user.id)
                .eq("status", "PENDING"),
        ]);

    const submissionMap = new Map(
        (submissions ?? []).map((s) => [s.document_type_id, s]),
    );
    const requestMap = new Map(
        (requests ?? []).map((r) => [r.teacher_document_id, r]),
    );

    return (docTypes ?? []).map((dt) => {
        const submission = submissionMap.get(dt.id) ?? null;
        const pendingRequest = submission
            ? (requestMap.get(submission.id) ?? null)
            : null;
        return { documentType: dt, submission, pendingRequest };
    });
}

// ── Signed URL (teacher = own docs only, admin = all) ─────────────────────────

export async function getDocumentSignedUrl(
    docId: string,
): Promise<ActionResult<{ url: string }>> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { ok: false, error: "Not authenticated" };

        const admin = createAdminClient();

        const { data: doc } = await admin
            .from("TeacherDocument")
            .select("file_path, teacher_id")
            .eq("id", docId)
            .single();

        if (!doc?.file_path) return { ok: false, error: "Document not found" };

        const isAdmin = ["ADMIN", "SUPERADMIN"].includes(
            auth.user.user_metadata?.role ?? "",
        );

        const isOwner = doc.teacher_id === auth.user.id;
        if (!isAdmin && !isOwner) return { ok: false, error: "Unauthorized" };

        const { data: signed, error: signErr } = await admin.storage
            .from("teacher-documents")
            .createSignedUrl(doc.file_path, 60);

        if (signErr || !signed?.signedUrl)
            return {
                ok: false,
                error: signErr?.message ?? "Failed to generate URL",
            };

        return { ok: true, data: { url: signed.signedUrl } };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

// ── Submit / Resubmit ─────────────────────────────────────────────────────────

export async function submitTeacherDocument(
    documentTypeId: string,
    formData: FormData,
): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { ok: false, error: "Not authenticated" };

        const file = formData.get("file");
        if (!(file instanceof File))
            return { ok: false, error: "File is required" };

        const admin = createAdminClient();

        const { data: docType } = await admin
            .from("DocumentType")
            .select("*")
            .eq("id", documentTypeId)
            .single();
        if (!docType) return { ok: false, error: "Document type not found" };

        if (docType.allowed_mime && !docType.allowed_mime.includes(file.type))
            return {
                ok: false,
                error: `Invalid file type. Allowed: ${docType.allowed_mime.join(", ")}`,
            };
        if (docType.max_mb && file.size > docType.max_mb * 1024 * 1024)
            return {
                ok: false,
                error: `File too large. Maximum: ${docType.max_mb}MB`,
            };

        const { data: existing } = await admin
            .from("TeacherDocument")
            .select("id, file_path, status")
            .eq("teacher_id", auth.user.id)
            .eq("document_type_id", documentTypeId)
            .maybeSingle();

        if (existing?.file_path)
            await admin.storage
                .from("teacher-documents")
                .remove([existing.file_path]);

        const now = new Date().toISOString();
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const docId = existing?.id ?? crypto.randomUUID();
        const path = `documents/${auth.user.id}/${docType.code}/${docId}/${Date.now()}_${safeName}`;

        const { error: uploadErr } = await admin.storage
            .from("teacher-documents")
            .upload(path, file, { upsert: true });
        if (uploadErr) return { ok: false, error: uploadErr.message };

        if (existing?.id) {
            const { error } = await admin
                .from("TeacherDocument")
                .update({
                    status: "SUBMITTED",
                    file_path: path,
                    file_url: null,
                    mime_type: file.type,
                    file_size_bytes: file.size,
                    submitted_at: now,
                    reviewed_at: null,
                    reviewed_by: null,
                    reject_reason: null,
                    updated_at: now,
                })
                .eq("id", existing.id);
            if (error) return { ok: false, error: error.message };

            // close any pending resubmit request automatically
            await admin
                .from("DocumentRequest")
                .update({ status: "APPROVED", reviewed_at: now })
                .eq("teacher_document_id", existing.id)
                .eq("type", "RESUBMIT")
                .eq("status", "PENDING");
        } else {
            const { error } = await admin.from("TeacherDocument").insert({
                id: docId,
                teacher_id: auth.user.id,
                document_type_id: documentTypeId,
                status: "SUBMITTED",
                file_path: path,
                file_url: null,
                mime_type: file.type,
                file_size_bytes: file.size,
                submitted_at: now,
            });
            if (error) return { ok: false, error: error.message };
        }

        await insertActivity([
            {
                actor_id: auth.user.id,
                target_user_id: auth.user.id,
                action: "DOC_SUBMITTED",
                entity_type: "TeacherDocument",
                entity_id: docId,
                message: `You submitted your ${docType.name}.`,
                recipient_role: "actor",
                meta: {
                    documentTypeId,
                    docTypeName: docType.name,
                    docTypeCode: docType.code,
                },
            },
        ]);

        revalidatePath("/documents");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

// ── Teacher: Request Resubmit ─────────────────────────────────────────────────

export async function requestResubmit(
    docId: string,
    reason: string,
): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { ok: false, error: "Not authenticated" };
        if (!reason.trim())
            return { ok: false, error: "Please provide a reason." };

        const admin = createAdminClient();

        const { data: doc } = await admin
            .from("TeacherDocument")
            .select("id, teacher_id, document_type_id, status")
            .eq("id", docId)
            .single();

        if (!doc) return { ok: false, error: "Document not found" };
        if (doc.teacher_id !== auth.user.id)
            return { ok: false, error: "Unauthorized" };

        const { data: existing } = await admin
            .from("DocumentRequest")
            .select("id")
            .eq("teacher_document_id", docId)
            .eq("type", "RESUBMIT")
            .eq("status", "PENDING")
            .maybeSingle();
        if (existing)
            return {
                ok: false,
                error: "You already have a pending resubmit request.",
            };

        const { data: req, error } = await admin
            .from("DocumentRequest")
            .insert({
                teacher_id: auth.user.id,
                teacher_document_id: docId,
                document_type_id: doc.document_type_id,
                type: "RESUBMIT",
                status: "PENDING",
                reason: reason.trim(),
            })
            .select("id")
            .single();

        if (error) return { ok: false, error: error.message };

        await insertActivity([
            {
                actor_id: auth.user.id,
                target_user_id: auth.user.id,
                action: "DOC_RESUBMIT_REQUESTED",
                entity_type: "DocumentRequest",
                entity_id: req.id,
                message: "You requested to resubmit a document.",
                recipient_role: "actor", // ← add
                meta: { docId, reason: reason.trim() },
            },
        ]);

        revalidatePath("/documents");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

// ── Teacher: Request Delete ───────────────────────────────────────────────────

export async function requestDelete(
    docId: string,
    reason: string,
): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { ok: false, error: "Not authenticated" };
        if (!reason.trim())
            return { ok: false, error: "Please provide a reason." };

        const admin = createAdminClient();

        const { data: doc } = await admin
            .from("TeacherDocument")
            .select("id, teacher_id, document_type_id")
            .eq("id", docId)
            .single();

        if (!doc) return { ok: false, error: "Document not found" };
        if (doc.teacher_id !== auth.user.id)
            return { ok: false, error: "Unauthorized" };

        const { data: existing } = await admin
            .from("DocumentRequest")
            .select("id")
            .eq("teacher_document_id", docId)
            .eq("type", "DELETE")
            .eq("status", "PENDING")
            .maybeSingle();
        if (existing)
            return {
                ok: false,
                error: "You already have a pending delete request.",
            };

        const { data: req, error } = await admin
            .from("DocumentRequest")
            .insert({
                teacher_id: auth.user.id,
                teacher_document_id: docId,
                document_type_id: doc.document_type_id,
                type: "DELETE",
                status: "PENDING",
                reason: reason.trim(),
            })
            .select("id")
            .single();

        if (error) return { ok: false, error: error.message };

        await insertActivity([
            {
                actor_id: auth.user.id,
                target_user_id: auth.user.id,
                action: "DOC_RESUBMIT_REQUESTED",
                entity_type: "DocumentRequest",
                entity_id: req.id,
                message: "You requested to resubmit a document.",
                recipient_role: "actor", // ← add
                meta: { docId, reason: reason.trim() },
            },
        ]);

        revalidatePath("/documents");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}
