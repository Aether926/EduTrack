/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Central activity log messages for EduTrack.
 *
 * Each action has two messages:
 * - `actor`    → shown in the audit log, admin-facing (what the admin did)
 * - `receiver` → shown as a notification to the affected teacher (personal tone)
 *
 * Messages that need dynamic values are functions.
 * Static messages are plain strings.
 */
import { format } from "date-fns";
// ── Types ─────────────────────────────────────────────────────────────────────

export type LogMessage = {
    actor: string;
    receiver: string;
};

// ── Action constants ──────────────────────────────────────────────────────────

export const LOG_ACTIONS = {
    // Account / Archival
    ACCOUNT_DEACTIVATION_INITIATED: "ACCOUNT_DEACTIVATION_INITIATED",
    ACCOUNT_DEACTIVATION_CANCELLED: "ACCOUNT_DEACTIVATION_CANCELLED",
    ACCOUNT_ARCHIVED: "ACCOUNT_ARCHIVED",
    ACCOUNT_RESTORED: "ACCOUNT_RESTORED",
    ACCOUNT_APPROVED: "ACCOUNT_APPROVED",
    ACCOUNT_REJECTED: "ACCOUNT_REJECTED",

    // Auth
    SIGN_UP: "SIGN_UP",
    SIGN_IN: "SIGN_IN",
    SIGN_OUT: "SIGN_OUT",

    // Profile
    PROFILE_UPDATED: "PROFILE_UPDATED",
    PROFILE_IMAGE_UPDATED: "PROFILE_IMAGE_UPDATED",

    // HR / Employment
    HR_UPDATED: "HR_UPDATED",
    CHANGE_REQUEST_SUBMITTED: "CHANGE_REQUEST_SUBMITTED",
    CHANGE_REQUEST_APPROVED: "CHANGE_REQUEST_APPROVED",
    CHANGE_REQUEST_REJECTED: "CHANGE_REQUEST_REJECTED",

    // Documents
    DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
    DOCUMENT_APPROVED: "DOCUMENT_APPROVED",
    DOCUMENT_REJECTED: "DOCUMENT_REJECTED",

    // Training
    ASSIGNED_TO_TRAINING: "ASSIGNED_TO_TRAINING",
    PROOF_SUBMITTED: "PROOF_SUBMITTED",
    PROOF_APPROVED: "PROOF_APPROVED",
    PROOF_REJECTED: "PROOF_REJECTED",

    // Documents
    DOC_SUBMITTED: "DOC_SUBMITTED",
    DOC_APPROVED: "DOC_APPROVED",
    DOC_REJECTED: "DOC_REJECTED",
    DOC_DELETED_BY_ADMIN: "DOC_DELETED_BY_ADMIN",
    DOC_RESUBMIT_REQUESTED: "DOC_RESUBMIT_REQUESTED",
    DOC_RESUBMIT_REQUESTED_BY_ADMIN: "DOC_RESUBMIT_REQUESTED_BY_ADMIN",
    DOC_RESUBMIT_APPROVED: "DOC_RESUBMIT_APPROVED",
    DOC_RESUBMIT_REJECTED: "DOC_RESUBMIT_REJECTED",
    DOC_DELETE_REQUESTED: "DOC_DELETE_REQUESTED",
    DOC_DELETE_APPROVED: "DOC_DELETE_APPROVED",
    DOC_DELETE_REJECTED: "DOC_DELETE_REJECTED",
    DOCUMENT_PINGED: "DOCUMENT_PINGED",

    // Settings
    PASSWORD_CHANGED: "PASSWORD_CHANGED",
    ACCOUNT_DELETION_REQUESTED: "ACCOUNT_DELETION_REQUESTED",
    ACCOUNT_DELETION_CANCELLED: "ACCOUNT_DELETION_CANCELLED",

    SALARY_INCREASE_ELIGIBLE: "SALARY_INCREASE_ELIGIBLE",
    SALARY_INCREASE_MARKED: "SALARY_INCREASE_MARKED",
} as const;

export type LogAction = (typeof LOG_ACTIONS)[keyof typeof LOG_ACTIONS];

// ── Messages ──────────────────────────────────────────────────────────────────

export const LOG_MESSAGES = {
    // ── Account / Archival ────────────────────────────────────────────────────

    ACCOUNT_DEACTIVATION_INITIATED: (
        teacherName: string,
        reason: string,
        scheduledAt: string,
    ): LogMessage => ({
        actor: `Initiated account deactivation for ${teacherName}. Reason: "${reason}". Scheduled for: ${scheduledAt}.`,
        receiver: `Your account has been scheduled for deactivation. Reason: "${reason}". It will be archived on ${scheduledAt} unless cancelled.`,
    }),

    ACCOUNT_DEACTIVATION_CANCELLED: (
        teacherName: string,
        adminName: string,
    ): LogMessage => ({
        actor: `Cancelled the pending deactivation request for ${teacherName}.`,
        receiver: `Your scheduled account deactivation has been cancelled by ${adminName}. Your account remains active.`,
    }),

    ACCOUNT_ARCHIVED: (
        teacherName: string,
        adminName: string,
        reason: string,
    ): LogMessage => ({
        actor: `Archived account of ${teacherName}. Reason: "${reason}".`,
        receiver: `Your account has been archived by ${adminName}. Reason: "${reason}". Contact your administrator for more information.`,
    }),

    ACCOUNT_RESTORED: (teacherName: string): LogMessage => ({
        actor: `Restored archived account of ${teacherName}.`,
        receiver: "Your account has been restored and is now active again.",
    }),

    ACCOUNT_APPROVED: (teacherName: string): LogMessage => ({
        actor: `Approved registration request for ${teacherName}.`,
        receiver:
            "Your account registration has been approved. You can now log in.",
    }),

    ACCOUNT_REJECTED: (teacherName: string, reason: string): LogMessage => ({
        actor: `Rejected registration request for ${teacherName}. Reason: "${reason}".`,
        receiver: `Your account registration was rejected. Reason: "${reason}". Contact your administrator for more information.`,
    }),

    // ── Auth ──────────────────────────────────────────────────────────────────

    SIGN_UP: (): LogMessage => ({
        actor: "Created a new account and submitted for admin approval.",
        receiver:
            "Your account has been created and is pending admin approval.",
    }),

    SIGN_IN: (): LogMessage => ({
        actor: "Signed in.",
        receiver: "You signed in to your account.",
    }),

    SIGN_OUT: (): LogMessage => ({
        actor: "Signed out.",
        receiver: "You signed out of your account.",
    }),

    // ── Profile ───────────────────────────────────────────────────────────────

    PROFILE_UPDATED: (
        updatedBy: "self" | "admin",
        adminName?: string,
    ): LogMessage => ({
        actor:
            updatedBy === "admin"
                ? `Profile information was updated by admin ${adminName ?? ""}.`
                : "Updated their own profile information.",
        receiver:
            updatedBy === "admin"
                ? `Your profile was updated by ${adminName ?? "an administrator"}.`
                : "You updated your profile information.",
    }),

    PROFILE_IMAGE_UPDATED: (
        updatedBy: "self" | "admin",
        adminName?: string,
    ): LogMessage => ({
        actor:
            updatedBy === "admin"
                ? `Profile photo was updated by admin ${adminName ?? ""}.`
                : "Updated their own profile photo.",
        receiver:
            updatedBy === "admin"
                ? `Your profile photo was updated by ${adminName ?? "an administrator"}.`
                : "You updated your profile photo.",
    }),

    // ── HR / Employment ───────────────────────────────────────────────────────

    HR_UPDATED: (teacherName: string, adminName: string): LogMessage => ({
        actor: `Updated employment information for ${teacherName}.`,
        receiver: `Your employment information was updated by ${adminName}.`,
    }),

    CHANGE_REQUEST_SUBMITTED: (field: string): LogMessage => ({
        actor: `Submitted a change request for: ${field}.`,
        receiver: `Your change request for "${field}" has been submitted and is pending admin review.`,
    }),

    CHANGE_REQUEST_APPROVED: (
        field: string,
        adminName: string,
    ): LogMessage => ({
        actor: `Approved change request for "${field}".`,
        receiver: `Your change request for "${field}" was approved by ${adminName}.`,
    }),

    CHANGE_REQUEST_REJECTED: (
        field: string,
        adminName: string,
        reason?: string,
    ): LogMessage => ({
        actor: `Rejected change request for "${field}".${reason ? ` Reason: "${reason}".` : ""}`,
        receiver: `Your change request for "${field}" was rejected by ${adminName}.${reason ? ` Reason: "${reason}".` : ""}`,
    }),

    // ── Documents ─────────────────────────────────────────────────────────────

    DOCUMENT_UPLOADED: (docType: string): LogMessage => ({
        actor: `Uploaded document: ${docType}.`,
        receiver: `You uploaded "${docType}". It is now pending admin review.`,
    }),

    DOCUMENT_APPROVED: (docType: string, adminName: string): LogMessage => ({
        actor: `Approved document: ${docType}.`,
        receiver: `Your document "${docType}" was approved by ${adminName}.`,
    }),

    DOCUMENT_REJECTED: (
        docType: string,
        adminName: string,
        reason?: string,
    ): LogMessage => ({
        actor: `Rejected document: ${docType}.${reason ? ` Reason: "${reason}".` : ""}`,
        receiver: `Your document "${docType}" was rejected by ${adminName}.${reason ? ` Reason: "${reason}".` : ""}`,
    }),

    // ── Training ──────────────────────────────────────────────────────────────

    TRAINING_ENROLLED: (
        title: string,
        enrolledBy: "self" | "admin",
        adminName?: string,
    ): LogMessage => ({
        actor:
            enrolledBy === "admin"
                ? `Enrolled teacher in training: "${title}".`
                : `Self-enrolled in training: "${title}".`,
        receiver:
            enrolledBy === "admin"
                ? `You were enrolled in "${title}" by ${adminName ?? "an administrator"}.`
                : `You enrolled in "${title}".`,
    }),

    TRAINING_PROOF_SUBMITTED: (title: string): LogMessage => ({
        actor: `Submitted attendance proof for: "${title}".`,
        receiver: `Your attendance proof for "${title}" has been submitted and is pending review.`,
    }),

    TRAINING_PROOF_APPROVED: (
        title: string,
        adminName: string,
    ): LogMessage => ({
        actor: `Approved attendance proof for: "${title}".`,
        receiver: `Your attendance proof for "${title}" was approved by ${adminName}.`,
    }),

    TRAINING_PROOF_REJECTED: (
        title: string,
        adminName: string,
        reason?: string,
    ): LogMessage => ({
        actor: `Rejected attendance proof for: "${title}".${reason ? ` Reason: "${reason}".` : ""}`,
        receiver: `Your attendance proof for "${title}" was rejected by ${adminName}.${reason ? ` Reason: "${reason}".` : ""}`,
    }),
    // ── Training ──────────────────────────────────────────────────────────────────

    ASSIGNED_TO_TRAINING: (title: string): LogMessage => ({
        actor: `Enrolled a teacher in "${title}".`,
        receiver: `You were assigned to "${title}".`,
    }),

    PROOF_SUBMITTED: (title: string): LogMessage => ({
        actor: `Submitted attendance proof for "${title}".`,
        receiver: `You submitted proof for "${title}". It is pending review.`,
    }),

    PROOF_APPROVED: (title: string, adminName: string): LogMessage => ({
        actor: `Approved attendance proof for "${title}".`,
        receiver: `Your proof for "${title}" was approved by ${adminName}.`,
    }),

    PROOF_REJECTED: (
        title: string,
        adminName: string,
        reason?: string,
    ): LogMessage => ({
        actor: `Rejected attendance proof for "${title}".${reason ? ` Reason: "${reason}".` : ""}`,
        receiver: `Your proof for "${title}" was rejected by ${adminName}.${reason ? ` Reason: "${reason}".` : ""}`,
    }),

    // ── Documents ─────────────────────────────────────────────────────────────────

    DOC_SUBMITTED: (docType: string): LogMessage => ({
        actor: `Submitted document: ${docType}.`,
        receiver: `You submitted "${docType}". It is pending admin review.`,
    }),

    DOC_APPROVED: (docType: string, adminName: string): LogMessage => ({
        actor: `Approved document: ${docType}.`,
        receiver: `Your "${docType}" was approved by ${adminName}.`,
    }),

    DOC_REJECTED: (
        docType: string,
        adminName: string,
        reason?: string,
    ): LogMessage => ({
        actor: `Rejected document: ${docType}.${reason ? ` Reason: "${reason}".` : ""}`,
        receiver: `Your "${docType}" was rejected by ${adminName}.${reason ? ` Reason: "${reason}".` : ""}`,
    }),

    DOC_DELETED_BY_ADMIN: (docType: string, adminName: string): LogMessage => ({
        actor: `Deleted document: ${docType}.`,
        receiver: `Your "${docType}" was deleted by ${adminName}.`,
    }),

    DOC_RESUBMIT_REQUESTED: (docType: string): LogMessage => ({
        actor: `Requested resubmission of: ${docType}.`,
        receiver: `You requested to resubmit "${docType}". Pending admin review.`,
    }),

    DOC_RESUBMIT_REQUESTED_BY_ADMIN: (
        docType: string,
        adminName: string,
        note?: string,
    ): LogMessage => ({
        actor: `Requested resubmission of ${docType} from teacher.${note ? ` Note: "${note}".` : ""}`,
        receiver: `${adminName} has requested you to resubmit "${docType}".${note ? ` Note: "${note}".` : ""}`,
    }),

    DOC_RESUBMIT_APPROVED: (
        docType: string,
        adminName: string,
    ): LogMessage => ({
        actor: `Approved resubmit request for: ${docType}.`,
        receiver: `Your request to resubmit "${docType}" was approved by ${adminName}. Please upload a new document.`,
    }),

    DOC_RESUBMIT_REJECTED: (
        docType: string,
        adminName: string,
        reason?: string,
    ): LogMessage => ({
        actor: `Rejected resubmit request for: ${docType}.${reason ? ` Reason: "${reason}".` : ""}`,
        receiver: `Your request to resubmit "${docType}" was rejected by ${adminName}.${reason ? ` Reason: "${reason}".` : ""}`,
    }),

    DOC_DELETE_REQUESTED: (docType: string): LogMessage => ({
        actor: `Requested deletion of: ${docType}.`,
        receiver: `You requested to delete "${docType}". Pending admin review.`,
    }),

    DOC_DELETE_APPROVED: (docType: string, adminName: string): LogMessage => ({
        actor: `Approved delete request for: ${docType}.`,
        receiver: `Your request to delete "${docType}" was approved by ${adminName}.`,
    }),

    DOC_DELETE_REJECTED: (
        docType: string,
        adminName: string,
        reason?: string,
    ): LogMessage => ({
        actor: `Rejected delete request for: ${docType}.${reason ? ` Reason: "${reason}".` : ""}`,
        receiver: `Your request to delete "${docType}" was rejected by ${adminName}.${reason ? ` Reason: "${reason}".` : ""}`,
    }),

    // ── Settings ──────────────────────────────────────────────────────────────────

    PASSWORD_CHANGED: (): LogMessage => ({
        actor: "Changed account password.",
        receiver: "You changed your password.",
    }),

    ACCOUNT_DELETION_REQUESTED: (reason: string): LogMessage => ({
        actor: `Requested account deletion. Reason: "${reason}".`,
        receiver: `You requested account deletion. Reason: "${reason}".`,
    }),

    ACCOUNT_DELETION_CANCELLED: (): LogMessage => ({
        actor: "Cancelled account deletion request.",
        receiver: "You cancelled your account deletion request.",
    }),

    // ── Ping document ──────────────────────────────────────────────────────────────────

    DOCUMENT_PINGED: (
        documentTypeName: string,
        adminName: string,
        teacherName: string,
    ): LogMessage => ({
        actor: `You reminded ${teacherName} to submit or update their "${documentTypeName}".`,
        receiver: `You have been requested to submit or update your "${documentTypeName}".`,
    }),

    // ── Salary / loyalty notice ──────────────────────────────────────────────────────────────────

    SALARY_INCREASE_ELIGIBLE: (
        teacherName: string,
        cycleStartDate: string,
    ): LogMessage => ({
        actor: `${teacherName} is eligible for a salary increase as of ${cycleStartDate}.`,
        receiver: `You are eligible for a salary increase as of ${cycleStartDate}.`,
    }),

    SALARY_INCREASE_MARKED: (
        teacherName: string,
        adminName: string,
        markDate: string,
    ): LogMessage => ({
        actor: `You marked salary increase as given for ${teacherName} (cycle: ${markDate}).`,
        receiver: `Your salary increase has been processed by ${adminName} (cycle: ${markDate}).`,
    }),
} as const;
