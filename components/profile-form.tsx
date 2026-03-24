"use client";

import Image from "next/image";
import { useState } from "react";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "./ui/field";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";

interface ProfileClass {
    className?: string;
    submitHandler: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ProfileForm({
    className,
    submitHandler,
}: ProfileClass) {
    const [preview, setPreview] = useState<string | null>(null);
    const [birthDateOpen, setBirthDateOpen] = useState(false);
    const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
    const [dateOfOriginalAppointmentOpen, setDateOfOriginalAppointmentOpen] =
        useState(false);
    const [dateOfOriginalAppointment, setDateOfOriginalAppointment] = useState<
        Date | undefined
    >(undefined);
    const [dateOfLatestAppointmentOpen, setDateOfLatestAppointmentOpen] =
        useState(false);
    const [dateOfLatestAppointment, setDateOfLatestAppointment] = useState<
        Date | undefined
    >(undefined);

    function previewImage(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }

    return (
        <form
            className={`flex flex-col gap-4 my-4 rounded-md p-6 bg-neutral-50 ${className}`}
            onSubmit={submitHandler}
        >
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>Profile Picture</FieldLegend>
                    <Field className="flex justify-center items-center">
                        {preview && (
                            <Image
                                width={120}
                                height={120}
                                src={preview}
                                alt="Preview"
                                style={{ width: "10rem", height: "10rem" }}
                                className="flex justify-center object-cover rounded-full mb-2 border border-gray-600"
                            />
                        )}
                        <Label htmlFor="picture">Picture</Label>
                        <Input
                            id="picture"
                            type="file"
                            accept="image/*"
                            className="bg-gray-200 border-gray-600"
                            onChange={previewImage}
                        />
                    </Field>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>Personal Information</FieldLegend>
                    <Field>
                        <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                        <Input
                            id="first-name"
                            type="text"
                            placeholder="Enter first name"
                            className="bg-gray-200 border-gray-600"
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="middle-inital">
                            Middle Initial
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </FieldLabel>
                        <Input
                            id="middle-initial"
                            type="text"
                            placeholder="Enter middle initial"
                            className="bg-gray-200 border-gray-600"
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                        <Input
                            id="last-name"
                            type="text"
                            placeholder="Enter last name"
                            className="bg-gray-200 border-gray-600"
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="employee-teacher-id">
                            Employee / Teacher ID
                        </FieldLabel>
                        <Input
                            id="employee-teacher-id"
                            type="text"
                            placeholder="Enter your Employee ID"
                            className="bg-gray-200 border-gray-600"
                            required
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-4 ">
                        <Field>
                            <FieldLabel htmlFor="gender">Gender</FieldLabel>
                            <Select>
                                <SelectTrigger className="bg-white border-gray-600">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">
                                        Female
                                    </SelectItem>
                                    <SelectItem value="panzerkampfwagen-VI">
                                        Panzerkampfwagen VI
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="age">Age</FieldLabel>
                            <Input
                                id="age"
                                placeholder="Enter your age"
                                className="bg-gray-200 border-gray-600"
                                type="number"
                            />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="date-of-birth">
                                Date of Birth
                            </FieldLabel>
                            <Popover
                                open={birthDateOpen}
                                onOpenChange={setBirthDateOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date-of-birth"
                                        className="flex justify-between bg-gray-200 border-gray-600 text-sm text-gray-500"
                                    >
                                        {birthDate
                                            ? birthDate.toLocaleDateString()
                                            : "Select date"}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto overflow-hidden p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={birthDate}
                                        captionLayout="dropdown"
                                        disabled={(d) => d > new Date()}
                                        onSelect={(date) => {
                                            setBirthDate(date);
                                            setBirthDateOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="civil-status">
                                Civil Status
                            </FieldLabel>
                            <Select>
                                <SelectTrigger className="bg-gray-200 border-gray-600">
                                    <SelectValue placeholder="Select civil status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">
                                        Single
                                    </SelectItem>
                                    <SelectItem value="married">
                                        Married
                                    </SelectItem>
                                    <SelectItem value="widowed">
                                        Widowed
                                    </SelectItem>
                                    <SelectItem value="separated">
                                        Separated
                                    </SelectItem>
                                    <SelectItem value="divorced">
                                        Divorced
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="nationality">
                            Nationality
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </FieldLabel>
                        <Input
                            id="nationality"
                            type="text"
                            placeholder="Enter nationality"
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="religion">
                            Religion
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </FieldLabel>
                        <Input
                            id="religion"
                            type="text"
                            placeholder="Enter nationality"
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>Contact Information</FieldLegend>
                    <Field>
                        <FieldLabel htmlFor="contact-number">
                            Contact Number
                        </FieldLabel>
                        <Input
                            id="contact-number"
                            type="number"
                            placeholder="Enter contact number"
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="email">Email Address</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter email"
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>Work Information</FieldLegend>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="position-designation">
                                Position / Designation
                            </FieldLabel>
                            <Select>
                                <SelectTrigger className="bg-gray-200 border-gray-600">
                                    <SelectValue placeholder="Select position/designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="teacher-1">
                                        Teacher I
                                    </SelectItem>
                                    <SelectItem value="teacher-2">
                                        Teacher II
                                    </SelectItem>
                                    <SelectItem value="teacher-3">
                                        Teacher III
                                    </SelectItem>
                                    <SelectItem value="teacher-4">
                                        Teacher IV
                                    </SelectItem>
                                    <SelectItem value="teacher-5">
                                        Teacher V
                                    </SelectItem>
                                    <SelectItem value="teacher-6">
                                        Teacher VI
                                    </SelectItem>
                                    <SelectItem value="teacher-7">
                                        Teacher VII
                                    </SelectItem>
                                    <SelectItem value="master-teacher-1">
                                        Master Teacher I
                                    </SelectItem>
                                    <SelectItem value="master-teacher-2">
                                        Master Teacher II
                                    </SelectItem>
                                    <SelectItem value="master-teacher-3">
                                        Master Teacher III
                                    </SelectItem>
                                    <SelectItem value="master-teacher-4">
                                        Master Teacher IV
                                    </SelectItem>
                                    <SelectItem value="master-teacher-5">
                                        Master Teacher V
                                    </SelectItem>
                                    <SelectItem value="head-teacher-1">
                                        Head Teacher I
                                    </SelectItem>
                                    <SelectItem value="head-teacher-2">
                                        Head Teacher II
                                    </SelectItem>
                                    <SelectItem value="head-teacher-3">
                                        Head Teacher III
                                    </SelectItem>
                                    <SelectItem value="head-teacher-4">
                                        Head Teacher IV
                                    </SelectItem>
                                    <SelectItem value="head-teacher-5">
                                        Head Teacher V
                                    </SelectItem>
                                    <SelectItem value="head-teacher-6">
                                        Head Teacher VI
                                    </SelectItem>
                                    <SelectItem value="assistant-school-principal-1">
                                        Assistant School Principal I
                                    </SelectItem>
                                    <SelectItem value="assistant-school-principal-2">
                                        Assistant School Principal II
                                    </SelectItem>
                                    <SelectItem value="assistant-school-principal-3">
                                        Assistant School Principal III
                                    </SelectItem>
                                    <SelectItem value="assistant-school-principal-4">
                                        Assistant School Principal IV
                                    </SelectItem>
                                    <SelectItem value="school-principal-1">
                                        School Principal I
                                    </SelectItem>
                                    <SelectItem value="school-principal-2">
                                        School Principal II
                                    </SelectItem>
                                    <SelectItem value="school-principal-3">
                                        School Principal III
                                    </SelectItem>
                                    <SelectItem value="school-principal-4">
                                        School Principal IV
                                    </SelectItem>
                                    <SelectItem value="school-principal-5">
                                        School Principal V
                                    </SelectItem>
                                    <SelectItem value="administrative-staff">
                                        Administrative Staff
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="plantilla-number">
                                Plantilla No.
                            </FieldLabel>
                            <Input
                                id="plantilla-number"
                                type="number"
                                placeholder="Enter plantilla number"
                                className="bg-gray-200 border-gray-600"
                            />
                        </Field>
                    </div>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>Government IDs</FieldLegend>
                    <Field>
                        <FieldLabel htmlFor="pag-ibig-number">
                            Pag-IBIG No.
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </FieldLabel>
                        <Input
                            id="pag-ibig-number"
                            type="number"
                            placeholder="1234-5678-9012"
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="philhealth-number">
                            PhilHealth No.
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </FieldLabel>
                        <Input
                            id="philhealth-number"
                            type="number"
                            placeholder="Enter PhilHealth No."
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="tin">
                            TIN
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </FieldLabel>
                        <Input
                            id="tin"
                            type="number"
                            placeholder="Enter TIN No."
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="gsis-bp">
                            GSIS BP No.
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </FieldLabel>
                        <Input
                            id="gsis-bp"
                            type="number"
                            placeholder="Enter GSIS BP No."
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>Educational Background</FieldLegend>
                    <Field>
                        <FieldLabel htmlFor="subject-of-specialization">
                            Subject of Specialization
                        </FieldLabel>
                        <Input
                            id="subject-of-specialization"
                            type="text"
                            placeholder="Enter specialization"
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="subject-of-specialization">
                            Bachelor&#39;s Degree
                        </FieldLabel>
                        <Input
                            id="subject-of-specialization"
                            type="text"
                            placeholder="Enter Bachelor's Degree"
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="subject-of-specialization">
                            Post Graduate
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </FieldLabel>
                        <Input
                            id="subject-of-specialization"
                            type="text"
                            placeholder="Enter Post Graduate Degree"
                            className="bg-gray-200 border-gray-600"
                        />
                    </Field>
                </FieldSet>
            </FieldGroup>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
                Submit
            </button>
        </form>
    );
}
