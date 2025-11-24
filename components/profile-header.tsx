import React from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Edit2, Save, X, User } from "lucide-react";

interface ProfileHeaderProps {
    preview: string | null;
    isEditing: boolean;
    tempProfileData: {
        name: string;
        position: string;
        employeeId: string;
    };
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onCancel: () => void;
    onEdit: () => void;
}

export default function ProfileHeader({
    preview,
    isEditing,
    tempProfileData,
    onImageChange,
    onSave,
    onCancel,
    onEdit,
}: ProfileHeaderProps) {
    const { theme } = useTheme();

    const bgImage =
        theme === "light" ? "border-gray-100" : "border-neutral-900";

    return (
        <Card className="border-0 rounded-none shadow-lg p-0">
            {/* Profile Banner */}
            <img src="/banner.png" alt="banner" className="w-full h-65" />

            <CardContent className="px-10 py-6">
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center -mt-16">
                    <div className="flex flex-col md:flex-row w-full gap-2 md:gap-8 relative">
                        <div className="flex justify-center">
                            <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40">
                                {/* Profile Picture */}
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

                                {isEditing && (
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
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex flex-col text-center md:text-left justify-center overflow-hidden">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {tempProfileData.name}
                            </h2>
                            <p className="text-blue-600 font-semibold">
                                {tempProfileData.position}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Employee ID: {tempProfileData.employeeId}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap md:flex-nowrap">
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
                            <Button onClick={onEdit} className="gap-2">
                                <Edit2 size={18} />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
