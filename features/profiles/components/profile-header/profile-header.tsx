"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, User, X, FileText } from "lucide-react";
import { updateUsername } from "@/features/profiles/actions/username-action";
import { toast } from "sonner";

import TeacherRecordsSheet from "@/components/teacher-records-sheet";
import ProfileShareMenu from "@/features/profiles/components/profile-share-menu";
import ProfileQrModal from "@/features/profiles/components/profile-qr-modal";
import ProfileCompletionModal from "@/features/profiles/components/modals/profile-completion-modal";
import { useProfileQr } from "@/features/profiles/hooks/user-profile-qr";
import { useServiceRecord } from "@/features/profiles/hooks/use-service-record";
import ProfileImageActions from "@/features/profiles/components/profile-image-actions";
import ImageCropModal from "@/features/profiles/components/modals/image-crop-modal";
import {
    calculateProfileCompletion,
    getCompletionColor,
    getCompletionTextColor,
} from "@/features/profiles/lib/profile-completion";
import type { ProfileState } from "@/features/profiles/types/profile";
import BannerImage from "@/features/profiles/components/profile-header/banner-image";
import { PrivacySettings } from "../../actions/privacy-actions";

type TempProfileData = {
    firstName: string;
    middleInitial: string;
    lastName: string;
    position: string;
    username: string;
};

interface ProfileHeaderProps {
    teacherId: string;
    preview: string | null;
    isEditing: boolean;
    savedFirstName?: string;
    tempProfileData: TempProfileData;
    profileData?: ProfileState;
    onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave?: () => void;
    onCancel?: () => void;
    onEdit?: () => void;
    showActions?: boolean;
    showShareMenu?: boolean;
    showRecordsButton?: boolean;
    isArchived?: boolean;
    onInputChange?: (field: string, value: string) => void;
    isOwnProfile?: boolean;
    uploading?: boolean;
    cropSrc?: string | null;
    cropOpen?: boolean;
    onCropOpenChange?: (open: boolean) => void;
    onCropComplete?: (blob: Blob) => Promise<void>;
    onDeleteImage?: () => Promise<void>;
    fileInputRef?: React.RefObject<HTMLInputElement | null>;
    privacySettings?: PrivacySettings | null;
}

export default function ProfileHeader({
    teacherId,
    preview,
    isEditing,
    savedFirstName,
    tempProfileData,
    profileData,
    onImageChange,
    onSave,
    onCancel,
    onEdit,
    showActions = true,
    showShareMenu = false,
    showRecordsButton = false,
    isArchived = false,
    onInputChange,
    isOwnProfile,
    uploading,
    cropSrc,
    cropOpen,
    onCropOpenChange,
    onCropComplete,
    onDeleteImage,
    fileInputRef,
    privacySettings = null,
}: ProfileHeaderProps) {
    const { generating, generate } = useServiceRecord(teacherId);
    const { theme } = useTheme();

    const [usernameValue, setUsernameValue] = useState(
        tempProfileData.username ?? "",
    );
    const [savingUsername, setSavingUsername] = useState(false);
    const [completionOpen, setCompletionOpen] = useState(false);
    const [recordsOpen, setRecordsOpen] = useState(false);

    async function handleUsernameSave() {
        if (!usernameValue.trim()) return;
        if (usernameValue === tempProfileData.username) return;
        setSavingUsername(true);
        try {
            const result = await updateUsername(usernameValue.trim());
            if (!result.ok) {
                toast.error(result.error);
            } else {
                toast.success("Username updated.");
                onInputChange?.("username", usernameValue.trim());
            }
        } finally {
            setSavingUsername(false);
        }
    }

    const fullName = (() => {
        const middle = tempProfileData.middleInitial
            ? `${tempProfileData.middleInitial} `
            : "";
        return `${tempProfileData.firstName} ${middle}${tempProfileData.lastName}`.trim();
    })();

    const qr = useProfileQr({ expiryDays: 30, cooldownMs: 60_000 });

    const completion = profileData
        ? calculateProfileCompletion(profileData)
        : null;
    const barColor = completion
        ? getCompletionColor(completion.percentage)
        : "";
    const textColor = completion
        ? getCompletionTextColor(completion.percentage)
        : "";

    return (
        <Card className="border-0 rounded-none shadow-lg p-0 overflow-hidden">
            <BannerImage
                firstName={savedFirstName || tempProfileData.firstName}
            />

            <CardContent className="px-4 md:px-10 py-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-center md:items-start -mt-[90px] md:-mt-16">
                    <div className="flex flex-col md:flex-row w-full gap-2 md:gap-4 lg:gap-8 relative min-w-0">
                        {/* ── Profile Image ── */}
                        <div className="flex justify-center shrink-0">
                            <div className="relative w-40 h-40 md:w-36 md:h-36 lg:w-40 lg:h-40">
                                <div className="w-full h-full border-gray-100 dark:border-neutral-900 rounded-full border-4 overflow-hidden bg-gray-200 dark:bg-gray-800">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User
                                                size={48}
                                                className="text-gray-400"
                                            />
                                        </div>
                                    )}
                                </div>

                                {isOwnProfile && fileInputRef && (
                                    <ProfileImageActions
                                        hasImage={!!preview}
                                        uploading={uploading ?? false}
                                        onFileSelect={onImageChange!}
                                        onDelete={
                                            onDeleteImage ?? (async () => {})
                                        }
                                        fileInputRef={fileInputRef}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ── Name + Username + Completion Badge ── */}
                        <div className="flex flex-col text-center md:text-left justify-start md:mt-10 overflow-hidden min-w-0 flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white break-words">
                                {fullName}
                            </h2>
                            <p className="text-blue-600 font-semibold text-sm md:text-base break-words mt-1">
                                {tempProfileData.position}
                            </p>

                            {/* Username */}
                            {isOwnProfile ? (
                                <div className="mt-1 flex items-center gap-2 justify-center md:justify-start">
                                    <input
                                        type="text"
                                        value={usernameValue}
                                        onChange={(e) =>
                                            setUsernameValue(e.target.value)
                                        }
                                        placeholder="Enter username"
                                        className="text-xs md:text-sm text-gray-300 bg-transparent border-b border-gray-500 focus:border-blue-400 outline-none w-40 text-center md:text-left pb-0.5 placeholder:text-gray-500"
                                    />
                                    {usernameValue !==
                                        tempProfileData.username && (
                                        <button
                                            type="button"
                                            onClick={handleUsernameSave}
                                            disabled={savingUsername}
                                            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50"
                                        >
                                            {savingUsername
                                                ? "Saving..."
                                                : "Save"}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                    @{tempProfileData.username}
                                </p>
                            )}

                            {/* ── Completion Badge ── */}
                            {completion && !isEditing && (
                                <div className="mt-3 flex flex-col items-center md:items-start gap-1.5">
                                    <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                                        <span
                                            className={`text-xs font-bold ${textColor}`}
                                        >
                                            Profile {completion.percentage}%
                                            complete
                                        </span>
                                        {completion.percentage < 100 && (
                                            <span className="text-xs text-gray-400">
                                                (
                                                {completion.totalCount -
                                                    completion.completedCount}{" "}
                                                sections missing)
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCompletionOpen(true)
                                            }
                                            className="text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                    <div className="w-full max-w-[12rem] bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
                                            style={{
                                                width: `${completion.percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Action Buttons ── */}
                    {showActions && (
                        <div className="flex gap-2 flex-wrap md:flex-nowrap justify-center md:justify-end flex-shrink-0 md:mt-16">
                            {isEditing ? (
                                <>
                                    <Button
                                        onClick={onSave}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <Save size={18} />
                                        Save
                                    </Button>
                                    <Button
                                        onClick={onCancel}
                                        variant="secondary"
                                        className="gap-2"
                                    >
                                        <X size={18} />
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {showRecordsButton && (
                                        <Button
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => setRecordsOpen(true)}
                                        >
                                            <FileText size={16} />
                                            View Records
                                        </Button>
                                    )}
                                    {showShareMenu && (
                                        <ProfileShareMenu
                                            onOpenQr={() => qr.setQrOpen(true)}
                                            onCopyLink={() =>
                                                void qr.copyQrLink()
                                            }
                                            onDownloadPdf={generate}
                                            pdfGenerating={generating}
                                            privacySettings={privacySettings}
                                            hasQr={!!qr.qrToken}
                                            qrUrl={qr.qrUrl}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            {/* ── Records Sheet ── */}
            {showRecordsButton && (
                <TeacherRecordsSheet
                    key={teacherId}
                    open={recordsOpen}
                    onOpenChange={setRecordsOpen}
                    teacherId={teacherId}
                    isArchived={isArchived}
                />
            )}

            {/* ── QR Modal ── */}
            <ProfileQrModal
                open={qr.qrOpen}
                onOpenChange={qr.setQrOpen}
                fullName={fullName}
                qrToken={qr.qrToken}
                qrUrl={qr.qrUrl}
                loading={qr.qrLoading}
                cooldownUntil={qr.cooldownUntil}
                onGenerate={() => void qr.generateQr()}
                onDownload={() => void qr.downloadQrPng(fullName)}
                onCopyLink={() => void qr.copyQrLink()}
                qrCanvasWrapperRef={qr.qrCanvasWrapperRef}
            />

            {/* ── Completion Modal ── */}
            {profileData && (
                <ProfileCompletionModal
                    data={profileData}
                    open={completionOpen}
                    onOpenChange={setCompletionOpen}
                />
            )}

            {/* ── Crop Modal ── */}
            {cropSrc && (
                <ImageCropModal
                    open={cropOpen ?? false}
                    onOpenChange={onCropOpenChange ?? (() => {})}
                    imageSrc={cropSrc}
                    onCropComplete={onCropComplete ?? (async () => {})}
                />
            )}
        </Card>
    );
}
