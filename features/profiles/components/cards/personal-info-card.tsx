"use client";

import React from "react";
import {
    User,
    Calendar,
    ChevronDownIcon,
    MapPin,
    Ruler,
    Weight,
    Droplets,
    Phone,
    Flag,
    Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/combobox";

import type { ProfileState } from "@/features/profiles/types/profile";
import { formatName, cleanMiddleInitial } from "@/app/util/helper";

function InputField(props: {
    label: string;
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
        label,
        value,
        field,
        type = "text",
        icon: Icon,
        rows,
        isEditing,
        onInputChange,
        onBlur,
        required,
        placeholder,
    } = props;
    const isTextarea = type === "textarea";

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                {Icon ? <Icon size={14} className="text-blue-600" /> : null}
                {label}
                {required ? <span className="text-red-500">*</span> : null}
            </label>
            {isEditing ? (
                isTextarea ? (
                    <Textarea
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        className="resize-none"
                        rows={rows || 3}
                        placeholder={placeholder || ""}
                        required={Boolean(required)}
                    />
                ) : (
                    <Input
                        type={type}
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        onBlur={() => onBlur?.(field)}
                        placeholder={placeholder || ""}
                        required={Boolean(required)}
                    />
                )
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value || "—"}
                </div>
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
                <Calendar size={14} className="text-blue-600" />
                {label}
                {required ? <span className="text-red-500">*</span> : null}
            </label>
            {isEditing ? (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            {value ? value.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon className="ml-auto h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 overflow-hidden"
                        align="start"
                    >
                        <CalendarComponent
                            mode="single"
                            selected={value}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                onDateChange(field, date);
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value ? value.toLocaleDateString() : "—"}
                </div>
            )}
        </div>
    );
}

function SelectField(props: {
    label: string;
    value: string;
    field: keyof ProfileState;
    options: { value: string; label: string }[];
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    placeholder?: string;
}) {
    const {
        label,
        value,
        field,
        options,
        icon: Icon,
        isEditing,
        onInputChange,
        placeholder,
    } = props;

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                {Icon ? <Icon size={14} className="text-blue-600" /> : null}
                {label}
            </label>
            {isEditing ? (
                <Select
                    value={value}
                    onValueChange={(v) => onInputChange(field, v)}
                >
                    <SelectTrigger>
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
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value || "—"}
                </div>
            )}
        </div>
    );
}

// ─── Address Block ────────────────────────────────────────────────────────────

function AddressBlock(props: {
    prefix: "residential" | "permanent";
    label: string;
    data: ProfileState;
    isEditing: boolean;
    disabled?: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    const { prefix, label, data, isEditing, disabled, onInputChange } = props;
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const f = (suffix: string) =>
        `${prefix}${cap(suffix)}` as keyof ProfileState;

    const fields = [
        {
            key: "HouseNo",
            label: "House / Block / Lot No.",
            half: true,
            placeholder: "e.g. 12B",
        },
        {
            key: "Street",
            label: "Street",
            half: true,
            placeholder: "e.g. Rizal St.",
        },
        {
            key: "Subdivision",
            label: "Subdivision / Village",
            half: false,
            placeholder: "e.g. Greenview Subd.",
        },
        {
            key: "Barangay",
            label: "Barangay",
            half: true,
            placeholder: "e.g. Bagong Silang",
        },
        {
            key: "City",
            label: "City / Municipality",
            half: true,
            placeholder: "e.g. Valencia City",
        },
        {
            key: "Province",
            label: "Province",
            half: true,
            placeholder: "e.g. Bukidnon",
        },
        {
            key: "ZipCode",
            label: "ZIP Code",
            half: true,
            placeholder: "e.g. 8709",
        },
    ];

    return (
        <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                <MapPin size={13} className="text-blue-500" />
                {label}
            </p>
            <div className="grid grid-cols-2 gap-3">
                {fields.map((field) => (
                    <div
                        key={field.key}
                        className={field.half ? "" : "col-span-2"}
                    >
                        <InputField
                            label={field.label}
                            value={(data[f(field.key)] as string) ?? ""}
                            field={f(field.key)}
                            isEditing={isEditing && !disabled}
                            onInputChange={onInputChange}
                            placeholder={field.placeholder}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const NAME_EXTENSIONS = ["Jr.", "Sr.", "II", "III", "IV", "V"];

const nationalities = [
    { value: "american", label: "American" },
    { value: "australian", label: "Australian" },
    { value: "british", label: "British" },
    { value: "canadian", label: "Canadian" },
    { value: "chinese", label: "Chinese" },
    { value: "emirati", label: "Emirati" },
    { value: "filipino", label: "Filipino" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "indian", label: "Indian" },
    { value: "indonesian", label: "Indonesian" },
    { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "kuwaiti", label: "Kuwaiti" },
    { value: "malaysian", label: "Malaysian" },
    { value: "qatari", label: "Qatari" },
    { value: "saudi", label: "Saudi" },
    { value: "singaporean", label: "Singaporean" },
    { value: "spanish", label: "Spanish" },
    { value: "taiwanese", label: "Taiwanese" },
    { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" },
];

const religions = [
    { value: "roman catholic", label: "Roman Catholic" },
    { value: "islam", label: "Islam" },
    { value: "evangelical", label: "Evangelical" },
    { value: "protestant", label: "Protestant" },
    { value: "iglesia ni Cristo", label: "Iglesia ni Cristo" },
    { value: "seventh-day Adventist", label: "Seventh-day Adventist" },
];

export default function PersonalInfoCard(props: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onDateChange: (field: keyof ProfileState, date: Date | undefined) => void;
    viewerRole?: "GUEST" | "TEACHER" | "ADMIN";
}) {
    const { data, isEditing, onInputChange, onDateChange, viewerRole } = props;

    const isDualCitizen = data.citizenship === "Dual Citizenship";

    // Auto-copy residential → permanent when toggled
    const handleSameAsResidential = (checked: boolean) => {
        onInputChange(
            "sameAsResidential" as keyof ProfileState,
            String(checked),
        );
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
        <Card className="border-0 shadow-lg w-full xl:max-w-[500px]">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <User className="text-blue-600" size={20} />
                    <CardTitle>Personal Information</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 w-full">
                {/* ── Name fields ── */}
                <div className="space-y-4">
                    <InputField
                        label="First Name"
                        value={data.firstName}
                        field="firstName"
                        icon={User}
                        isEditing={isEditing}
                        onInputChange={onInputChange}
                        onBlur={(field) => {
                            if (field === "firstName")
                                onInputChange(
                                    "firstName",
                                    formatName(data.firstName),
                                );
                        }}
                        required
                    />

                    <div className="grid grid-cols-3 gap-3">
                        <InputField
                            label="Middle Initial"
                            value={data.middleInitial}
                            field="middleInitial"
                            isEditing={isEditing}
                            onInputChange={(field, value) =>
                                onInputChange(field, cleanMiddleInitial(value))
                            }
                            placeholder="Optional"
                        />
                        <div className="col-span-2">
                            <InputField
                                label="Last Name"
                                value={data.lastName}
                                field="lastName"
                                isEditing={isEditing}
                                onInputChange={onInputChange}
                                onBlur={(field) => {
                                    if (field === "lastName")
                                        onInputChange(
                                            "lastName",
                                            formatName(data.lastName),
                                        );
                                }}
                                required
                            />
                        </div>
                    </div>

                    {/* Name Extension */}
                    <SelectField
                        label="Name Extension"
                        value={data.nameExtension ?? ""}
                        field="nameExtension"
                        options={NAME_EXTENSIONS.map((v) => ({
                            value: v,
                            label: v,
                        }))}
                        isEditing={isEditing}
                        onInputChange={onInputChange}
                        placeholder="None (e.g. Jr., Sr.)"
                    />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800" />

                {/* ── Age, Gender, DOB, Civil Status ── */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Age
                            </label>
                            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                {data.age || "—"}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Gender
                            </label>
                            {isEditing ? (
                                <Select
                                    value={data.gender}
                                    onValueChange={(v) =>
                                        onInputChange("gender", v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="Female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.gender}
                                </div>
                            )}
                        </div>
                    </div>

                    <DatePickerField
                        label="Date of Birth"
                        value={data.dateOfBirth}
                        field="dateOfBirth"
                        isEditing={isEditing}
                        onDateChange={onDateChange}
                    />

                    {/* Place of Birth */}
                    <InputField
                        label="Place of Birth"
                        value={data.placeOfBirth ?? ""}
                        field="placeOfBirth"
                        icon={MapPin}
                        isEditing={isEditing}
                        onInputChange={onInputChange}
                        placeholder="e.g. Valencia City, Bukidnon"
                    />

                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Civil Status
                        </label>
                        {isEditing ? (
                            <Select
                                value={data.civilStatus}
                                onValueChange={(v) =>
                                    onInputChange("civilStatus", v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">
                                        Single
                                    </SelectItem>
                                    <SelectItem value="Married">
                                        Married
                                    </SelectItem>
                                    <SelectItem value="Widowed">
                                        Widowed
                                    </SelectItem>
                                    <SelectItem value="Separated">
                                        Separated
                                    </SelectItem>
                                    <SelectItem value="Divorced">
                                        Divorced
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                {data.civilStatus}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800" />

                {/* ── Physical Info ── */}
                <div className="space-y-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Physical Information
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <InputField
                            label="Height (m)"
                            value={data.height ?? ""}
                            field="height"
                            type="number"
                            icon={Ruler}
                            isEditing={isEditing}
                            onInputChange={onInputChange}
                            placeholder="e.g. 1.65"
                        />
                        <InputField
                            label="Weight (kg)"
                            value={data.weight ?? ""}
                            field="weight"
                            type="number"
                            icon={Weight}
                            isEditing={isEditing}
                            onInputChange={onInputChange}
                            placeholder="e.g. 62.5"
                        />
                        <SelectField
                            label="Blood Type"
                            value={data.bloodType ?? ""}
                            field="bloodType"
                            options={BLOOD_TYPES.map((v) => ({
                                value: v,
                                label: v,
                            }))}
                            icon={Droplets}
                            isEditing={isEditing}
                            onInputChange={onInputChange}
                            placeholder="Select"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800" />

                {/* ── Nationality ── */}
                <div className="space-y-4">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Nationality
                        </label>
                        {isEditing ? (
                            <Combobox
                                label="Nationality"
                                options={nationalities}
                                onChangeValue={(v: string) =>
                                    onInputChange("nationality", v)
                                }
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                {data.nationality}
                            </div>
                        )}
                    </div>

                    {/* ── Religion ── */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Religion
                        </label>
                        {isEditing ? (
                            <Combobox
                                label="Religion"
                                options={religions}
                                onChangeValue={(v: string) =>
                                    onInputChange("religion", v)
                                }
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                {data.religion}
                            </div>
                        )}
                    </div>

                    {/* Citizenship */}
                    <SelectField
                        label="Citizenship"
                        value={data.citizenship ?? "Filipino"}
                        field="citizenship"
                        options={[
                            { value: "Filipino", label: "Filipino" },
                            {
                                value: "Dual Citizenship",
                                label: "Dual Citizenship",
                            },
                        ]}
                        icon={Flag}
                        isEditing={isEditing}
                        onInputChange={onInputChange}
                    />

                    {isDualCitizen && (
                        <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                            <SelectField
                                label="By"
                                value={data.dualCitizenshipType ?? ""}
                                field="dualCitizenshipType"
                                options={[
                                    { value: "by birth", label: "By Birth" },
                                    {
                                        value: "by naturalization",
                                        label: "By Naturalization",
                                    },
                                ]}
                                isEditing={isEditing}
                                onInputChange={onInputChange}
                            />
                            <InputField
                                label="Country"
                                value={data.dualCitizenshipCountry ?? ""}
                                field="dualCitizenshipCountry"
                                isEditing={isEditing}
                                onInputChange={onInputChange}
                                placeholder="e.g. USA"
                            />
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800" />

                {/* ── Telephone ── */}
                <div className="space-y-4">
                    <InputField
                        label="Telephone No. (Landline)"
                        value={data.telephoneNo ?? ""}
                        field="telephoneNo"
                        type="tel"
                        icon={Phone}
                        isEditing={isEditing}
                        onInputChange={onInputChange}
                        placeholder="e.g. (088) 123-4567"
                        required
                    />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800" />

                {/* ── Residential Address ── */}
                <div className="space-y-4">
                    <AddressBlock
                        prefix="residential"
                        label="Residential Address"
                        data={data}
                        isEditing={isEditing}
                        onInputChange={onInputChange}
                    />

                    {isEditing && (
                        <div className="flex items-center gap-2 py-1">
                            <Checkbox
                                id="sameAsResidential"
                                checked={data.sameAsResidential ?? false}
                                onCheckedChange={(checked) =>
                                    handleSameAsResidential(Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="sameAsResidential"
                                className="text-sm cursor-pointer flex items-center gap-1.5"
                            >
                                <Copy size={13} className="text-blue-500" />
                                Permanent address same as residential
                            </Label>
                        </div>
                    )}

                    <AddressBlock
                        prefix="permanent"
                        label="Permanent Address"
                        data={data}
                        isEditing={isEditing}
                        disabled={data.sameAsResidential ?? false}
                        onInputChange={onInputChange}
                    />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800" />
            </CardContent>
        </Card>
    );
}
