"use client";

import React from "react";
import { BookOpen, Edit2, Save, X } from "lucide-react";
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
        <div className="px-3 py-2 rounded-md bg-white/5 border border-white/8 text-sm font-medium text-foreground min-h-[38px]">
            {value || <span className="text-muted-foreground">—</span>}
        </div>
    );
}

// ── Field ──────────────────────────────────────────────────────────────────────

function Field(props: {
    label: string;
    value: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    const {
        label,
        value,
        isEditing,
        onChange,
        placeholder,
        type = "text",
    } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {label}
            </label>
            {isEditing ? (
                <Input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
            ) : (
                <DisplayValue value={value} />
            )}
        </div>
    );
}

// ── Level config ───────────────────────────────────────────────────────────────

type LevelConfig = {
    label: string;
    schoolKey: keyof ProfileState;
    degreeKey: keyof ProfileState;
    fromKey: keyof ProfileState;
    toKey: keyof ProfileState;
    unitsKey: keyof ProfileState;
    graduatedKey: keyof ProfileState;
    honorsKey: keyof ProfileState;
};

const LEVELS: LevelConfig[] = [
    {
        label: "Elementary",
        schoolKey: "educationElementarySchool",
        degreeKey: "educationElementaryDegree",
        fromKey: "educationElementaryFrom",
        toKey: "educationElementaryTo",
        unitsKey: "educationElementaryUnits",
        graduatedKey: "educationElementaryGraduated",
        honorsKey: "educationElementaryHonors",
    },
    {
        label: "Secondary",
        schoolKey: "educationSecondarySchool",
        degreeKey: "educationSecondaryDegree",
        fromKey: "educationSecondaryFrom",
        toKey: "educationSecondaryTo",
        unitsKey: "educationSecondaryUnits",
        graduatedKey: "educationSecondaryGraduated",
        honorsKey: "educationSecondaryHonors",
    },
    {
        label: "Vocational / Trade Course",
        schoolKey: "educationVocationalSchool",
        degreeKey: "educationVocationalDegree",
        fromKey: "educationVocationalFrom",
        toKey: "educationVocationalTo",
        unitsKey: "educationVocationalUnits",
        graduatedKey: "educationVocationalGraduated",
        honorsKey: "educationVocationalHonors",
    },
    {
        label: "College",
        schoolKey: "educationCollegeSchool",
        degreeKey: "educationCollegeDegree",
        fromKey: "educationCollegeFrom",
        toKey: "educationCollegeTo",
        unitsKey: "educationCollegeUnits",
        graduatedKey: "educationCollegeGraduated",
        honorsKey: "educationCollegeHonors",
    },
    {
        label: "Graduate Studies",
        schoolKey: "educationGraduateSchool",
        degreeKey: "educationGraduateDegree",
        fromKey: "educationGraduateFrom",
        toKey: "educationGraduateTo",
        unitsKey: "educationGraduateUnits",
        graduatedKey: "educationGraduateGraduated",
        honorsKey: "educationGraduateHonors",
    },
];

function EducationLevelRow({
    config,
    data,
    isEditing,
    onInputChange,
}: {
    config: LevelConfig;
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    const g = (key: keyof ProfileState) => (data[key] as string) ?? "";
    const s = (key: keyof ProfileState) => (value: string) =>
        onInputChange(key, value);
    const hasData =
        g(config.schoolKey) ||
        g(config.degreeKey) ||
        g(config.fromKey) ||
        g(config.graduatedKey);

    return (
        <div className="rounded-lg border border-white/8 overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between bg-white/4 border-b border-white/8">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                    {config.label}
                </span>
                {!isEditing && !hasData && (
                    <span className="text-[10px] text-muted-foreground/60 italic">
                        Not filled
                    </span>
                )}
            </div>
            <div className="p-4 space-y-3">
                <Field
                    label="Name of School"
                    value={g(config.schoolKey)}
                    isEditing={isEditing}
                    onChange={s(config.schoolKey)}
                    placeholder="Write in full"
                />
                <Field
                    label="Basic Education / Degree / Course"
                    value={g(config.degreeKey)}
                    isEditing={isEditing}
                    onChange={s(config.degreeKey)}
                    placeholder="Write in full"
                />
                <div className="grid grid-cols-2 gap-3">
                    <Field
                        label="From (Year)"
                        value={g(config.fromKey)}
                        isEditing={isEditing}
                        onChange={s(config.fromKey)}
                        placeholder="e.g. 2000"
                        type="number"
                    />
                    <Field
                        label="To (Year)"
                        value={g(config.toKey)}
                        isEditing={isEditing}
                        onChange={s(config.toKey)}
                        placeholder="e.g. 2004"
                        type="number"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field
                        label="Highest Level / Units Earned"
                        value={g(config.unitsKey)}
                        isEditing={isEditing}
                        onChange={s(config.unitsKey)}
                        placeholder="If not graduated"
                    />
                    <Field
                        label="Year Graduated"
                        value={g(config.graduatedKey)}
                        isEditing={isEditing}
                        onChange={s(config.graduatedKey)}
                        placeholder="e.g. 2004"
                        type="number"
                    />
                </div>
                <Field
                    label="Scholarship / Academic Honors Received"
                    value={g(config.honorsKey)}
                    isEditing={isEditing}
                    onChange={s(config.honorsKey)}
                    placeholder="e.g. With Honors"
                />
            </div>
        </div>
    );
}

function EducationBackgroundForm({
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
            {LEVELS.map((config) => (
                <EducationLevelRow
                    key={config.label}
                    config={config}
                    data={data}
                    isEditing={isEditing}
                    onInputChange={onInputChange}
                />
            ))}
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function EducationBackgroundCard({
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
                                <BookOpen className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-base font-semibold text-foreground">
                                Education History
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
                    <EducationBackgroundForm
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
                                <BookOpen className="h-4 w-4 text-blue-400" />
                            </div>
                            <SheetTitle className="text-sm font-medium text-muted-foreground">
                                Edit Education Credential
                            </SheetTitle>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <EducationBackgroundForm
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
