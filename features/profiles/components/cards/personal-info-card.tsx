/* eslint-disable @typescript-eslint/no-explicit-any */
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
    Flag,
    Copy,
    Edit2,
    Save,
    X,
} from "lucide-react";

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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/combobox";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    NameInput,
    MiddleInitialInput,
} from "@/components/formatter/name-format";

import type { ProfileState } from "@/features/profiles/types/profile";
import { LocationSelect, LocationValue } from "@/components/ui/location-select";
import { provinces, regions } from "ph-locations";
import { Country } from "country-state-city";

function DisplayValue({ value }: { value?: string | null }) {
    return (
        <div className="px-3 py-2 rounded-md bg-white/5 border border-white/8 text-sm font-medium text-foreground">
            {value || <span className="text-muted-foreground">—</span>}
        </div>
    );
}

function FieldLabel({
    icon: Icon,
    children,
    required,
}: {
    icon?: React.ElementType;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            {Icon && <Icon size={12} className="text-blue-400 shrink-0" />}
            {children}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
    );
}

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
    required?: boolean;
    placeholder?: string;
}) {
    const {
        label,
        mobileLabel,
        value,
        field,
        type = "text",
        icon: Icon,
        rows,
        isEditing,
        onInputChange,
        required,
        placeholder,
    } = props;
    const isTextarea = type === "textarea";

    return (
        <div className="space-y-1.5">
            <FieldLabel
                icon={Icon as React.ElementType | undefined}
                required={required}
            >
                {mobileLabel ? (
                    <>
                        <span className="max-[425px]:hidden">{label}</span>
                        <span className="hidden max-[425px]:inline">
                            {mobileLabel}
                        </span>
                    </>
                ) : (
                    label
                )}
            </FieldLabel>
            {isEditing ? (
                isTextarea ? (
                    <Textarea
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        className="resize-none bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
                        rows={rows || 3}
                        placeholder={placeholder || ""}
                        required={Boolean(required)}
                    />
                ) : (
                    <Input
                        type={type}
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        placeholder={placeholder || ""}
                        required={Boolean(required)}
                        className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                )
            ) : (
                <DisplayValue value={value} />
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
            <FieldLabel
                icon={Calendar as React.ElementType}
                required={required}
            >
                {label}
            </FieldLabel>
            {isEditing ? (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
                        >
                            {value ? (
                                value.toLocaleDateString()
                            ) : (
                                <span className="text-muted-foreground font-normal">
                                    Select date
                                </span>
                            )}
                            <ChevronDownIcon className="ml-auto h-4 w-4 text-muted-foreground" />
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
                <DisplayValue
                    value={value ? value.toLocaleDateString() : undefined}
                />
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
            <FieldLabel icon={Icon as React.ElementType | undefined}>
                {label}
            </FieldLabel>
            {isEditing ? (
                <Select
                    value={value}
                    onValueChange={(v) => onInputChange(field, v)}
                >
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
                <DisplayValue value={value} />
            )}
        </div>
    );
}

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
            zip: false,
        },
        {
            key: "Street",
            label: "Street",
            half: true,
            placeholder: "e.g. Rizal St.",
            zip: false,
        },
        {
            key: "Subdivision",
            label: "Subdivision / Village",
            half: false,
            placeholder: "e.g. Deca Homes",
            zip: false,
        },
        {
            key: "Barangay",
            label: "Barangay",
            half: true,
            placeholder: "e.g. Valencia",
            zip: false,
        },
        {
            key: "ZipCode",
            label: "ZIP Code",
            half: true,
            placeholder: "e.g. 6513",
            zip: true,
        },
    ];
    const labelClass =
        "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block";

    const stored = (data[f("Province")] as string) ?? "";
    const [] = stored.includes("|") ? stored.split("|") : ["", stored];

    const locationValue: LocationValue = {
        country: (data[f("Country")] as string) ?? "PH",
        regionCode: (data[f("Region")] as string) ?? "",
        regionName: "",
        province: (data[f("Province")] as string) ?? "",
        provinceName: "",
        city: (data[f("City")] as string) ?? "",
    };

    const handleLocationChange = (val: LocationValue) => {
        onInputChange(f("Country"), val.country);
        onInputChange(f("Region"), val.regionCode);
        onInputChange(f("Province"), val.province);
        onInputChange(f("City"), val.city);
    };

    return (
        <div className={disabled ? "opacity-40 pointer-events-none" : ""}>
            <div className="flex items-center gap-2 mb-3">
                <div className="rounded-md border border-white/10 bg-white/5 p-1 shrink-0">
                    <MapPin className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                    {label}
                </span>
            </div>

            <div className="flex flex-col gap-3">
                {/* Location dropdowns */}
                {isEditing && !disabled ? (
                    <LocationSelect
                        value={locationValue}
                        onChange={handleLocationChange}
                        disabled={disabled}
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Country</label>
                            <DisplayValue
                                value={
                                    Country.getCountryByCode(
                                        data[f("Country")] as string,
                                    )?.name ??
                                    (data[f("Country")] as string) ??
                                    undefined
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Region</label>
                            <DisplayValue
                                value={
                                    (regions as any[]).find(
                                        (r) => r.code === data[f("Region")],
                                    )?.name ??
                                    (data[f("Region")] as string) ??
                                    undefined
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Province</label>
                            <DisplayValue
                                value={
                                    (provinces as any[]).find(
                                        (p) => p.code === data[f("Province")],
                                    )?.name ??
                                    (data[f("Province")] as string) ??
                                    undefined
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>
                                City / Municipality
                            </label>
                            <DisplayValue
                                value={(data[f("City")] as string) || undefined}
                            />
                        </div>
                    </div>
                )}

                {/* Manual fields */}
                <div className="grid grid-cols-2 max-[480px]:grid-cols-1 gap-3 items-end">
                    {fields.map((field) => (
                        <div
                            key={field.key}
                            className={`space-y-1.5 ${!field.half ? "col-span-2 max-[480px]:col-span-1" : ""}`}
                        >
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                {field.label}
                            </label>
                            {isEditing && !disabled ? (
                                <Input
                                    value={(data[f(field.key)] as string) ?? ""}
                                    onChange={(e) => {
                                        const isZip = field.zip;
                                        const isPH =
                                            (data[f("Country")] as string) ===
                                            "PH";
                                        const val = isZip
                                            ? isPH
                                                ? e.target.value
                                                      .replace(/\D/g, "")
                                                      .slice(0, 4)
                                                : e.target.value.slice(0, 10)
                                            : e.target.value;
                                        onInputChange(f(field.key), val);
                                    }}
                                    inputMode={
                                        field.zip &&
                                        (data[f("Country")] as string) === "PH"
                                            ? "numeric"
                                            : "text"
                                    }
                                    className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
                                />
                            ) : (
                                <DisplayValue
                                    value={
                                        (data[f(field.key)] as string) ||
                                        undefined
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Constants ──────────────────────────────────────────────────────────────────

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

// ── PersonalInfoForm ───────────────────────────────────────────────────────────

function PersonalInfoForm({
    data,
    isEditing,
    onInputChange,
    onDateChange,
}: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onDateChange: (field: keyof ProfileState, date: Date | undefined) => void;
}) {
    const isDualCitizen = data.citizenship === "Dual Citizenship";
    const inputCls =
        "bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20";

    const handleSameAsResidential = (checked: boolean) => {
        onInputChange(
            "sameAsResidential" as keyof ProfileState,
            String(checked),
        );
        if (checked) {
            onInputChange("permanentCountry", data.residentialCountry ?? "");
            onInputChange("permanentRegion", data.residentialRegion ?? "");
            onInputChange("permanentProvince", data.residentialProvince ?? "");
            onInputChange("permanentCity", data.residentialCity);
            onInputChange("permanentHouseNo", data.residentialHouseNo);
            onInputChange("permanentStreet", data.residentialStreet);
            onInputChange("permanentSubdivision", data.residentialSubdivision);
            onInputChange("permanentBarangay", data.residentialBarangay);
            onInputChange("permanentZipCode", data.residentialZipCode);
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Name ── */}
            <div className="space-y-4">
                {/* First Name — NameInput handles proper-case on blur */}
                <div className="space-y-1.5">
                    <FieldLabel icon={User as React.ElementType} required>
                        First Name
                    </FieldLabel>
                    {isEditing ? (
                        <NameInput
                            value={data.firstName}
                            onChange={(v) => onInputChange("firstName", v)}
                            placeholder="First name"
                            className={inputCls}
                        />
                    ) : (
                        <DisplayValue value={data.firstName} />
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {/* Middle Initial — MiddleInitialInput handles letter + dot */}
                    <div className="space-y-1.5">
                        <FieldLabel>
                            <span className="hidden md:inline">
                                Middle Initial
                            </span>
                            <span className="inline md:hidden">M.I.</span>
                        </FieldLabel>
                        {isEditing ? (
                            <MiddleInitialInput
                                value={data.middleInitial}
                                onChange={(v) =>
                                    onInputChange("middleInitial", v)
                                }
                                placeholder="Optional"
                                className={inputCls}
                            />
                        ) : (
                            <DisplayValue value={data.middleInitial} />
                        )}
                    </div>

                    {/* Last Name — NameInput handles proper-case on blur */}
                    <div className="col-span-2 space-y-1.5">
                        <FieldLabel required>Last Name</FieldLabel>
                        {isEditing ? (
                            <NameInput
                                value={data.lastName}
                                onChange={(v) => onInputChange("lastName", v)}
                                placeholder="Last name"
                                className={inputCls}
                            />
                        ) : (
                            <DisplayValue value={data.lastName} />
                        )}
                    </div>
                </div>

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

            <SectionDivider label="Personal Details" />

            {/* ── Age / Gender / DOB / Civil Status ── */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <FieldLabel>Age</FieldLabel>
                        <DisplayValue value={data.age} />
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel>Gender</FieldLabel>
                        {isEditing ? (
                            <Select
                                value={data.gender}
                                onValueChange={(v) =>
                                    onInputChange("gender", v)
                                }
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">
                                        Female
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <DisplayValue value={data.gender} />
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
                <InputField
                    label="Place of Birth"
                    value={data.placeOfBirth ?? ""}
                    field="placeOfBirth"
                    icon={MapPin}
                    isEditing={isEditing}
                    onInputChange={onInputChange}
                    placeholder="e.g. Ormoc City, Leyte"
                />
                <div className="space-y-1.5">
                    <FieldLabel>Civil Status</FieldLabel>
                    {isEditing ? (
                        <Select
                            value={data.civilStatus}
                            onValueChange={(v) =>
                                onInputChange("civilStatus", v)
                            }
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Widowed">Widowed</SelectItem>
                                <SelectItem value="Separated">
                                    Separated
                                </SelectItem>
                                <SelectItem value="Divorced">
                                    Divorced
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <DisplayValue value={data.civilStatus} />
                    )}
                </div>
            </div>

            <SectionDivider label="Physical Information" />

            {/* ── Physical ── */}
            <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <FieldLabel icon={Ruler as React.ElementType}>
                            Height (m)
                        </FieldLabel>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={data.height ?? ""}
                                onChange={(e) =>
                                    onInputChange("height", e.target.value)
                                }
                                placeholder="e.g. 1.65"
                                className={inputCls}
                            />
                        ) : (
                            <DisplayValue value={data.height} />
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel icon={Weight as React.ElementType}>
                            Weight (kg)
                        </FieldLabel>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={data.weight ?? ""}
                                onChange={(e) =>
                                    onInputChange("weight", e.target.value)
                                }
                                placeholder="e.g. 62.5"
                                className={inputCls}
                            />
                        ) : (
                            <DisplayValue value={data.weight} />
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel icon={Droplets as React.ElementType}>
                            Blood Type
                        </FieldLabel>
                        {isEditing ? (
                            <Select
                                value={data.bloodType ?? ""}
                                onValueChange={(v) =>
                                    onInputChange("bloodType", v)
                                }
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BLOOD_TYPES.map((v) => (
                                        <SelectItem key={v} value={v}>
                                            {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <DisplayValue value={data.bloodType} />
                        )}
                    </div>
                </div>
            </div>

            <SectionDivider label="Nationality & Identity" />

            {/* ── Nationality / Religion / Citizenship ── */}
            <div className="flex flex-col sm:gap-4 space-y-4 sm:space-y-0">
                <div className="space-y-1.5">
                    <FieldLabel>Nationality</FieldLabel>
                    {isEditing ? (
                        <Combobox
                            label="Nationality"
                            options={nationalities}
                            onChangeValue={(v: string) =>
                                onInputChange("nationality", v)
                            }
                        />
                    ) : (
                        <DisplayValue value={data.nationality} />
                    )}
                </div>
                <div className="space-y-1.5">
                    <FieldLabel>Religion</FieldLabel>
                    {isEditing ? (
                        <Combobox
                            label="Religion"
                            options={religions}
                            onChangeValue={(v: string) =>
                                onInputChange("religion", v)
                            }
                        />
                    ) : (
                        <DisplayValue value={data.religion} />
                    )}
                </div>
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
                    <div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-blue-500/30">
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

            <SectionDivider label="Address" />

            {/* ── Addresses ── */}
            <div className="flex flex-col gap-4 space-y-4">
                <AddressBlock
                    prefix="residential"
                    label="Residential Address"
                    data={data}
                    isEditing={isEditing}
                    onInputChange={onInputChange}
                />
                <div className="flex flex-col gap-4">
                    {isEditing && (
                        <div className="flex items-center gap-2 py-1 px-3 rounded-md bg-white/4 border border-white/8">
                            <Checkbox
                                id="sameAsResidential"
                                checked={data.sameAsResidential ?? false}
                                onCheckedChange={(checked) =>
                                    handleSameAsResidential(Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="sameAsResidential"
                                className="text-sm cursor-pointer flex items-center gap-1.5 text-muted-foreground"
                            >
                                <Copy size={12} className="text-blue-400" />
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
            {/* ── Read-only Card ── */}
            <div className="border border-border/60 shadow-lg w-full overflow-hidden rounded-xl bg-card">
                <div className="relative px-6 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <User className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-base font-semibold text-foreground">
                                Personal Information
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

                <div className="space-y-6 w-full px-6 py-5">
                    <PersonalInfoForm
                        data={data}
                        isEditing={false}
                        onInputChange={onInputChange}
                        onDateChange={onDateChange}
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
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                        <div className="relative flex items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5">
                                <User className="h-4 w-4 text-blue-400" />
                            </div>
                            <SheetTitle className="text-sm font-medium text-muted-foreground">
                                Edit Personal Information
                            </SheetTitle>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <PersonalInfoForm
                            data={data}
                            isEditing={true}
                            onInputChange={onInputChange}
                            onDateChange={onDateChange}
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
