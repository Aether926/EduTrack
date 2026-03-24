/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

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

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;

async function requireAdmin() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user)
        return {
            ok: false as const,
            error: "Not authenticated",
            userId: null as string | null,
        };

    // Role from metadata — zero DB call
    const role = auth.user.user_metadata?.role ?? "TEACHER";
    if (!ADMIN_ROLES.includes(role as any))
        return {
            ok: false as const,
            error: "Unauthorized",
            userId: auth.user.id,
        };
    return {
        ok: true as const,
        error: null as string | null,
        userId: auth.user.id,
    };
}

async function insertActivity(
    rows: {
        actor_id: string;
        target_user_id: string;
        action: string;
        entity_type: string;
        entity_id: string;
        message: string;
        meta?: Record<string, unknown>;
    }[],
) {
    const admin = createAdminClient();
    await admin.from("ActivityLog").insert(
        rows.map((r) => ({
            actor_id: r.actor_id,
            target_user_id: r.target_user_id,
            action: r.action,
            entity_type: r.entity_type,
            entity_id: r.entity_id,
            message: r.message,
            meta: r.meta ?? null,
        })),
    );
}

export async function getPendingDocuments() {
    const admin = createAdminClient();
    const { data: docs } = await admin
        .from("TeacherDocument")
        .select("*, DocumentType:document_type_id(*)")
        .eq("status", "SUBMITTED")
        .order("submitted_at", { ascending: true });
    if (!docs?.length) return [];
    const teacherIds = [...new Set(docs.map((d) => d.teacher_id))];
    const [{ data: profiles }, { data: hrs }] = await Promise.all([
        admin
            .from("Profile")
            .select("id, firstName, lastName, email")
            .in("id", teacherIds),
        admin.from("ProfileHR").select("id, employeeId").in("id", teacherIds),
    ]);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const hrMap = new Map((hrs ?? []).map((h) => [h.id, h]));
    return docs.map((d) => ({
        ...d,
        teacher: {
            id: d.teacher_id,
            firstName: profileMap.get(d.teacher_id)?.firstName ?? null,
            lastName: profileMap.get(d.teacher_id)?.lastName ?? null,
            email: profileMap.get(d.teacher_id)?.email ?? null,
            employeeId: hrMap.get(d.teacher_id)?.employeeId ?? null,
        },
    }));
}

export async function getAllTeacherDocumentStatus() {
    const admin = createAdminClient();
    const [{ data: teachers }, { data: docTypes }, { data: allDocs }] =
        await Promise.all([
            admin
                .from("User")
                .select("id")
                .eq("role", "TEACHER")
                .eq("status", "APPROVED"),
            admin.from("DocumentType").select("*"),
            admin
                .from("TeacherDocument")
                .select("*, DocumentType:document_type_id(*)"),
        ]);
    const teacherIds = (teachers ?? []).map((t) => t.id);
    const [{ data: profiles }, { data: hrs }] = await Promise.all([
        admin
            .from("Profile")
            .select("id, firstName, lastName, email")
            .in("id", teacherIds),
        admin.from("ProfileHR").select("id, employeeId").in("id", teacherIds),
    ]);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const hrMap = new Map((hrs ?? []).map((h) => [h.id, h]));
    return teacherIds.map((tid) => {
        const docs = (allDocs ?? []).filter((d) => d.teacher_id === tid);
        const required = docTypes ?? [];
        return {
            teacherId: tid,
            firstName: profileMap.get(tid)?.firstName ?? null,
            lastName: profileMap.get(tid)?.lastName ?? null,
            email: profileMap.get(tid)?.email ?? null,
            employeeId: hrMap.get(tid)?.employeeId ?? null,
            approved: docs.filter((d) => d.status === "APPROVED").length,
            submitted: docs.filter((d) => d.status === "SUBMITTED").length,
            rejected: docs.filter((d) => d.status === "REJECTED").length,
            missing: required.filter(
                (dt) => !docs.find((d) => d.document_type_id === dt.id),
            ).length,
            totalRequired: docTypes?.filter((doc) => doc.required).length || 0,
            total: required.length,
            docs,
        };
    });
}

export async function getPendingDocumentRequests() {
    try {
        const admin = createAdminClient();
        const { data: requests, error } = await admin
            .from("DocumentRequest")
            .select(
                "*, TeacherDocument:teacher_document_id(*), DocumentType:document_type_id(*)",
            )
            .eq("status", "PENDING")
            .order("created_at", { ascending: true });
        if (error || !requests?.length) return [];
        const teacherIds = [
            ...new Set(
                (requests ?? []).map((r: any) => r.teacher_id).filter(Boolean),
            ),
        ];
        const [{ data: profiles }, { data: hrs }] = await Promise.all([
            admin
                .from("Profile")
                .select("id, firstName, lastName, email")
                .in("id", teacherIds),
            admin
                .from("ProfileHR")
                .select("id, employeeId")
                .in("id", teacherIds),
        ]);
        const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
        const hrMap = new Map((hrs ?? []).map((h: any) => [h.id, h]));
        return (requests ?? []).map((r: any) => ({
            ...r,
            teacher: {
                id: r.teacher_id,
                firstName: profileMap.get(r.teacher_id)?.firstName ?? null,
                lastName: profileMap.get(r.teacher_id)?.lastName ?? null,
                email: profileMap.get(r.teacher_id)?.email ?? null,
                employeeId: hrMap.get(r.teacher_id)?.employeeId ?? null,
            },
        }));
    } catch {
        return [];
    }
}

export async function approveTeacherDocument(
    docId: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };
        const admin = createAdminClient();
        const now = new Date().toISOString();
        const { data: doc } = await admin
            .from("TeacherDocument")
            .select(
                "teacher_id, document_type_id, DocumentType:document_type_id(name)",
            )
            .eq("id", docId)
            .single();
        if (!doc) return { ok: false, error: "Document not found" };
        const { error } = await admin
            .from("TeacherDocument")
            .update({
                status: "APPROVED",
                reviewed_at: now,
                reviewed_by: adminCheck.userId,
                reject_reason: null,
            })
            .eq("id", docId);
        if (error) return { ok: false, error: error.message };
        const docTypeName = (doc.DocumentType as any)?.name ?? "document";
        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: doc.teacher_id,
                action: "DOC_APPROVED",
                entity_type: "TeacherDocument",
                entity_id: docId,
                message: `Your ${docTypeName} was approved.`,
                meta: {
                    docId,
                    documentTypeId: doc.document_type_id,
                    docTypeName,
                },
            },
        ]);
        revalidatePath("/admin-actions/documents");
        revalidatePath("/documents");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

export async function rejectTeacherDocument(
    docId: string,
    reason: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };
        if (!reason?.trim())
            return { ok: false, error: "Please provide a rejection reason." };
        const admin = createAdminClient();
        const now = new Date().toISOString();
        const { data: doc } = await admin
            .from("TeacherDocument")
            .select(
                "teacher_id, document_type_id, DocumentType:document_type_id(name)",
            )
            .eq("id", docId)
            .single();
        if (!doc) return { ok: false, error: "Document not found" };
        const { error } = await admin
            .from("TeacherDocument")
            .update({
                status: "REJECTED",
                reviewed_at: now,
                reviewed_by: adminCheck.userId,
                reject_reason: reason.trim(),
            })
            .eq("id", docId);
        if (error) return { ok: false, error: error.message };
        const docTypeName = (doc.DocumentType as any)?.name ?? "document";
        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: doc.teacher_id,
                action: "DOC_REJECTED",
                entity_type: "TeacherDocument",
                entity_id: docId,
                message: `Your ${docTypeName} was rejected. Reason: ${reason.trim()}`,
                meta: {
                    docId,
                    documentTypeId: doc.document_type_id,
                    docTypeName,
                    reason: reason.trim(),
                },
            },
        ]);
        revalidatePath("/admin-actions/documents");
        revalidatePath("/documents");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

export async function adminDeleteDocument(
    docId: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };
        const admin = createAdminClient();
        const now = new Date().toISOString();
        const { data: doc } = await admin
            .from("TeacherDocument")
            .select(
                "teacher_id, file_path, document_type_id, DocumentType:document_type_id(name)",
            )
            .eq("id", docId)
            .single();
        if (!doc) return { ok: false, error: "Document not found" };
        if (doc.file_path)
            await admin.storage
                .from("teacher-documents")
                .remove([doc.file_path]);
        await admin
            .from("DocumentRequest")
            .update({
                status: "REJECTED",
                reviewed_at: now,
                reviewed_by: adminCheck.userId,
                admin_note: "Document was deleted by admin.",
            })
            .eq("teacher_document_id", docId)
            .eq("status", "PENDING");
        const { error } = await admin
            .from("TeacherDocument")
            .delete()
            .eq("id", docId);
        if (error) return { ok: false, error: error.message };
        const docTypeName = (doc.DocumentType as any)?.name ?? "document";
        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: doc.teacher_id,
                action: "DOC_DELETED_BY_ADMIN",
                entity_type: "TeacherDocument",
                entity_id: docId,
                message: `Your ${docTypeName} was deleted by admin.`,
                meta: { docId, docTypeName },
            },
        ]);
        revalidatePath("/admin-actions/documents");
        revalidatePath("/documents");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

export async function adminRequestResubmit(
    docId: string,
    adminNote: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };
        const admin = createAdminClient();
        const now = new Date().toISOString();
        const { data: doc } = await admin
            .from("TeacherDocument")
            .select(
                "teacher_id, document_type_id, DocumentType:document_type_id(name)",
            )
            .eq("id", docId)
            .single();
        if (!doc) return { ok: false, error: "Document not found" };
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
                error: "A resubmit request is already pending for this document.",
            };
        await admin
            .from("TeacherDocument")
            .update({
                status: "REJECTED",
                reviewed_at: now,
                reviewed_by: adminCheck.userId,
                reject_reason:
                    adminNote.trim() || "Admin has requested a resubmission.",
            })
            .eq("id", docId);
        await admin.from("DocumentRequest").insert({
            teacher_id: doc.teacher_id,
            teacher_document_id: docId,
            document_type_id: doc.document_type_id,
            type: "RESUBMIT",
            status: "PENDING",
            reason: "Admin requested resubmission.",
            admin_note: adminNote.trim() || null,
        });
        const docTypeName = (doc.DocumentType as any)?.name ?? "document";
        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: doc.teacher_id,
                action: "DOC_RESUBMIT_REQUESTED_BY_ADMIN",
                entity_type: "TeacherDocument",
                entity_id: docId,
                message: `Admin has requested you to resubmit your ${docTypeName}.`,
                meta: { docId, docTypeName, adminNote: adminNote.trim() },
            },
        ]);
        revalidatePath("/admin-actions/documents");
        revalidatePath("/documents");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

export async function approveDocumentRequest(
    requestId: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };
        const admin = createAdminClient();
        const now = new Date().toISOString();
        const { data: req } = await admin
            .from("DocumentRequest")
            .select(
                "*, TeacherDocument:teacher_document_id(*), DocumentType:document_type_id(*)",
            )
            .eq("id", requestId)
            .single();
        if (!req) return { ok: false, error: "Request not found" };
        if (req.status !== "PENDING")
            return { ok: false, error: "Request is no longer pending" };
        if (req.type === "DELETE") {
            const filePath = (req.TeacherDocument as any)?.file_path;
            if (filePath)
                await admin.storage
                    .from("teacher-documents")
                    .remove([filePath]);
            await admin
                .from("TeacherDocument")
                .delete()
                .eq("id", req.teacher_document_id);
        } else if (req.type === "RESUBMIT") {
            await admin
                .from("TeacherDocument")
                .update({
                    status: "REJECTED",
                    reviewed_at: now,
                    reviewed_by: adminCheck.userId,
                    reject_reason:
                        "Resubmission approved - please upload a new document.",
                })
                .eq("id", req.teacher_document_id);
        }
        const { error } = await admin
            .from("DocumentRequest")
            .update({
                status: "APPROVED",
                reviewed_by: adminCheck.userId,
                reviewed_at: now,
            })
            .eq("id", requestId);
        if (error) return { ok: false, error: error.message };
        const docTypeName = (req.DocumentType as any)?.name ?? "document";
        const action =
            req.type === "DELETE"
                ? "DOC_DELETE_APPROVED"
                : "DOC_RESUBMIT_APPROVED";
        const message =
            req.type === "DELETE"
                ? `Your request to delete ${docTypeName} was approved.`
                : `Your request to resubmit ${docTypeName} was approved. Please upload a new document.`;
        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: req.teacher_id,
                action,
                entity_type: "DocumentRequest",
                entity_id: requestId,
                message,
                meta: { requestId, docTypeName, type: req.type },
            },
        ]);
        revalidatePath("/admin-actions/documents");
        revalidatePath("/documents");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

export async function rejectDocumentRequest(
    requestId: string,
    adminNote: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };
        if (!adminNote.trim())
            return {
                ok: false,
                error: "Please provide a reason for rejection.",
            };
        const admin = createAdminClient();
        const now = new Date().toISOString();
        const { data: req } = await admin
            .from("DocumentRequest")
            .select("teacher_id, type, DocumentType:document_type_id(name)")
            .eq("id", requestId)
            .single();
        if (!req) return { ok: false, error: "Request not found" };
        const { error } = await admin
            .from("DocumentRequest")
            .update({
                status: "REJECTED",
                reviewed_by: adminCheck.userId,
                reviewed_at: now,
                admin_note: adminNote.trim(),
            })
            .eq("id", requestId);
        if (error) return { ok: false, error: error.message };
        const docTypeName = (req.DocumentType as any)?.name ?? "document";
        const action =
            req.type === "DELETE"
                ? "DOC_DELETE_REJECTED"
                : "DOC_RESUBMIT_REJECTED";
        const message =
            req.type === "DELETE"
                ? `Your request to delete ${docTypeName} was rejected.`
                : `Your request to resubmit ${docTypeName} was rejected.`;
        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: req.teacher_id,
                action,
                entity_type: "DocumentRequest",
                entity_id: requestId,
                message,
                meta: {
                    requestId,
                    docTypeName,
                    type: req.type,
                    adminNote: adminNote.trim(),
                },
            },
        ]);
        revalidatePath("/admin-actions/documents");
        revalidatePath("/documents");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}
