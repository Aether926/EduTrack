"use client";

import ProfileHeader from "@/components/profile-header";
import {
    calculateAge,
    cleanNameInput,
    formatName,
    cleanMiddleInitial,
} from "@/app/util/helper";
import { userTrainingSeminar as activityItems } from "@/components/tables/trainings-seminars";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    FileText,
    Shield,
    Book,
    ChevronDownIcon,
} from "lucide-react";

import { Combobox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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

interface InputFieldProps {
    label: string;
    value: string;
    field: string;
    type?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    rows?: number;
    isEditing: boolean;
    onInputChange: (field: string, value: string) => void;
    onBlur?: (field: string) => void;
    required?: boolean;
    placeholder?: string;
}

interface DatePickerFieldProps {
    label: string;
    value: Date | undefined;
    field: string;
    isEditing: boolean;
    onDateChange: (field: string, date: Date | undefined) => void;
    required?: boolean;
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
    onBlur,
    required = false,
    placeholder = "",
}) => {
    const isTextarea = type === "textarea";

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
                        onBlur={() => onBlur?.(field)}
                        placeholder={placeholder}
                        required={required}
                    />
                )
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value || "—"}
                </div>
            )}
        </div>
    );
};

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
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value ? value.toLocaleDateString() : "—"}
                </div>
            )}
        </div>
    );
};

// --- TeacherProfile Component ---
export default function TeacherProfile() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleRemoveActivity = (item: ActivityItem) => {
        setActivities((prev) =>
            prev.filter(
                (a) => !(a.type === item.type && a.title === item.title)
            )
        );
    };

    // Initial State structure
    const initialProfileState = {
        firstName: "",
        middleInitial: "",
        lastName: "",
        username: "",
        age: "",
        gender: "Other",
        dateOfBirth: undefined as Date | undefined,
        civilStatus: "Single",
        nationality: "Filipino",
        religion: "Roman Catholic",
        contactNumber: "",
        address: "",
        email: "",
        employeeId: "",
        position: "Teacher I",
        plantillaNo: "",
        pagibigNo: "",
        philHealthNo: "",
        gsisNo: "",
        tinNo: "",
        dateOfOriginalAppointment: undefined as Date | undefined,
        dateOfLatestAppointment: undefined as Date | undefined,
        subjectSpecialization: "",
        bachelorsDegree: "",
        postGraduate: "",
    };

    type ActivityItem = {
        type: string;
        title: string;
        level: string;
        startDate: string;
        endDate: string;
        totalHours: string;
        sponsor: string;
    };

    const availableActivities: ActivityItem[] = [
        {
            type: "Training",
            title: "School Titling",
            level: "Division",
            startDate: "2025-12-3",
            endDate: "2025-12-5",
            totalHours: "24",
            sponsor: "DepEd",
        },
    ];

    const [activities, setActivities] = useState<ActivityItem[]>([]);

    const handleAddActivity = (item: ActivityItem) => {
        setActivities((prev) => {
            const exists = prev.some(
                (a) => a.type === item.type && a.title === item.title
            );
            if (exists) return prev;
            return [...prev, item];
        });
    };

    const [profileData, setProfileData] = useState(initialProfileState);
    const [tempProfileData, setTempProfileData] = useState(initialProfileState);

    // --- EFFECT: Initialization and User Fetch ---
    React.useEffect(() => {
        setMounted(true);

        const fetchUserAndProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);

            if (user?.id) {
                let fetchedProfileData = null;

                // 1. Fetch existing profile data
                const { data: profileData, error } = await supabase
                    .from("Profile")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (profileData && !error) {
                    // Profile exists: Convert date strings back to Date objects
                    fetchedProfileData = {
                        ...profileData,
                        dateOfBirth: profileData.dateOfBirth
                            ? new Date(profileData.dateOfBirth)
                            : undefined,
                        dateOfOriginalAppointment:
                            profileData.dateOfOriginalAppointment
                                ? new Date(
                                      profileData.dateOfOriginalAppointment
                                  )
                                : undefined,
                        dateOfLatestAppointment:
                            profileData.dateOfLatestAppointment
                                ? new Date(profileData.dateOfLatestAppointment)
                                : undefined,
                    };
                } else {
                    // Profile does not exist: Use initial state
                    // Use a blank profile but include the user ID and Email
                    fetchedProfileData = { ...initialProfileState };
                }

                // 2. CRITICAL: Inject the live session data (ID and Email)
                const combinedData = {
                    ...fetchedProfileData,
                    id: user.id,
                    email: user.email || fetchedProfileData.email || "", // <--- INJECTS THE AUTH EMAIL
                };

                // 3. Set the state
                setProfileData(combinedData);
                setTempProfileData(combinedData);
            }
        };

        fetchUserAndProfile();
    }, []);

    // ---------- Handlers ----------
    const handleInputChange = (field: string, value: string) => {
        setTempProfileData({ ...tempProfileData, [field]: value });
    };

    const handleDateChange = (field: string, date: Date | undefined) => {
        const updatedData = { ...tempProfileData, [field]: date };

        // Automatically calculate and update the age if DoB is changed
        if (field === "dateOfBirth") {
            updatedData.age = calculateAge(date);
        }

        setTempProfileData(updatedData);
    };

    const previewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    // ---------- Async Save Function ----------
    const handleSave = async () => {
        if (isSaving) return;

        setIsSaving(true);
        console.log("Attempting to save profile data to Supabase...");

        try {
            // Get fresh user session
            const {
                data: { user: currentUser },
                error: authError,
            } = await supabase.auth.getUser();

            if (!currentUser || authError) {
                // replace with appropriate error handling
                alert(
                    "You must be logged in to save your profile. Please log in again."
                );
                setIsSaving(false);
                return;
            }

            // Extract dates and prepare data
            const {
                dateOfBirth,
                dateOfOriginalAppointment,
                dateOfLatestAppointment,
                ...restOfData
            } = tempProfileData;

            const dataToUpdate = {
                ...restOfData,
                dateOfBirth: dateOfBirth
                    ? dateOfBirth.toISOString().split("T")[0]
                    : null,
                dateOfOriginalAppointment: dateOfOriginalAppointment
                    ? dateOfOriginalAppointment.toISOString().split("T")[0]
                    : null,
                dateOfLatestAppointment: dateOfLatestAppointment
                    ? dateOfLatestAppointment.toISOString().split("T")[0]
                    : null,
                id: currentUser.id, // Link to authenticated user
            };

            console.log("Data being saved:", dataToUpdate);

            const { data, error } = await supabase
                .from("Profile")
                .upsert(dataToUpdate)
                .select();

            if (error) {
                // add error hadler message here
                // temporary console error
                console.error("Supabase Save Error:", error);
                alert(`Failed to save profile: ${error.message}`);
            } else {
                console.log("Profile saved successfully:", data);
                setProfileData(tempProfileData);
                setIsEditing(false);
                // add proper success message here
                alert("Changes saved successfully!");
            }
        } catch (e) {
            // add error hadler message here
            // temporary console error
            console.error("Unexpected Save Error:", e);
            alert("An unexpected error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempProfileData(profileData);
    };

    // ---------- Utility Functions ----------
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

    const religion = [
        { value: "roman catholic", label: "Roman Catholic" },
        { value: "islam", label: "Islam" },
        { value: "evangelical", label: "Evangelical" },
        { value: "protestant", label: "Protestant" },
        { value: "iglesia ni Cristo", label: "Iglesia ni Cristo" },
        { value: "seventh-day Adventist", label: "Seventh-day Adventist" },
    ];

    const calculateServiceYears = (dateValue: Date | undefined) => {
        if (!dateValue) return "—";

        const originalDate = new Date(dateValue);
        const today = new Date();

        if (originalDate > today) {
            return "Invalid date";
        }

        let years = today.getFullYear() - originalDate.getFullYear();
        let months = today.getMonth() - originalDate.getMonth();
        let days = today.getDate() - originalDate.getDate();

        if (days < 0) {
            months--;
            const lastDayOfPrevMonth = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            ).getDate();
            days += lastDayOfPrevMonth;
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years}y ${months}m ${days}d`;
    };

    if (!mounted) return null;

    const bgClass = theme === "light" ? "bg-gray-100" : "bg-gray-950";

    return (
        <div className={`min-h-screen ${bgClass} space-y-6`}>
            <ProfileHeader
                preview={preview}
                isEditing={isEditing}
                tempProfileData={tempProfileData}
                onImageChange={previewImage}
                onSave={handleSave}
                onCancel={handleCancel}
                onEdit={() => setIsEditing(true)}
            />

            <div className="flex flex-col md:flex-row justify-center gap-6 p-4">
                <Card className="border-0 shadow-lg w-full xl:max-w-[500px]">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="text-blue-600" size={20} />
                            <CardTitle>Personal Information</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 w-full">
                        <div className="space-y-4">
                            <InputField
                                label="First Name"
                                value={tempProfileData.firstName}
                                field="firstName"
                                icon={User}
                                isEditing={isEditing}
                                onInputChange={handleInputChange}
                                onBlur={(field) => {
                                    if (field === "firstName") {
                                        setTempProfileData({
                                            ...tempProfileData,
                                            firstName: formatName(
                                                tempProfileData.firstName
                                            ),
                                        });
                                    }
                                }}
                                required
                            />
                            <div className="grid grid-cols-3 gap-3">
                                <InputField
                                    label="Middle Initial"
                                    value={tempProfileData.middleInitial}
                                    field="middleInitial"
                                    isEditing={isEditing}
                                    onInputChange={(field, value) => {
                                        setTempProfileData({
                                            ...tempProfileData,
                                            middleInitial:
                                                cleanMiddleInitial(value),
                                        });
                                    }}
                                    placeholder="Optional"
                                />
                                <div className="col-span-2">
                                    <InputField
                                        label="Last Name"
                                        value={tempProfileData.lastName}
                                        field="lastName"
                                        isEditing={isEditing}
                                        onInputChange={handleInputChange}
                                        onBlur={(field) => {
                                            if (field === "lastName") {
                                                setTempProfileData({
                                                    ...tempProfileData,
                                                    lastName: formatName(
                                                        tempProfileData.lastName
                                                    ),
                                                });
                                            }
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        Age
                                    </label>
                                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                        {tempProfileData.age || "—"}
                                    </div>
                                </div>
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
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
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
                            <div className="flex flex-col space-y-1.5">
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
                                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                        {tempProfileData.civilStatus}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Nationality
                                </label>
                                {isEditing ? (
                                    <Combobox
                                        label="Nationality"
                                        options={nationalities}
                                        onChangeValue={(value: string) =>
                                            handleInputChange(
                                                "nationality",
                                                value
                                            )
                                        }
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                        {tempProfileData.nationality}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Religion
                                </label>
                                {isEditing ? (
                                    <Combobox
                                        label="Religion"
                                        options={religion}
                                        onChangeValue={(value: string) =>
                                            handleInputChange("religion", value)
                                        }
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                        {tempProfileData.religion}
                                    </div>
                                )}
                            </div>
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
                                isEditing={false}
                                required
                                onInputChange={() => {}}
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
                        <div className="border-t border-gray-200 dark:border-gray-800"></div>
                    </CardContent>

                    <div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-lg font-semibold">
                                Activities
                            </CardTitle>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        Add Activity
                                    </Button>
                                </DialogTrigger>

                                {/* FIXED: Wider dialog with horizontal scroll */}
                                <DialogContent className="max-w-6xl max-h-[85vh] p-0 gap-0">
                                    <DialogHeader className="px-6 py-4 border-b">
                                        <DialogTitle className="text-xl">
                                            Select activity to add
                                        </DialogTitle>
                                    </DialogHeader>

                                    {/* Scrollable content area */}
                                    <div className="overflow-auto px-6 py-4">
                                        <div className="rounded-md border min-w-[900px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[100px]">
                                                            Type
                                                        </TableHead>
                                                        <TableHead className="w-[180px]">
                                                            Title
                                                        </TableHead>
                                                        <TableHead className="text-center w-[100px]">
                                                            Level
                                                        </TableHead>
                                                        <TableHead className="text-center w-[120px]">
                                                            Start Date
                                                        </TableHead>
                                                        <TableHead className="text-center w-[120px]">
                                                            End Date
                                                        </TableHead>
                                                        <TableHead className="text-center w-[100px]">
                                                            Total Hours
                                                        </TableHead>
                                                        <TableHead className="w-[180px]">
                                                            Sponsoring Agency
                                                        </TableHead>
                                                        <TableHead className="text-right w-[100px]">
                                                            Actions
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {availableActivities.length ===
                                                    0 ? (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={8}
                                                                className="py-8 text-center text-sm text-muted-foreground"
                                                            >
                                                                No activities
                                                                available to
                                                                add.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        availableActivities.map(
                                                            (item, index) => {
                                                                const isAdded =
                                                                    activities.some(
                                                                        (a) =>
                                                                            a.type ===
                                                                                item.type &&
                                                                            a.title ===
                                                                                item.title
                                                                    );

                                                                return (
                                                                    <TableRow
                                                                        key={`${item.type}-${item.title}-${index}`}
                                                                    >
                                                                        <TableCell className="font-medium">
                                                                            {
                                                                                item.type
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-center">
                                                                            {
                                                                                item.level
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-center">
                                                                            {
                                                                                item.startDate
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-center">
                                                                            {
                                                                                item.endDate
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-center">
                                                                            {
                                                                                item.totalHours
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {
                                                                                item.sponsor
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <Button
                                                                                size="sm"
                                                                                variant={
                                                                                    isAdded
                                                                                        ? "secondary"
                                                                                        : "default"
                                                                                }
                                                                                onClick={() =>
                                                                                    handleAddActivity(
                                                                                        item
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isAdded
                                                                                }
                                                                                className="min-w-[70px]"
                                                                            >
                                                                                {isAdded
                                                                                    ? "Added"
                                                                                    : "Add"}
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            }
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Footer with close button */}
                                    <div className="px-6 py-4 border-t bg-muted/50 flex justify-end">
                                        <Button
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>

                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-left text-xs uppercase tracking-wide">
                                                Type
                                            </TableHead>
                                            <TableHead className="text-left text-xs uppercase tracking-wide">
                                                Title
                                            </TableHead>
                                            <TableHead className="text-center text-xs uppercase tracking-wide w-[100px]">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activities.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="py-8 text-center text-sm text-muted-foreground"
                                                >
                                                    No activities added yet.
                                                    Click "Add Activity" to get
                                                    started.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            activities.map((item, index) => (
                                                <TableRow
                                                    key={`summary-${item.type}-${item.title}-${index}`}
                                                >
                                                    <TableCell className="py-3 text-sm font-medium">
                                                        {item.type}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-sm">
                                                        {item.title}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleRemoveActivity(
                                                                    item
                                                                )
                                                            }
                                                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </div>
                </Card>

                {/* ---------- Right Block ---------- */}
                <div className="flex flex-col gap-4 w-full xl:max-w-[700px]">
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium break-words">
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                    <Card className="flex-col border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="text-blue-600" size={20} />
                                <CardTitle>Government IDs & Numbers</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                    <Card className="flex-col border-0 shadow-lg">
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

                    <Card className="flex-col border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Service Record (Current School)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col justify-between bg-white/10 backdrop-blur rounded-lg p-4">
                                    <p className="text-sm text-blue-100 mb-2">
                                        Years at This School
                                    </p>
                                    <div>
                                        <p className="text-3xl font-bold">
                                            {calculateServiceYears(
                                                tempProfileData.dateOfOriginalAppointment
                                            )}
                                        </p>
                                        <p className="text-xs text-blue-200 mt-2">
                                            Since joining this school
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between bg-white/10 backdrop-blur rounded-lg p-4">
                                    <p className="text-sm text-blue-100 mb-2">
                                        Years in Current Position
                                    </p>
                                    <div>
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
