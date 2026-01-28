"use client";

// --- Imports ---
import ProfileHeader from "@/components/profile-header";


import React, { useState } from "react";
import { useTheme } from "next-themes";
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
    Loader2, 
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
import { supabase } from "@/lib/supabaseClient"; 
import { User as SupabaseUser } from '@supabase/supabase-js'; 
import { toast } from "sonner";

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

    // Initial State structure 
    const initialProfileState = {
        firstName: "",
        middleInitial: "",
        lastName: "",
        username: "",
        age: "",
        gender: "Male",
        dateOfBirth: undefined as Date | undefined,
        civilStatus: "Single",
        nationality: "filipino",
        religion: "",
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

    const [profileData, setProfileData] = useState(initialProfileState);
    const [tempProfileData, setTempProfileData] = useState(initialProfileState);

    // --- EFFECT: Initialization and User Fetch ---
   React.useEffect(() => {
    setMounted(true);

    const fetchUserAndProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
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
                    dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
                    dateOfOriginalAppointment: profileData.dateOfOriginalAppointment ? new Date(profileData.dateOfOriginalAppointment) : undefined,
                    dateOfLatestAppointment: profileData.dateOfLatestAppointment ? new Date(profileData.dateOfLatestAppointment) : undefined,
                };
            } else {
                
                fetchedProfileData = { ...initialProfileState };
            }

           
            const combinedData = {
                ...fetchedProfileData,
                id: user.id,
                email: user.email || fetchedProfileData.email || "",
            };
            
          
            setProfileData(combinedData);
            setTempProfileData(combinedData);
        }
    };

    fetchUserAndProfile();
}, []);

  
    const handleInputChange = (field: string, value: string) => {
        setTempProfileData({ ...tempProfileData, [field]: value });
    };

    const handleDateChange = (field: string, date: Date | undefined) => {
        setTempProfileData({ ...tempProfileData, [field]: date });
    };
    
    const previewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

   
    const handleSave = async () => {

        if (!tempProfileData.firstName.trim() || !tempProfileData.lastName.trim() || !tempProfileData.middleInitial.trim()|| !tempProfileData.contactNumber.trim()) {
        // replace with appropriate error handling message
        toast.info("Please fill in all required fields.");
        setIsSaving(false);

        return;
    }

        if (isSaving) return;
        
        setIsSaving(true);

        try {
           
            const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

            if (!currentUser || authError) {
                // replace with appropriate error handling
                toast.warning("You must be logged in to save your profile. Please log in again.");
                setIsSaving(false);
                return;
            }

            
            const { dateOfBirth, dateOfOriginalAppointment, dateOfLatestAppointment, ...restOfData } = tempProfileData;
        
            const dataToUpdate = {
                ...restOfData,
                dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
                dateOfOriginalAppointment: dateOfOriginalAppointment ? dateOfOriginalAppointment.toISOString().split('T')[0] : null,
                dateOfLatestAppointment: dateOfLatestAppointment ? dateOfLatestAppointment.toISOString().split('T')[0] : null,
                id: currentUser.id 
            };
            
            console.log("Data being saved:", dataToUpdate);

            const { data, error } = await supabase
                .from("Profile") 
                .upsert(dataToUpdate) 
                .select(); 

            if (error) {
               
                
                toast.error(`Failed to save profile`);
            } else {
                
                setProfileData(tempProfileData);
                setIsEditing(false); 
               
                toast.success('Changes saved successfully!');
            }
        } catch (e) {
            toast.error("Failed to save profile. Please try again.");
     
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempProfileData(profileData);
    };
    
    
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
                                    required
                                />
                                <div className="grid grid-cols-3 gap-3">
                                    <InputField
                                        label="Middle Initial"
                                        value={tempProfileData.middleInitial}
                                        field="middleInitial"
                                        isEditing={isEditing}
                                        onInputChange={handleInputChange}
                                        placeholder="Optional"
                                    />
                                    <div className="col-span-2">
                                        <InputField
                                            label="Last Name"
                                            value={tempProfileData.lastName}
                                            field="lastName"
                                            isEditing={isEditing}
                                            onInputChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
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
                                                    handleInputChange("gender", value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
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
                                                handleInputChange("civilStatus", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Single">Single</SelectItem>
                                                <SelectItem value="Married">Married</SelectItem>
                                                <SelectItem value="Widowed">Widowed</SelectItem>
                                                <SelectItem value="Separated">Separated</SelectItem>
                                                <SelectItem value="Divorced">Divorced</SelectItem>
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
                                                handleInputChange("nationality", value)
                                            }
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                            {tempProfileData.nationality}
                                        </div>
                                    )}
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
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4 w-full xl:max-w-[700px]">
                        <Card className="flex flex-col border-0 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="text-blue-600" size={20} />
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
                                            <Briefcase size={14} className="text-blue-600" />
                                            Position/Designation
                                        </label>
                                        {isEditing ? (
                                            <Select
                                                value={tempProfileData.position}
                                                onValueChange={(value) =>
                                                    handleInputChange("position", value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Teacher I">Teacher I</SelectItem>
                                                    <SelectItem value="Teacher II">Teacher II</SelectItem>
                                                    <SelectItem value="Teacher III">Teacher III</SelectItem>
                                                    <SelectItem value="Master Teacher I">Master Teacher I</SelectItem>
                                                    <SelectItem value="Master Teacher II">Master Teacher II</SelectItem>
                                                    <SelectItem value="Master Teacher III">Master Teacher III</SelectItem>
                                                    <SelectItem value="Principal">Principal</SelectItem>
                                                    <SelectItem value="Administrative Staff">Administrative Staff</SelectItem>
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
                                        <Calendar size={16} className="text-blue-600" />
                                        Appointment History
                                    </h4>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <DatePickerField
                                            label="Date of Original Appointment"
                                            value={tempProfileData.dateOfOriginalAppointment}
                                            field="dateOfOriginalAppointment"
                                            isEditing={isEditing}
                                            onDateChange={handleDateChange}
                                        />
                                        <DatePickerField
                                            label="Date of Latest Appointment"
                                            value={tempProfileData.dateOfLatestAppointment}
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
                                                {calculateServiceYears(tempProfileData.dateOfOriginalAppointment)}
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
                                                {calculateServiceYears(tempProfileData.dateOfLatestAppointment)}
                                            </p>
                                            <p className="text-xs text-blue-200 mt-2">
                                                Since latest appointment
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur rounded-lg p-3 text-sm">
                                    <p className="text-blue-100">
                                        <span className="font-semibold">Note:</span> Date of original appointment marks when the teacher joined this school. Latest appointment updates when promoted within the school.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
    
    );
}