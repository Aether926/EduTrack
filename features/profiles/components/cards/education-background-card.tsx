"use client";

import React from "react";
import { BookOpen, Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfileState } from "@/features/profiles/types/profile";

// ── Field ──────────────────────────────────────────────────────────────────────

function Field(props: {
    label: string; value: string; isEditing: boolean;
    onChange: (value: string) => void; placeholder?: string; type?: string;
}) {
    const { label, value, isEditing, onChange, placeholder, type = "text" } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{label}</label>
            {isEditing ? (
                <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium min-h-[38px]">{value || "—"}</div>
            )}
        </div>
    );
}

// ── Level config ───────────────────────────────────────────────────────────────

type LevelConfig = {
    label: string;
    schoolKey: keyof ProfileState; degreeKey: keyof ProfileState;
    fromKey: keyof ProfileState; toKey: keyof ProfileState;
    unitsKey: keyof ProfileState; graduatedKey: keyof ProfileState;
    honorsKey: keyof ProfileState;
};

const LEVELS: LevelConfig[] = [
    { label: "Elementary", schoolKey: "educationElementarySchool", degreeKey: "educationElementaryDegree", fromKey: "educationElementaryFrom", toKey: "educationElementaryTo", unitsKey: "educationElementaryUnits", graduatedKey: "educationElementaryGraduated", honorsKey: "educationElementaryHonors" },
    { label: "Secondary", schoolKey: "educationSecondarySchool", degreeKey: "educationSecondaryDegree", fromKey: "educationSecondaryFrom", toKey: "educationSecondaryTo", unitsKey: "educationSecondaryUnits", graduatedKey: "educationSecondaryGraduated", honorsKey: "educationSecondaryHonors" },
    { label: "Vocational / Trade Course", schoolKey: "educationVocationalSchool", degreeKey: "educationVocationalDegree", fromKey: "educationVocationalFrom", toKey: "educationVocationalTo", unitsKey: "educationVocationalUnits", graduatedKey: "educationVocationalGraduated", honorsKey: "educationVocationalHonors" },
    { label: "College", schoolKey: "educationCollegeSchool", degreeKey: "educationCollegeDegree", fromKey: "educationCollegeFrom", toKey: "educationCollegeTo", unitsKey: "educationCollegeUnits", graduatedKey: "educationCollegeGraduated", honorsKey: "educationCollegeHonors" },
    { label: "Graduate Studies", schoolKey: "educationGraduateSchool", degreeKey: "educationGraduateDegree", fromKey: "educationGraduateFrom", toKey: "educationGraduateTo", unitsKey: "educationGraduateUnits", graduatedKey: "educationGraduateGraduated", honorsKey: "educationGraduateHonors" },
];

function EducationLevelRow({ config, data, isEditing, onInputChange }: {
    config: LevelConfig; data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    const g = (key: keyof ProfileState) => (data[key] as string) ?? "";
    const s = (key: keyof ProfileState) => (value: string) => onInputChange(key, value);
    const hasData = g(config.schoolKey) || g(config.degreeKey) || g(config.fromKey) || g(config.graduatedKey);

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-950/40 px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">{config.label}</span>
                {!isEditing && !hasData && <span className="text-xs text-gray-400 italic">Not filled</span>}
            </div>
            <div className="p-4 space-y-3">
                <Field label="Name of School" value={g(config.schoolKey)} isEditing={isEditing} onChange={s(config.schoolKey)} placeholder="Write in full" />
                <Field label="Basic Education / Degree / Course" value={g(config.degreeKey)} isEditing={isEditing} onChange={s(config.degreeKey)} placeholder="Write in full" />
                <div className="grid grid-cols-2 gap-3">
                    <Field label="From (Year)" value={g(config.fromKey)} isEditing={isEditing} onChange={s(config.fromKey)} placeholder="e.g. 2000" type="number" />
                    <Field label="To (Year)" value={g(config.toKey)} isEditing={isEditing} onChange={s(config.toKey)} placeholder="e.g. 2004" type="number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Highest Level / Units Earned" value={g(config.unitsKey)} isEditing={isEditing} onChange={s(config.unitsKey)} placeholder="If not graduated" />
                    <Field label="Year Graduated" value={g(config.graduatedKey)} isEditing={isEditing} onChange={s(config.graduatedKey)} placeholder="e.g. 2004" type="number" />
                </div>
                <Field label="Scholarship / Academic Honors Received" value={g(config.honorsKey)} isEditing={isEditing} onChange={s(config.honorsKey)} placeholder="e.g. With Honors" />
            </div>
        </div>
    );
}

// ── Shared form body ───────────────────────────────────────────────────────────

function EducationBackgroundForm({ data, isEditing, onInputChange }: {
    data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    return (
        <div className="space-y-4">
            {LEVELS.map((config) => (
                <EducationLevelRow key={config.label} config={config} data={data} isEditing={isEditing} onInputChange={onInputChange} />
            ))}
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function EducationBackgroundCard({
    data, isEditing, onInputChange,
    onEdit, onSave, onCancel,
    isOwnProfile = false,
    isSaving = false,
}: {
    data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onEdit?: () => void; onSave?: () => void; onCancel?: () => void;
    isOwnProfile?: boolean; isSaving?: boolean;
}) {
    const isMobile = useIsMobile();

    return (
        <>
            {/* ── Card — always read-only ── */}
            <Card className="border-0 shadow-lg w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="text-blue-600" size={20} />
                            <CardTitle>Educational Background</CardTitle>
                        </div>
                        {isOwnProfile && (
                            <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5 text-muted-foreground hover:text-foreground">
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="text-xs">Edit</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 w-full">
                    <EducationBackgroundForm data={data} isEditing={false} onInputChange={onInputChange} />
                </CardContent>
            </Card>

            {/* ── Edit Sheet ── */}
            <Sheet open={isEditing} onOpenChange={(open) => { if (!open) onCancel?.(); }}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={[
                        "flex flex-col gap-0 p-0 overflow-hidden",
                        isMobile ? "h-[92vh] rounded-t-2xl" : "w-[500px] sm:w-[540px]",
                    ].join(" ")}
                >
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <BookOpen className="text-blue-600" size={18} />
                            <SheetTitle>Edit Educational Background</SheetTitle>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <EducationBackgroundForm data={data} isEditing={true} onInputChange={onInputChange} />
                    </div>

                    <SheetFooter className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-row gap-2 shrink-0">
                        <Button onClick={onSave} disabled={isSaving} className="gap-2 flex-1">
                            {isSaving
                                ? <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                : <Save size={16} />}
                            Save
                        </Button>
                        <Button variant="secondary" onClick={onCancel} disabled={isSaving} className="gap-2 flex-1">
                            <X size={16} />Cancel
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}