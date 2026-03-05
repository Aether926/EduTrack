"use client";

import React from "react";
import { Book, Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfileState } from "@/features/profiles/types/profile";

// ── Field ──────────────────────────────────────────────────────────────────────

function Field(props: {
    label: string;
    value: string;
    field: keyof ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    required?: boolean;
    placeholder?: string;
}) {
    const {
        label,
        value,
        field,
        isEditing,
        onInputChange,
        required,
        placeholder,
    } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <Book size={14} className="text-blue-600" />
                {label}
                {required ? <span className="text-red-500">*</span> : null}
            </label>
            {isEditing ? (
                <Input
                    value={value}
                    onChange={(e) => onInputChange(field, e.target.value)}
                    placeholder={placeholder || ""}
                    required={Boolean(required)}
                />
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value || "—"}
                </div>
            )}
        </div>
    );
}

// ── Shared form body ───────────────────────────────────────────────────────────

function EducationForm({
    data,
    isEditing,
    onInputChange,
}: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    return (
        <div className="space-y-4">
            <Field
                label="Subject Specialization"
                value={data.subjectSpecialization}
                field="subjectSpecialization"
                isEditing={isEditing}
                onInputChange={onInputChange}
            />
            <Field
                label="Bachelor's Degree"
                value={data.bachelorsDegree}
                field="bachelorsDegree"
                isEditing={isEditing}
                onInputChange={onInputChange}
            />
            <Field
                label="Post Graduate"
                value={data.postGraduate}
                field="postGraduate"
                isEditing={isEditing}
                onInputChange={onInputChange}
                placeholder="(optional)"
            />
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function EducationCard({
    data,
    isEditing,
    onInputChange,
    onEdit,
    onSave,
    onCancel,
    isOwnProfile = false,
    isSaving = false,
}: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onEdit?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    isOwnProfile?: boolean;
    isSaving?: boolean;
}) {
    const isMobile = useIsMobile();

    return (
        <>
            {/* ── Card — always read-only ── */}
            <Card className="flex-col border-0 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Book className="text-blue-600" size={20} />
                            <CardTitle>Educational Background</CardTitle>
                        </div>
                        {isOwnProfile && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEdit}
                                className="gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="text-xs">Edit</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <EducationForm
                        data={data}
                        isEditing={false}
                        onInputChange={onInputChange}
                    />
                </CardContent>
            </Card>

            {/* ── Edit Sheet ── */}
            <Sheet
                open={isEditing}
                onOpenChange={(open) => {
                    if (!open) onCancel?.();
                }}
            >
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={[
                        "flex flex-col gap-0 p-0 overflow-hidden",
                        isMobile
                            ? "h-[92vh] rounded-t-2xl"
                            : "w-[500px] sm:w-[540px]",
                    ].join(" ")}
                >
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <Book className="text-blue-600" size={18} />
                            <SheetTitle>Edit Educational Background</SheetTitle>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <EducationForm
                            data={data}
                            isEditing={true}
                            onInputChange={onInputChange}
                        />
                    </div>

                    <SheetFooter className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-row gap-2 shrink-0">
                        <Button
                            onClick={onSave}
                            disabled={isSaving}
                            className="gap-2 flex-1"
                        >
                            {isSaving ? (
                                <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Save
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="gap-2 flex-1"
                        >
                            <X size={16} />
                            Cancel
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
