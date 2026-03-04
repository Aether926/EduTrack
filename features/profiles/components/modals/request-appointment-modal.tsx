"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    APPOINTMENT_TYPES,
    type AppointmentRequestForm,
    type AppointmentType,
} from "@/features/profiles/appointment/types/appointment";

function DatePickerField(props: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    required?: boolean;
    optional?: boolean;
    minDate?: string;
    disabled?: boolean;
}) {
    const { label, value, onChange, required, optional, minDate, disabled } =
        props;
    const [open, setOpen] = useState(false);
    const dateValue = value ? new Date(value) : undefined;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
                {optional && (
                    <span className="text-gray-400 font-normal ml-1">
                        (optional)
                    </span>
                )}
            </label>
            <Popover open={open && !disabled} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={disabled}
                    >
                        {dateValue
                            ? dateValue.toLocaleDateString()
                            : "Select date"}
                        <ChevronDownIcon className="ml-auto h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 overflow-hidden"
                    align="start"
                >
                    <CalendarComponent
                        mode="single"
                        selected={dateValue}
                        captionLayout="dropdown"
                        disabled={(date) =>
                            minDate ? date < new Date(minDate) : false
                        }
                        onSelect={(date) => {
                            onChange(
                                date ? date.toISOString().split("T")[0] : "",
                            );
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

const POSITIONS = [
    "Teacher I",
    "Teacher II",
    "Teacher III",
    "Master Teacher I",
    "Master Teacher II",
    "Master Teacher III",
    "Principal",
    "Administrative Staff",
];

const EMPTY_FORM: AppointmentRequestForm = {
    position: "",
    appointment_type: "",
    start_date: "",
    end_date: "",
    memo_no: "",
    remarks: "",
    school_name: "",
};

export function RequestAppointmentModal(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submitting: boolean;
    onSubmit: (form: AppointmentRequestForm) => Promise<boolean>;
}) {
    const { open, onOpenChange, submitting, onSubmit } = props;
    const [form, setForm] = useState<AppointmentRequestForm>(EMPTY_FORM);

    const set = (key: keyof AppointmentRequestForm) => (val: string) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async () => {
        const success = await onSubmit(form);
        if (success) {
            setForm(EMPTY_FORM);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] max-w-[90vw] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Request Appointment Change</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm text-gray-500">
                        Submit a request for an appointment change. An admin
                        will review before any changes are applied to your
                        official record.
                    </p>

                    {/* Position */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Position <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={form.position}
                            onValueChange={set("position")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {POSITIONS.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Appointment Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Appointment Type{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={form.appointment_type}
                            onValueChange={set("appointment_type")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {APPOINTMENT_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* School Name (optional, mainly for Transfer) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            School Name
                            <span className="text-gray-400 font-normal ml-1">
                                (optional, for transfers)
                            </span>
                        </label>
                        <Input
                            value={form.school_name}
                            onChange={(e) => set("school_name")(e.target.value)}
                            placeholder="e.g. Ormoc City National High School"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <DatePickerField
                            label="Start Date"
                            value={form.start_date}
                            onChange={(d) => {
                                set("start_date")(d);

                                // if end date becomes invalid, clear it
                                if (form.end_date && d && form.end_date < d) {
                                    set("end_date")("");
                                }
                            }}
                            required
                        />

                        <DatePickerField
                            label="End Date"
                            value={form.end_date}
                            onChange={set("end_date")}
                            minDate={form.start_date}
                            disabled={!form.start_date}
                            optional
                        />
                    </div>

                    {/* Memo No */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Memo No.
                            <span className="text-gray-400 font-normal ml-1">
                                (optional)
                            </span>
                        </label>
                        <Input
                            value={form.memo_no}
                            onChange={(e) => set("memo_no")(e.target.value)}
                            placeholder="e.g. DepEd-2024-001"
                        />
                    </div>

                    {/* Remarks */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Remarks / Reason{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Explain the reason for this appointment change..."
                            value={form.remarks}
                            onChange={(e) => set("remarks")(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2"
                    >
                        <Send size={14} />
                        {submitting ? "Submitting..." : "Submit Request"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
