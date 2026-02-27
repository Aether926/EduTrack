"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Edit2, Save, User, X } from "lucide-react";

import ProfileShareMenu from "@/features/profiles/components/profile-share-menu";
import ProfileQrModal from "@/features/profiles/components/profile-qr-modal";
import ProfileCompletionModal from "@/features/profiles/components/modals/profile-completion-modal";
import { useProfileQr } from "@/features/profiles/hooks/user-profile-qr";
import { useServiceRecord } from "@/features/profiles/hooks/use-service-record";
import {
    calculateProfileCompletion,
    getCompletionColor,
    getCompletionTextColor,
} from "@/features/profiles/lib/profile-completion";
import type { ProfileState } from "@/features/profiles/types/profile";

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
    tempProfileData: TempProfileData;
    profileData?: ProfileState;
    onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave?: () => void;
    onCancel?: () => void;
    onEdit?: () => void;
    showActions?: boolean;
    onInputChange?: (field: string, value: string) => void;
}

export default function ProfileHeader({
    teacherId,
    preview,
    isEditing,
    tempProfileData,
    profileData,
    onImageChange,
    onSave,
    onCancel,
    onEdit,
    showActions = true,
    onInputChange,
}: ProfileHeaderProps) {
    const { generating, generate } = useServiceRecord(teacherId);
    const { theme } = useTheme();
    const bgImage =
        theme === "light" ? "border-gray-100" : "border-neutral-900";
    const [completionOpen, setCompletionOpen] = useState(false);

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
        <Card className="border-0 rounded-none shadow-lg p-0">
            <img src="/banner.png" alt="banner" className="w-full h-65" />

            <CardContent className="px-4 md:px-10 py-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-center md:items-start -mt-16">
                    <div className="flex flex-col md:flex-row w-full gap-2 md:gap-4 lg:gap-8 relative min-w-0">
                        {/* ── Profile Image ── */}
                        <div className="flex justify-center shrink-0">
                            <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40">
                                <div
                                    className={`w-full h-full ${bgImage} rounded-full border-4 overflow-hidden bg-gray-200 dark:bg-gray-800`}
                                >
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
                                {isEditing ? (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={onImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                                        />
                                        <button
                                            type="button"
                                            className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg shadow-lg transition"
                                        >
                                            <Camera
                                                size={16}
                                                className="text-white"
                                            />
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {/* ── Name + Completion Badge ── */}
                        <div className="flex flex-col text-center md:text-left justify-start md:mt-10 overflow-hidden min-w-0 flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white break-words">
                                {fullName}
                            </h2>
                            <p className="text-blue-600 font-semibold text-sm md:text-base break-words mt-1">
                                {tempProfileData.position}
                            </p>
                            {isEditing ? (
                                <div className="mt-1 flex justify-center md:justify-start">
                                    <input
                                        type="text"
                                        defaultValue={tempProfileData.username}
                                        onChange={(e) =>
                                            onInputChange?.(
                                                "username",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter username"
                                        className="text-xs md:text-sm text-gray-300 bg-transparent border-b border-gray-500 focus:border-blue-400 outline-none w-48 text-center md:text-left pb-0.5 placeholder:text-gray-500"
                                    />
                                </div>
                            ) : (
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                    Username: {tempProfileData.username}
                                </p>
                            )}

                            {/* ── Completion Badge — hidden while editing ── */}
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
                                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
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
                    {showActions ? (
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
                                    <Button onClick={onEdit} className="gap-2">
                                        <Edit2 size={18} />
                                        Edit Profile
                                    </Button>
                                    <ProfileShareMenu
                                        onOpenQr={() => qr.setQrOpen(true)}
                                        onCopyLink={() => void qr.copyQrLink()}
                                        onDownloadPdf={generate}
                                        pdfGenerating={generating}
                                    />
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </CardContent>

            {/* ── QR Modal ── */}
            <ProfileQrModal
                open={qr.qrOpen}
                onOpenChange={qr.setQrOpen}
                fullName={fullName}
                qrToken={qr.qrToken}
                qrUrl={qr.qrUrl}
                loading={qr.qrLoading}
                isCooldown={qr.isCooldown}
                cooldownLeftMs={qr.cooldownLeftMs}
                onGenerate={() => void qr.generateQr()}
                onCopy={() => void qr.copyQrLink()}
                onDownload={() => void qr.downloadQrPng(fullName)}
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
        </Card>
    );
}
