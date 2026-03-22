"use client";

import React from "react";
import { Users, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
    ProfileState,
    ProfileChild,
} from "@/features/profiles/types/profile";

// ── Display value ──────────────────────────────────────────────────────────────

function DisplayValue({ value }: { value?: string | null }) {
    return (
        <div className="px-3 py-2 rounded-md bg-white/5 border border-white/8 text-sm font-medium text-foreground">
            {value || <span className="text-muted-foreground">—</span>}
        </div>
    );
}

// ── Field label ────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            {children}
        </label>
    );
}

// ── Section divider ────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest shrink-0">
                {label}
            </span>
            <div className="h-px flex-1 bg-border/50" />
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
            <FieldLabel>{label}</FieldLabel>
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

// ── SelectField ────────────────────────────────────────────────────────────────

function SelectField(props: {
    label: string;
    value: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}) {
    const { label, value, isEditing, onChange, options, placeholder } = props;
    return (
        <div className="space-y-1.5">
            <FieldLabel>{label}</FieldLabel>
            {isEditing ? (
                <Select value={value || "N/A"} onValueChange={onChange}>
                    <SelectTrigger className="bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20">
                        <SelectValue
                            placeholder={placeholder ?? `Select ${label}`}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <DisplayValue
                    value={value && value !== "N/A" ? value : undefined}
                />
            )}
        </div>
    );
}

const NAME_EXTENSIONS = [
    { value: "N/A", label: "None" },
    { value: "Jr.", label: "Jr." },
    { value: "Sr.", label: "Sr." },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
    { value: "V", label: "V" },
];

// ── Shared form body ───────────────────────────────────────────────────────────

function FamilyBackgroundForm({
    data,
    isEditing,
    onInputChange,
    onChildrenChange,
}: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onChildrenChange: (children: ProfileChild[]) => void;
}) {
    const f = (field: keyof ProfileState) => (value: string) =>
        onInputChange(field, value);

    const addChild = () =>
        onChildrenChange([...data.children, { name: "", dateOfBirth: "" }]);
    const updateChild = (
        index: number,
        field: keyof ProfileChild,
        value: string,
    ) =>
        onChildrenChange(
            data.children.map((c, i) =>
                i === index ? { ...c, [field]: value } : c,
            ),
        );
    const removeChild = (index: number) =>
        onChildrenChange(data.children.filter((_, i) => i !== index));

    return (
        <div className="space-y-6">
            {/* Spouse */}
            <SectionDivider label="Spouse" />
            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                    <Field
                        label="Surname"
                        value={data.spouseSurname}
                        isEditing={isEditing}
                        onChange={f("spouseSurname")}
                        placeholder="Surname"
                    />
                    <Field
                        label="First Name"
                        value={data.spouseFirstName}
                        isEditing={isEditing}
                        onChange={f("spouseFirstName")}
                        placeholder="First Name"
                    />
                    <Field
                        label="Middle Name"
                        value={data.spouseMiddleName}
                        isEditing={isEditing}
                        onChange={f("spouseMiddleName")}
                        placeholder="Middle Name"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <SelectField
                        label="Name Extension"
                        value={data.spouseNameExtension}
                        isEditing={isEditing}
                        onChange={f("spouseNameExtension")}
                        options={NAME_EXTENSIONS}
                    />
                    <Field
                        label="Occupation"
                        value={data.spouseOccupation}
                        isEditing={isEditing}
                        onChange={f("spouseOccupation")}
                        placeholder="e.g. Teacher"
                    />
                </div>
                <Field
                    label="Employer / Business Name"
                    value={data.spouseEmployerName}
                    isEditing={isEditing}
                    onChange={f("spouseEmployerName")}
                    placeholder="e.g. DepEd Region VIII"
                />
                <Field
                    label="Business Address"
                    value={data.spouseBusinessAddress}
                    isEditing={isEditing}
                    onChange={f("spouseBusinessAddress")}
                    placeholder="e.g. Ormoc City"
                />
                <Field
                    label="Telephone No."
                    value={data.spouseTelephoneNo}
                    isEditing={isEditing}
                    onChange={f("spouseTelephoneNo")}
                    placeholder="e.g. (088) 123-4567"
                    type="tel"
                />
            </div>

            {/* Children */}
            <SectionDivider label="Children" />
            <div className="space-y-3">
                {isEditing && (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addChild}
                            className="gap-1.5 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                        >
                            <Plus size={14} />
                            Add Child
                        </Button>
                    </div>
                )}
                {data.children.length === 0 ? (
                    <div className="px-3 py-4 rounded-md bg-white/5 border border-white/8 text-sm text-muted-foreground text-center">
                        {isEditing
                            ? 'Click "Add Child" to add children.'
                            : "No children on record."}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.children.map((child, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-[1fr_auto_auto] gap-3 items-end p-3 rounded-lg border border-white/8 bg-white/3"
                            >
                                <Field
                                    label={`Child ${index + 1} — Full Name`}
                                    value={child.name}
                                    isEditing={isEditing}
                                    onChange={(v) =>
                                        updateChild(index, "name", v)
                                    }
                                    placeholder="Write full name"
                                />
                                <div className="space-y-1.5">
                                    <FieldLabel>Date of Birth</FieldLabel>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={child.dateOfBirth}
                                            onChange={(e) =>
                                                updateChild(
                                                    index,
                                                    "dateOfBirth",
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-white/5 border-white/10 focus:border-blue-500/50"
                                        />
                                    ) : (
                                        <DisplayValue
                                            value={
                                                child.dateOfBirth
                                                    ? new Date(
                                                          child.dateOfBirth,
                                                      ).toLocaleDateString(
                                                          "en-PH",
                                                          {
                                                              year: "numeric",
                                                              month: "long",
                                                              day: "numeric",
                                                          },
                                                      )
                                                    : undefined
                                            }
                                        />
                                    )}
                                </div>
                                {isEditing && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeChild(index)}
                                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 mb-0.5"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Father */}
            <SectionDivider label="Father" />
            <div className="space-y-3">
                <Field
                    label="Surname"
                    value={data.fatherSurname}
                    isEditing={isEditing}
                    onChange={f("fatherSurname")}
                    placeholder="Surname"
                />
                <Field
                    label="First Name"
                    value={data.fatherFirstName}
                    isEditing={isEditing}
                    onChange={f("fatherFirstName")}
                    placeholder="First Name"
                />
                <Field
                    label="Middle Name"
                    value={data.fatherMiddleName}
                    isEditing={isEditing}
                    onChange={f("fatherMiddleName")}
                    placeholder="Middle Name"
                />
                <SelectField
                    label="Name Extension"
                    value={data.fatherNameExtension}
                    isEditing={isEditing}
                    onChange={f("fatherNameExtension")}
                    options={NAME_EXTENSIONS}
                />
            </div>

            {/* Mother */}
            <SectionDivider label="Mother's Maiden Name" />
            <div className="space-y-3">
                <Field
                    label="Surname"
                    value={data.motherSurname}
                    isEditing={isEditing}
                    onChange={f("motherSurname")}
                    placeholder="Maiden Surname"
                />
                <Field
                    label="First Name"
                    value={data.motherFirstName}
                    isEditing={isEditing}
                    onChange={f("motherFirstName")}
                    placeholder="First Name"
                />
                <Field
                    label="Middle Name"
                    value={data.motherMiddleName}
                    isEditing={isEditing}
                    onChange={f("motherMiddleName")}
                    placeholder="Middle Name"
                />
            </div>
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
    data,
    isEditing,
    onInputChange,
    onChildrenChange,
    onEdit,
    onSave,
    onCancel,
    isOwnProfile = false,
    isSaving = false,
}: FamilyBackgroundCardProps) {
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
                                <Users className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-base font-semibold text-foreground">
                                Family Background
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
                    <FamilyBackgroundForm
                        data={data}
                        isEditing={false}
                        onInputChange={onInputChange}
                        onChildrenChange={onChildrenChange}
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
                                <Users className="h-4 w-4 text-blue-400" />
                            </div>
                            <SheetTitle className="text-sm font-medium text-muted-foreground">
                                Edit Family Background
                            </SheetTitle>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <FamilyBackgroundForm
                            data={data}
                            isEditing={true}
                            onInputChange={onInputChange}
                            onChildrenChange={onChildrenChange}
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
