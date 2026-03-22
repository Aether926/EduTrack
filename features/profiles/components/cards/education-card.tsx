"use client";

import React from "react";
import { Book, Edit2, Save, X } from "lucide-react";
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

// ── Display value ──────────────────────────────────────────────────────────────

function DisplayValue({ value }: { value?: string | null }) {
    return (
        <div className="px-3 py-2 rounded-md bg-white/5 border border-white/8 text-sm font-medium text-foreground">
            {value || <span className="text-muted-foreground">—</span>}
        </div>
    );
}

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
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Book size={11} className="text-blue-400 shrink-0" />
                {label}
                {required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
            {isEditing ? (
                <Input
                    value={value}
                    onChange={(e) => onInputChange(field, e.target.value)}
                    placeholder={placeholder || ""}
                    required={Boolean(required)}
                    className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
            ) : (
                <DisplayValue value={value} />
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
            {/* ── Read-only Card ── */}
            <div className="border border-border/60 shadow-lg w-full overflow-hidden rounded-xl bg-card">
                <div className="relative px-6 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <Book className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-base font-semibold text-foreground">
                                Education Credential
                            </span>
                        </div>
                        {isOwnProfile && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEdit}
                                className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
                <div className="px-6 py-5 w-full">
                    <EducationForm
                        data={data}
                        isEditing={false}
                        onInputChange={onInputChange}
                    />
                </div>
            </div>

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
                        "flex flex-col gap-0 p-0 overflow-hidden border-border/60",
                        isMobile
                            ? "h-[92vh] rounded-t-2xl"
                            : "w-[500px] sm:w-[540px]",
                    ].join(" ")}
                >
                    <SheetHeader className="relative px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                        <div className="relative flex items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5">
                                <Book className="h-4 w-4 text-blue-400" />
                            </div>
                            <SheetTitle className="text-sm font-medium text-muted-foreground">
                                Edit Education Redential
                            </SheetTitle>
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
                            className="gap-2 flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            {isSaving ? (
                                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={15} />
                            )}
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="gap-2 flex-1 border-white/10 hover:bg-white/5"
                        >
                            <X size={15} />
                            Cancel
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
