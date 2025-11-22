"use client";

import React, { useState } from "react";
import {
    Camera,
    Edit2,
    Save,
    X,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    FileText,
    Shield,
    Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { Combobox } from "@/components/combobox";

interface InputFieldProps {
    label: string;
    value: string;
    field: string;
    type?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    rows?: number;
    isEditing: boolean;
    onInputChange: (field: string, value: string) => void;
    required?: boolean;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    field,
    type = "text",
    icon: Icon,
    rows,
    isEditing,
    onInputChange,
    required = false,
    placeholder = "",
}) => {
    const isTextarea = type === "textarea";
    console.log(value);

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                {Icon && <Icon size={14} className="text-blue-600" />}
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
                isTextarea ? (
                    <Textarea
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        className="resize-none"
                        rows={rows || 3}
                        placeholder={placeholder}
                        required={required}
                    />
                ) : (
                    <Input
                        type={type}
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        placeholder={placeholder}
                        required={required}
                    />
                )
            ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value || "—"}
                </div>
            )}
        </div>
    );
};

interface DatePickerFieldProps {
    label: string;
    value: Date | undefined;
    field: string;
    isEditing: boolean;
    onDateChange: (field: string, date: Date | undefined) => void;
    required?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
    label,
    value,
    field,
    isEditing,
    onDateChange,
    required = false,
}) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={14} className="text-blue-600" />
                {label}
                {required && <span className="text-red-500">*</span>}
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
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value ? value.toLocaleDateString() : "—"}
                </div>
            )}
        </div>
    );
};

export default function TeacherProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [profileData, setProfileData] = useState({
        // Personal Information
        name: "Hu Tao",
        age: "20",
        gender: "Female",
        dateOfBirth: undefined as Date | undefined,
        civilStatus: "Single",
        nationality: "Liyuean",
        religion: "Archon",

        // Contact Information
        contactNumber: "+63 912 345 6789",
        address: "Wangsheng Funeral Parlor, Liyue",
        email: "BooTao@gmail.com",

        // Employment Information
        employeeId: "EMP-2020-001234",
        position: "77th Director of the Wangsheng Funeral Parlor",
        plantillaNo: "DECS-ITEM-2020-0456",

        // Government IDs
        pagibigNo: "1234-5678-9012",
        philHealthNo: "12-345678901-2",
        gsisNo: "1234567890123",
        tinNo: "123-456-789-000",

        // Appointment Dates
        dateOfOriginalAppointment: undefined as Date | undefined,
        dateOfLatestAppointment: undefined as Date | undefined,

        // Educational Background
        subjectSpecialization: "Philosophy and Ethics",
        bachelorsDegree: "Funeral Rites Coordinator",
        postGraduate: "Special Consultant",
    });

    const [tempProfileData, setTempProfileData] = useState(profileData);

    const handleInputChange = (field: string, value: string) => {
        setTempProfileData({ ...tempProfileData, [field]: value });
    };

    const handleDateChange = (field: string, date: Date | undefined) => {
        setTempProfileData({ ...tempProfileData, [field]: date });
    };

    const handleSave = () => {
        setIsEditing(false);
        setProfileData(tempProfileData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempProfileData(profileData);
    };

    const previewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const calculateServiceYears = (dateValue: Date | undefined) => {
        if (!dateValue) return "—";
        const originalDate = new Date(dateValue);
        const today = new Date();
        let years = today.getFullYear() - originalDate.getFullYear();
        let months = today.getMonth() - originalDate.getMonth();
        const days = today.getDate() - originalDate.getDate();

        if (days < 0) {
            months--;
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years}y ${months}m`;
    };

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

    return (
        <div className="min-h-screen bg-gray-50 space-y-6 dark:bg-gray-950">
            {/* ---------- Header Card ---------- */}
            <Card className="border-0 rounded-none shadow-lg p-0">
                <img src="/banner.png" alt="banner" className="w-full h-65" />

                <CardContent className="px-10 py-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center -mt-16">
                        {/* Profile Picture */}
                        <div className="flex flex-row w-full gap-8 relative">
                            {/* Profile and Camera */}
                            <div className="relative">
                                <div className="w-32 h-32 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
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
                                            onChange={previewImage}
                                            className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                                        />
                                        <button className="absolute sm:-bottom-5 md:bottom-5 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg shadow-lg transition">
                                            <Camera
                                                size={16}
                                                className="text-white"
                                            />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Camera Button */}

                            {isEditing && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={previewImage}
                                        className="absolute inset-0 opacity-0 cursor-pointer rounded-xl"
                                    />
                                </>
                            )}
                            {/* Name and Basic Info */}
                            <div className="flex flex-col justify-center overflow-hidden">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap text-ellipsis overflow-hidden">
                                    {tempProfileData.name}
                                </h2>
                                <p className="text-blue-600 font-semibold whitespace-nowrap text-ellipsis overflow-hidden">
                                    {tempProfileData.position}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-nowrap text-ellipsis overflow-hidden">
                                    Employee ID: {tempProfileData.employeeId}
                                </p>
                            </div>
                        </div>
                        {/* Edit/Save Buttons */}
                        <div className="flex gap-2 flex-wrap md:flex-nowrap">
                            {isEditing ? (
                                <>
                                    <Button
                                        onClick={handleSave}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <Save size={18} />
                                        Save
                                    </Button>
                                    <Button
                                        onClick={handleCancel}
                                        variant="secondary"
                                        className="gap-2"
                                    >
                                        <X size={18} />
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="gap-2"
                                >
                                    <Edit2 size={18} />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ---------- Main Content Grid ---------- */}
            <div className="flex flex-row justify-center gap-6 p-4">
                {/* Left Column - Personal & Contact */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="text-blue-600" size={20} />
                            <CardTitle>Personal Information</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <InputField
                                label="Full Name"
                                value={tempProfileData.name}
                                field="name"
                                icon={User}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                                required
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField
                                    label="Age"
                                    value={tempProfileData.age}
                                    field="age"
                                    type="number"
                                    isEditing={isEditing}
                                    onInputChange={handleInputChange}
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        Gender
                                    </label>
                                    {isEditing ? (
                                        <Select
                                            value={tempProfileData.gender}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "gender",
                                                    value
                                                )
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
                                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm font-medium">
                                            {tempProfileData.gender}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DatePickerField
                                label="Date of Birth"
                                value={tempProfileData.dateOfBirth}
                                field="dateOfBirth"
                                isEditing={isEditing}
                                onDateChange={handleDateChange}
                            />
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Civil Status
                                </label>
                                {isEditing ? (
                                    <Select
                                        value={tempProfileData.civilStatus}
                                        onValueChange={(value) =>
                                            handleInputChange(
                                                "civilStatus",
                                                value
                                            )
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
                                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm font-medium">
                                        {tempProfileData.civilStatus}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Nationality
                                </label>
                                <Combobox
                                    label="Nationality"
                                    options={nationalities}
                                    onChangeValue={(value) =>
                                        handleInputChange("nationality", value)
                                    }
                                />
                            </div>
                            <InputField
                                label="Religion"
                                value={tempProfileData.religion}
                                field="religion"
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                            />
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800"></div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Phone className="text-blue-600" size={20} />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Contact Information
                                </h3>
                            </div>

                            <InputField
                                label="Contact Number"
                                value={tempProfileData.contactNumber}
                                field="contactNumber"
                                type="tel"
                                icon={Phone}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                            />
                            <InputField
                                label="Email Address"
                                value={tempProfileData.email}
                                field="email"
                                type="email"
                                icon={Mail}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="Address"
                                value={tempProfileData.address}
                                field="address"
                                type="textarea"
                                icon={MapPin}
                                rows={3}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ---------- Right Columns ---------- */}
                {/* Employment Information */}
                <div className="flex flex-col gap-4">
                    <Card className="flex flex-col border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Briefcase
                                    className="text-blue-600"
                                    size={20}
                                />
                                <CardTitle>Employment Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Employee ID"
                                    value={tempProfileData.employeeId}
                                    field="employeeId"
                                    icon={FileText}
                                    isEditing={isEditing}
                                    onInputChange={handleInputChange}
                                    required
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                        <Briefcase
                                            size={14}
                                            className="text-blue-600"
                                        />
                                        Position/Designation
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {isEditing ? (
                                        <Select
                                            value={tempProfileData.position}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "position",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Teacher I">
                                                    Teacher I
                                                </SelectItem>
                                                <SelectItem value="Teacher II">
                                                    Teacher II
                                                </SelectItem>
                                                <SelectItem value="Teacher III">
                                                    Teacher III
                                                </SelectItem>
                                                <SelectItem value="Master Teacher I">
                                                    Master Teacher I
                                                </SelectItem>
                                                <SelectItem value="Master Teacher II">
                                                    Master Teacher II
                                                </SelectItem>
                                                <SelectItem value="Master Teacher III">
                                                    Master Teacher III
                                                </SelectItem>
                                                <SelectItem value="Principal">
                                                    Principal
                                                </SelectItem>
                                                <SelectItem value="Administrative Staff">
                                                    Administrative Staff
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm font-medium">
                                            {tempProfileData.position}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <InputField
                                label="Plantilla No."
                                value={tempProfileData.plantillaNo}
                                field="plantillaNo"
                                icon={FileText}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                                placeholder="(optional)"
                            />

                            <div className="border-t border-gray-200 dark:border-gray-800"></div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <Calendar
                                        size={16}
                                        className="text-blue-600"
                                    />
                                    Appointment History
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DatePickerField
                                        label="Date of Original Appointment"
                                        value={
                                            tempProfileData.dateOfOriginalAppointment
                                        }
                                        field="dateOfOriginalAppointment"
                                        isEditing={isEditing}
                                        onDateChange={handleDateChange}
                                    />
                                    <DatePickerField
                                        label="Date of Latest Appointment"
                                        value={
                                            tempProfileData.dateOfLatestAppointment
                                        }
                                        field="dateOfLatestAppointment"
                                        isEditing={isEditing}
                                        onDateChange={handleDateChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Government IDs */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="text-blue-600" size={20} />
                                <CardTitle>Government IDs & Numbers</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="PAG-IBIG No."
                                    value={tempProfileData.pagibigNo}
                                    field="pagibigNo"
                                    icon={Shield}
                                    isEditing={isEditing}
                                    onInputChange={handleInputChange}
                                    placeholder="(optional)"
                                />
                                <InputField
                                    label="PhilHealth No."
                                    value={tempProfileData.philHealthNo}
                                    field="philHealthNo"
                                    icon={Shield}
                                    isEditing={isEditing}
                                    onInputChange={handleInputChange}
                                    placeholder="(optional)"
                                />
                                <InputField
                                    label="GSIS No."
                                    value={tempProfileData.gsisNo}
                                    field="gsisNo"
                                    icon={Shield}
                                    isEditing={isEditing}
                                    onInputChange={handleInputChange}
                                    placeholder="(optional)"
                                />
                                <InputField
                                    label="TIN No."
                                    value={tempProfileData.tinNo}
                                    field="tinNo"
                                    icon={Shield}
                                    isEditing={isEditing}
                                    onInputChange={handleInputChange}
                                    placeholder="(optional)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Educational Background */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Book className="text-blue-600" size={20} />
                                <CardTitle>Educational Background</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputField
                                label="Subject Specialization"
                                value={tempProfileData.subjectSpecialization}
                                field="subjectSpecialization"
                                icon={Book}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                            />
                            <InputField
                                label="Bachelor's Degree"
                                value={tempProfileData.bachelorsDegree}
                                field="bachelorsDegree"
                                icon={Book}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="Post Graduate"
                                value={tempProfileData.postGraduate}
                                field="postGraduate"
                                icon={Book}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                                placeholder="(optional)"
                            />
                        </CardContent>
                    </Card>

                    {/* Service Record */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Service Record (Current School)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                                    <p className="text-sm text-blue-100 mb-2">
                                        Years at This School
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {calculateServiceYears(
                                            tempProfileData.dateOfOriginalAppointment
                                        )}
                                    </p>
                                    <p className="text-xs text-blue-200 mt-2">
                                        Since joining this school
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                                    <p className="text-sm text-blue-100 mb-2">
                                        Years in Current Position
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {calculateServiceYears(
                                            tempProfileData.dateOfLatestAppointment
                                        )}
                                    </p>
                                    <p className="text-xs text-blue-200 mt-2">
                                        Since latest appointment
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur rounded-lg p-3 text-sm">
                                <p className="text-blue-100">
                                    <span className="font-semibold">Note:</span>{" "}
                                    Date of original appointment marks when the
                                    teacher joined this school. Latest
                                    appointment updates when promoted within the
                                    school.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
