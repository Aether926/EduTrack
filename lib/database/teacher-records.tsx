"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

async function requireAdminOrSuperadmin() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false as const, user: null };
    const role = auth.user.user_metadata?.role ?? "";
    if (!["ADMIN", "SUPERADMIN"].includes(role)) return { ok: false as const, user: null };
    return { ok: true as const, user: auth.user };
}

export async function fetchTeacherRecords(teacherId: string) {
    const check = await requireAdminOrSuperadmin();
    if (!check.ok) return null;

    const admin = createAdminClient();

    const [
        { data: documents },
        { data: responsibilities },
        { data: appointments },
        { data: compliance },
    ] = await Promise.all([
        admin
            .from("TeacherDocument")
            .select("id, status, submitted_at, expires_at, file_path, mime_type, document_type_id, DocumentType:document_type_id(name)")
            .eq("teacher_id", teacherId)
            .order("submitted_at", { ascending: false }),
        admin
            .from("TeacherResponsibility")
            .select("id, title, school_year")
            .eq("teacher_id", teacherId),
        admin
            .from("AppointmentHistory")
            .select("id, position, effective_date, appointment_type")
            .eq("user_id", teacherId)
            .order("effective_date", { ascending: false }),
        admin
            .from("TeacherTrainingCompliance")
            .select("id, policy_name, status, approved_hours, required_hours")
            .eq("teacher_id", teacherId),
    ]);

    // Generate signed URLs for each document
    const docsWithUrls = await Promise.all(
        (documents ?? []).map(async (d) => {
            let fileUrl: string | null = null;
            if (d.file_path) {
                const { data: signed } = await admin.storage
                    .from("teacher-documents")
                    .createSignedUrl(d.file_path, 60 * 60);
                fileUrl = signed?.signedUrl ?? null;
            }
            return {
                id:             d.id,
                documentTypeId: d.document_type_id ?? "",
                documentType:   (d.DocumentType as { name?: string } | null)?.name ?? "—",
                status:         d.status       ?? "—",
                submittedAt:    d.submitted_at ?? "",
                expiresAt:      d.expires_at   ?? null,
                fileUrl,
                mimeType:       d.mime_type    ?? "image/jpeg",
            };
        })
    );

    return {
        documents: docsWithUrls, // ← use docsWithUrls not documents
        responsibilities: (responsibilities ?? []).map((r) => ({
            id:         r.id,
            title:      r.title       ?? "—",
            schoolYear: r.school_year ?? "—",
        })),
        appointments: (appointments ?? []).map((a) => ({
            id:              a.id,
            position:        a.position         ?? "—",
            effectiveDate:   a.effective_date   ?? "",
            appointmentType: a.appointment_type ?? "—",
        })),
        compliance: (compliance ?? []).map((c) => ({
            id:            c.id,
            policyName:    c.policy_name    ?? "—",
            status:        c.status         ?? "—",
            approvedHours: c.approved_hours ?? 0,
            requiredHours: c.required_hours ?? 0,
        })),
    };
}

export async function pingTeacherDocument(
    teacherId:        string,
    documentTypeName: string,
): Promise<void> {
    const check = await requireAdminOrSuperadmin();
    if (!check.ok) return;

    const admin = createAdminClient();

    await admin.from("ActivityLog").insert({
        actor_id:       check.user!.id,
        target_user_id: teacherId,
        action:         "DOCUMENT_PING",
        entity_type:    "TeacherDocument",
        entity_id:      teacherId,
        message:        `You have been requested to submit or update your ${documentTypeName}.`,
        meta:           { documentType: documentTypeName },
    });
}