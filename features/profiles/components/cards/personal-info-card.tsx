"use client";

import React from "react";
import {
    User, Calendar, ChevronDownIcon, MapPin,
    Ruler, Weight, Droplets, Flag, Copy, Edit2, Save, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/combobox";
import { useIsMobile } from "@/hooks/use-mobile";

import type { ProfileState } from "@/features/profiles/types/profile";
import { formatName } from "@/app/util/helper";

// ── Sub-components (unchanged from original) ───────────────────────────────────

function InputField(props: {
    label: string;
    mobileLabel?: string;
    value: string;
    field: keyof ProfileState;
    type?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    rows?: number;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onBlur?: (field: keyof ProfileState) => void;
    required?: boolean;
    placeholder?: string;
}) {
    const {
        label, mobileLabel, value, field, type = "text",
        icon: Icon, rows, isEditing, onInputChange, onBlur, required, placeholder,
    } = props;
    const isTextarea = type === "textarea";
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                {Icon ? <Icon size={14} className="text-blue-600" /> : null}
                {mobileLabel ? (
                    <>
                        <span className="max-[425px]:hidden">{label}</span>
                        <span className="hidden max-[425px]:inline">{mobileLabel}</span>
                    </>
                ) : label}
                {required ? <span className="text-red-500">*</span> : null}
            </label>
            {isEditing ? (
                isTextarea ? (
                    <Textarea value={value} onChange={(e) => onInputChange(field, e.target.value)} className="resize-none" rows={rows || 3} placeholder={placeholder || ""} required={Boolean(required)} />
                ) : (
                    <Input type={type} value={value} onChange={(e) => onInputChange(field, e.target.value)} onBlur={() => onBlur?.(field)} placeholder={placeholder || ""} required={Boolean(required)} />
                )
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{value || "—"}</div>
            )}
        </div>
    );
}

function DatePickerField(props: {
    label: string;
    value: Date | undefined;
    field: keyof ProfileState;
    isEditing: boolean;
    onDateChange: (field: keyof ProfileState, date: Date | undefined) => void;
    required?: boolean;
}) {
    const { label, value, field, isEditing, onDateChange, required } = props;
    const [open, setOpen] = React.useState(false);
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={14} className="text-blue-600" />{label}
                {required ? <span className="text-red-500">*</span> : null}
            </label>
            {isEditing ? (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {value ? value.toLocaleDateString() : <span className="text-muted-foreground font-normal">Select date</span>}
                            <ChevronDownIcon className="ml-auto h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
                        <CalendarComponent mode="single" selected={value} captionLayout="dropdown" onSelect={(date) => { onDateChange(field, date); setOpen(false); }} />
                    </PopoverContent>
                </Popover>
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{value ? value.toLocaleDateString() : "—"}</div>
            )}
        </div>
    );
}

function SelectField(props: {
    label: string; value: string; field: keyof ProfileState;
    options: { value: string; label: string }[];
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    placeholder?: string;
}) {
    const { label, value, field, options, icon: Icon, isEditing, onInputChange, placeholder } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                {Icon ? <Icon size={14} className="text-blue-600 shrink-0" /> : null}{label}
            </label>
            {isEditing ? (
                <Select value={value} onValueChange={(v) => onInputChange(field, v)}>
                    <SelectTrigger><SelectValue placeholder={placeholder ?? `Select ${label}`} /></SelectTrigger>
                    <SelectContent>{options.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{value || "—"}</div>
            )}
        </div>
    );
}

function AddressBlock(props: {
    prefix: "residential" | "permanent"; label: string; data: ProfileState;
    isEditing: boolean; disabled?: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    const { prefix, label, data, isEditing, disabled, onInputChange } = props;
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const f = (suffix: string) => `${prefix}${cap(suffix)}` as keyof ProfileState;
    const fields = [
        { key: "HouseNo", label: "House / Block / Lot No.", half: true, placeholder: "e.g. 12B" },
        { key: "Street", label: "Street", half: true, placeholder: "e.g. Rizal St." },
        { key: "Subdivision", label: "Subdivision / Village", half: false, placeholder: "e.g. Deca Homes." },
        { key: "Barangay", label: "Barangay", half: true, placeholder: "e.g. Valencia" },
        { key: "City", label: "City / Municipality", half: true, placeholder: "e.g. Ormoc City" },
        { key: "Province", label: "Province", half: true, placeholder: "e.g. Leyte" },
        { key: "ZipCode", label: "ZIP Code", half: true, placeholder: "e.g. 6513" },
    ];
    return (
        <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                <MapPin size={13} className="text-blue-500" />{label}
            </p>
            <div className="grid grid-cols-2 max-[480px]:grid-cols-1 gap-3 items-end">
                {fields.map((field) => (
                    <div key={field.key} className={`space-y-1.5 ${!field.half ? "col-span-2 max-[480px]:col-span-1" : ""}`}>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block">{field.label}</label>
                        {isEditing && !disabled ? (
                            <Input value={(data[f(field.key)] as string) ?? ""} onChange={(e) => onInputChange(f(field.key), e.target.value)} placeholder={field.placeholder} />
                        ) : (
                            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{(data[f(field.key)] as string) || "—"}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Constants ──────────────────────────────────────────────────────────────────

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const NAME_EXTENSIONS = ["Jr.", "Sr.", "II", "III", "IV", "V"];
const nationalities = [
    { value: "american", label: "American" }, { value: "australian", label: "Australian" },
    { value: "british", label: "British" }, { value: "canadian", label: "Canadian" },
    { value: "chinese", label: "Chinese" }, { value: "emirati", label: "Emirati" },
    { value: "filipino", label: "Filipino" }, { value: "french", label: "French" },
    { value: "german", label: "German" }, { value: "indian", label: "Indian" },
    { value: "indonesian", label: "Indonesian" }, { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" }, { value: "korean", label: "Korean" },
    { value: "kuwaiti", label: "Kuwaiti" }, { value: "malaysian", label: "Malaysian" },
    { value: "qatari", label: "Qatari" }, { value: "saudi", label: "Saudi" },
    { value: "singaporean", label: "Singaporean" }, { value: "spanish", label: "Spanish" },
    { value: "taiwanese", label: "Taiwanese" }, { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" },
];
const religions = [
    { value: "roman catholic", label: "Roman Catholic" }, { value: "islam", label: "Islam" },
    { value: "evangelical", label: "Evangelical" }, { value: "protestant", label: "Protestant" },
    { value: "iglesia ni Cristo", label: "Iglesia ni Cristo" },
    { value: "seventh-day Adventist", label: "Seventh-day Adventist" },
];

// ── Shared form body ───────────────────────────────────────────────────────────

function PersonalInfoForm({
    data, isEditing, onInputChange, onDateChange,
}: {
    data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onDateChange: (field: keyof ProfileState, date: Date | undefined) => void;
}) {
    const isDualCitizen = data.citizenship === "Dual Citizenship";

    const handleSameAsResidential = (checked: boolean) => {
        onInputChange("sameAsResidential" as keyof ProfileState, String(checked));
        if (checked) {
            onInputChange("permanentHouseNo", data.residentialHouseNo);
            onInputChange("permanentStreet", data.residentialStreet);
            onInputChange("permanentSubdivision", data.residentialSubdivision);
            onInputChange("permanentBarangay", data.residentialBarangay);
            onInputChange("permanentCity", data.residentialCity);
            onInputChange("permanentProvince", data.residentialProvince);
            onInputChange("permanentZipCode", data.residentialZipCode);
        }
    };

    return (
        <div className="space-y-6">
            {/* Name */}
            <div className="space-y-4">
                <InputField label="First Name" value={data.firstName} field="firstName" icon={User} isEditing={isEditing} onInputChange={onInputChange}
                    onBlur={(f) => { if (f === "firstName") onInputChange("firstName", formatName(data.firstName)); }} required />
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                            <span className="hidden md:inline">Middle Initial</span>
                            <span className="inline md:hidden">M.I.</span>
                        </label>
                        {isEditing ? (
                            <Input
                                value={data.middleInitial}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^a-zA-Z.]/g, "");
                                    const letter = raw.replace(/\./g, "").slice(0, 1).toUpperCase();
                                    onInputChange("middleInitial", letter ? `${letter}.` : "");
                                }}
                                onKeyDown={(e) => {
                                    if ((e.key === "Backspace" || e.key === "Delete") && data.middleInitial) {
                                        e.preventDefault(); onInputChange("middleInitial", "");
                                    }
                                }}
                                placeholder="Optional"
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.middleInitial || "—"}</div>
                        )}
                    </div>
                    <div className="col-span-2">
                        <InputField label="Last Name" value={data.lastName} field="lastName" isEditing={isEditing} onInputChange={onInputChange}
                            onBlur={(f) => { if (f === "lastName") onInputChange("lastName", formatName(data.lastName)); }} required />
                    </div>
                </div>
                <SelectField label="Name Extension" value={data.nameExtension ?? ""} field="nameExtension"
                    options={NAME_EXTENSIONS.map((v) => ({ value: v, label: v }))}
                    isEditing={isEditing} onInputChange={onInputChange} placeholder="None (e.g. Jr., Sr.)" />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Age / Gender / DOB / Civil Status */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Age</label>
                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.age || "—"}</div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Gender</label>
                        {isEditing ? (
                            <Select value={data.gender} onValueChange={(v) => onInputChange("gender", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.gender || "—"}</div>
                        )}
                    </div>
                </div>
                <DatePickerField label="Date of Birth" value={data.dateOfBirth} field="dateOfBirth" isEditing={isEditing} onDateChange={onDateChange} />
                <InputField label="Place of Birth" value={data.placeOfBirth ?? ""} field="placeOfBirth" icon={MapPin} isEditing={isEditing} onInputChange={onInputChange} placeholder="e.g. Ormoc City, Leyte" />
                <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Civil Status</label>
                    {isEditing ? (
                        <Select value={data.civilStatus} onValueChange={(v) => onInputChange("civilStatus", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Widowed">Widowed</SelectItem>
                                <SelectItem value="Separated">Separated</SelectItem>
                                <SelectItem value="Divorced">Divorced</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.civilStatus || "—"}</div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Physical */}
            <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Physical Information</p>
                <div className="grid grid-cols-3 gap-3">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                        <Ruler size={14} className="text-blue-600 shrink-0" />Height (m)
                    </label>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                        <Weight size={14} className="text-blue-600 shrink-0" />Weight (kg)
                    </label>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                        <Droplets size={14} className="text-blue-600 shrink-0" />Blood Type
                    </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {isEditing ? <Input type="number" value={data.height ?? ""} onChange={(e) => onInputChange("height", e.target.value)} placeholder="e.g. 1.65" />
                        : <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.height || "—"}</div>}
                    {isEditing ? <Input type="number" value={data.weight ?? ""} onChange={(e) => onInputChange("weight", e.target.value)} placeholder="e.g. 62.5" />
                        : <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.weight || "—"}</div>}
                    {isEditing ? (
                        <Select value={data.bloodType ?? ""} onValueChange={(v) => onInputChange("bloodType", v)}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{BLOOD_TYPES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                    ) : <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.bloodType || "—"}</div>}
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Nationality / Religion / Citizenship */}
            <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nationality</label>
                    {isEditing
                        ? <Combobox label="Nationality" options={nationalities} onChangeValue={(v: string) => onInputChange("nationality", v)} />
                        : <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.nationality || "—"}</div>}
                </div>
                <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Religion</label>
                    {isEditing
                        ? <Combobox label="Religion" options={religions} onChangeValue={(v: string) => onInputChange("religion", v)} />
                        : <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{data.religion || "—"}</div>}
                </div>
                <SelectField label="Citizenship" value={data.citizenship ?? "Filipino"} field="citizenship"
                    options={[{ value: "Filipino", label: "Filipino" }, { value: "Dual Citizenship", label: "Dual Citizenship" }]}
                    icon={Flag} isEditing={isEditing} onInputChange={onInputChange} />
                {isDualCitizen && (
                    <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                        <SelectField label="By" value={data.dualCitizenshipType ?? ""} field="dualCitizenshipType"
                            options={[{ value: "by birth", label: "By Birth" }, { value: "by naturalization", label: "By Naturalization" }]}
                            isEditing={isEditing} onInputChange={onInputChange} />
                        <InputField label="Country" value={data.dualCitizenshipCountry ?? ""} field="dualCitizenshipCountry"
                            isEditing={isEditing} onInputChange={onInputChange} placeholder="e.g. USA" />
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Addresses */}
            <div className="space-y-4">
                <AddressBlock prefix="residential" label="Residential Address" data={data} isEditing={isEditing} onInputChange={onInputChange} />
                {isEditing && (
                    <div className="flex items-center gap-2 py-1">
                        <Checkbox id="sameAsResidential" checked={data.sameAsResidential ?? false}
                            onCheckedChange={(checked) => handleSameAsResidential(Boolean(checked))} />
                        <Label htmlFor="sameAsResidential" className="text-sm cursor-pointer flex items-center gap-1.5">
                            <Copy size={13} className="text-blue-500" />Permanent address same as residential
                        </Label>
                    </div>
                )}
                <AddressBlock prefix="permanent" label="Permanent Address" data={data} isEditing={isEditing}
                    disabled={data.sameAsResidential ?? false} onInputChange={onInputChange} />
            </div>
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function PersonalInfoCard({
    data,
    isEditing,
    onInputChange,
    onDateChange,
    onEdit,
    onSave,
    onCancel,
    isOwnProfile = false,
    isSaving = false,
}: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onDateChange: (field: keyof ProfileState, date: Date | undefined) => void;
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
            <Card className="border-0 shadow-lg w-full xl:max-w-[500px]">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="text-blue-600" size={20} />
                            <CardTitle>Personal Information</CardTitle>
                        </div>
                        {/* Only shown when viewing own profile */}
                        {isOwnProfile && (
                            <Button
                                variant="ghost" size="sm"
                                onClick={onEdit}
                                className="gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="text-xs">Edit</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 w-full">
                    <PersonalInfoForm
                        data={data}
                        isEditing={false}
                        onInputChange={onInputChange}
                        onDateChange={onDateChange}
                    />
                </CardContent>
            </Card>

            {/* ── Edit Sheet — bottom on mobile, right on desktop ── */}
            <Sheet open={isEditing} onOpenChange={(open) => { if (!open) onCancel?.(); }}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={[
                        "flex flex-col gap-0 p-0 overflow-hidden",
                        isMobile ? "h-[92vh] rounded-t-2xl" : "w-[500px] sm:w-[540px]",
                    ].join(" ")}
                >
                    {/* Sticky header */}
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <User className="text-blue-600" size={18} />
                            <SheetTitle>Edit Personal Information</SheetTitle>
                        </div>
                    </SheetHeader>

                    {/* Scrollable form */}
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <PersonalInfoForm
                            data={data}
                            isEditing={true}
                            onInputChange={onInputChange}
                            onDateChange={onDateChange}
                        />
                    </div>

                    {/* Sticky footer */}
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