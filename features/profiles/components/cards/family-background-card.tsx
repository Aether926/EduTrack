"use client";

import React from "react";
import { Users, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

import type { ProfileState, ProfileChild } from "@/features/profiles/types/profile";

// ── Sub-components ─────────────────────────────────────────────────────────────

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
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{value || "—"}</div>
            )}
        </div>
    );
}

function SelectField(props: {
    label: string; value: string; isEditing: boolean;
    onChange: (value: string) => void;
    options: { value: string; label: string }[]; placeholder?: string;
}) {
    const { label, value, isEditing, onChange, options, placeholder } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{label}</label>
            {isEditing ? (
                <Select value={value || "N/A"} onValueChange={onChange}>
                    <SelectTrigger><SelectValue placeholder={placeholder ?? `Select ${label}`} /></SelectTrigger>
                    <SelectContent>{options.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value && value !== "N/A" ? value : "—"}
                </div>
            )}
        </div>
    );
}

function SectionHeader({ label }: { label: string }) {
    return (
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-800 pb-1">
            {label}
        </p>
    );
}

const NAME_EXTENSIONS = [
    { value: "N/A", label: "None" }, { value: "Jr.", label: "Jr." },
    { value: "Sr.", label: "Sr." }, { value: "II", label: "II" },
    { value: "III", label: "III" }, { value: "IV", label: "IV" },
    { value: "V", label: "V" },
];

// ── Shared form body ───────────────────────────────────────────────────────────

function FamilyBackgroundForm({
    data, isEditing, onInputChange, onChildrenChange,
}: {
    data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onChildrenChange: (children: ProfileChild[]) => void;
}) {
    const f = (field: keyof ProfileState) => (value: string) => onInputChange(field, value);

    const addChild = () => onChildrenChange([...data.children, { name: "", dateOfBirth: "" }]);

    const updateChild = (index: number, field: keyof ProfileChild, value: string) => {
        onChildrenChange(data.children.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    const removeChild = (index: number) => {
        onChildrenChange(data.children.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            {/* Spouse */}
            <section className="space-y-4">
                <SectionHeader label="Spouse" />
                <div className="grid grid-col-3 md:grid-row-3 gap-3">
                    <Field label="Surname" value={data.spouseSurname} isEditing={isEditing} onChange={f("spouseSurname")} placeholder="Surname" />
                    <Field label="First Name" value={data.spouseFirstName} isEditing={isEditing} onChange={f("spouseFirstName")} placeholder="First Name" />
                    <Field label="Middle Name" value={data.spouseMiddleName} isEditing={isEditing} onChange={f("spouseMiddleName")} placeholder="Middle Name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Name Extension" value={data.spouseNameExtension} isEditing={isEditing} onChange={f("spouseNameExtension")} options={NAME_EXTENSIONS} />
                    <Field label="Occupation" value={data.spouseOccupation} isEditing={isEditing} onChange={f("spouseOccupation")} placeholder="e.g. Teacher" />
                </div>
                <Field label="Employer / Business Name" value={data.spouseEmployerName} isEditing={isEditing} onChange={f("spouseEmployerName")} placeholder="e.g. DepEd Region VIII" />
                <Field label="Business Address" value={data.spouseBusinessAddress} isEditing={isEditing} onChange={f("spouseBusinessAddress")} placeholder="e.g. Ormoc City" />
                <Field label="Telephone No." value={data.spouseTelephoneNo} isEditing={isEditing} onChange={f("spouseTelephoneNo")} placeholder="e.g. (088) 123-4567" type="tel" />
            </section>

            {/* Children */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <SectionHeader label="Children" />
                    {isEditing && (
                        <Button type="button" variant="outline" size="sm" onClick={addChild} className="gap-1.5 text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950">
                            <Plus size={14} />Add Child
                        </Button>
                    )}
                </div>
                {data.children.length === 0 ? (
                    <div className="px-3 py-4 bg-gray-100 dark:bg-gray-900 rounded-md text-sm text-gray-500 text-center">
                        {isEditing ? 'Click "Add Child" to add children.' : "No children on record."}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.children.map((child, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-3 items-end p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <Field
                                    label={`Child ${index + 1} — Full Name`}
                                    value={child.name} isEditing={isEditing}
                                    onChange={(v) => updateChild(index, "name", v)}
                                    placeholder="Write full name"
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Date of Birth</label>
                                    {isEditing ? (
                                        <Input type="date" value={child.dateOfBirth} onChange={(e) => updateChild(index, "dateOfBirth", e.target.value)} />
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                            {child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeChild(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 mb-0.5">
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Father */}
            <section className="space-y-4">
                <SectionHeader label="Father" />
                <div className="grid grid-col-3 md:grid-row-3 gap-3">
                    <Field label="Surname" value={data.fatherSurname} isEditing={isEditing} onChange={f("fatherSurname")} placeholder="Surname" />
                    <Field label="First Name" value={data.fatherFirstName} isEditing={isEditing} onChange={f("fatherFirstName")} placeholder="First Name" />
                    <Field label="Middle Name" value={data.fatherMiddleName} isEditing={isEditing} onChange={f("fatherMiddleName")} placeholder="Middle Name" />
                </div>
                <SelectField label="Name Extension" value={data.fatherNameExtension} isEditing={isEditing} onChange={f("fatherNameExtension")} options={NAME_EXTENSIONS} />
            </section>

            {/* Mother */}
            <section className="space-y-4">
                <SectionHeader label="Mother's Maiden Name" />
                <div className="grid grid-row-3 md:grid-col-3 gap-3">
                    <Field label="Surname" value={data.motherSurname} isEditing={isEditing} onChange={f("motherSurname")} placeholder="Maiden Surname" />
                    <Field label="First Name" value={data.motherFirstName} isEditing={isEditing} onChange={f("motherFirstName")} placeholder="First Name" />
                    <Field label="Middle Name" value={data.motherMiddleName} isEditing={isEditing} onChange={f("motherMiddleName")} placeholder="Middle Name" />
                </div>
            </section>
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

interface FamilyBackgroundCardProps {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onChildrenChange: (children: ProfileChild[]) => void;
    onEdit?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    isOwnProfile?: boolean;
    isSaving?: boolean;
}

export default function FamilyBackgroundCard({
    data, isEditing, onInputChange, onChildrenChange,
    onEdit, onSave, onCancel,
    isOwnProfile = false,
    isSaving = false,
}: FamilyBackgroundCardProps) {
    const isMobile = useIsMobile();

    return (
        <>
            {/* ── Card — always read-only ── */}
            <Card className="border-0 shadow-lg w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="text-blue-600" size={20} />
                            <CardTitle>Family Background</CardTitle>
                        </div>
                        {isOwnProfile && (
                            <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5 text-muted-foreground hover:text-foreground">
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="text-xs">Edit</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 w-full">
                    <FamilyBackgroundForm
                        data={data} isEditing={false}
                        onInputChange={onInputChange}
                        onChildrenChange={onChildrenChange}
                    />
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
                            <Users className="text-blue-600" size={18} />
                            <SheetTitle>Edit Family Background</SheetTitle>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <FamilyBackgroundForm
                            data={data} isEditing={true}
                            onInputChange={onInputChange}
                            onChildrenChange={onChildrenChange}
                        />
                    </div>

                    <SheetFooter className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-row gap-2 shrink-0">
                        <Button 
                                                onClick={onSave} disabled={isSaving} 
                                                className="gap-2 flex-1">
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