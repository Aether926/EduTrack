/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Send, ClipboardCheck, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolInput } from "@/components/ui-elements/school-input";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addAppointmentHistoryEntry } from "@/features/admin-actions/appointment-history/actions/appointment-history-actions";
import type { AddAppointmentForm } from "@/features/admin-actions/appointment-history/types/appointment-history";
import {
    TeacherPickerModal,
    type TeacherOption,
} from "@/components/teacher-picker-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui-elements/user-avatar";
import { PositionSelect } from "@/components/formatter/position-select";

const APPOINTMENT_TYPES = [
    "Original",
    "Promotion",
    "Reappointment",
    "Transfer",
    "Reinstatement",
];

const REMARKS_OPTIONS = [
    "Promotion / Salary grade upgrade",
    "Transfer from another school",
    "Renewal of appointment",
    "Initial entry into service",
    "Correction of records",
    "End of temporary appointment",
    "Other (specify below)",
];

const EMPTY: AddAppointmentForm = {
    teacher_id: "",
    position: "",
    appointment_type: "",
    start_date: "",
    end_date: "",
    memo_no: "",
    remarks: "",
    school_name: "",
};

type FormErrors = Partial<Record<keyof AddAppointmentForm, string>>;

function FieldLabel({
    children,
    optional,
}: {
    children: React.ReactNode;
    optional?: boolean;
}) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {children}
            </span>
            {optional && (
                <span className="text-[10px] text-muted-foreground/50 normal-case tracking-normal">
                    optional
                </span>
            )}
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-rose-400">{message}</p>;
}

function DatePickerField({
    label,
    value,
    onChange,
    error,
    optional,
    maxDate,
    minDate,
}: {
    label: string;
    value: Date | undefined;
    onChange: (d: Date | undefined) => void;
    error?: string;
    optional?: boolean;
    maxDate?: Date;
    minDate?: Date;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <FieldLabel optional={optional}>{label}</FieldLabel>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange(undefined)}
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                    >
                        <X className="h-3 w-3" /> Clear
                    </button>
                )}
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                            error && "border-rose-500/50",
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? (
                            format(value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1970}
                        toYear={new Date().getFullYear() + 5}
                        disabled={(date) => {
                            if (maxDate && date > maxDate) return true;
                            if (minDate && date < minDate) return true;
                            return false;
                        }}
                    />
                </PopoverContent>
            </Popover>
            <FieldError message={error} />
        </div>
    );
}

function validate(
    form: AddAppointmentForm,
    startDate: Date | undefined,
    endDate: Date | undefined,
): FormErrors {
    const errors: FormErrors = {};
    if (!form.teacher_id) errors.teacher_id = "Please select a teacher.";
    if (!form.position) errors.position = "Please select a position.";
    if (!form.appointment_type)
        errors.appointment_type = "Please select an appointment type.";
    if (!startDate) errors.start_date = "Start date is required.";
    if (startDate && endDate && endDate < startDate)
        errors.end_date = "End date cannot be before start date.";
    return errors;
}

export function AddAppointmentSheet(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const { open, onOpenChange, onSuccess } = props;
    const isMobile = useIsMobile();

    const [form, setForm] = useState<AddAppointmentForm>(EMPTY);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [remarksOption, setRemarksOption] = useState("");
    const [customRemarks, setCustomRemarks] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] =
        useState<TeacherOption | null>(null);

    const set = (key: keyof AddAppointmentForm) => (val: string) => {
        setForm((f) => ({ ...f, [key]: val }));
        setErrors((e) => {
            const next = { ...e };
            delete next[key];
            return next;
        });
    };

    const handleClose = () => {
        if (submitting) return;
        onOpenChange(false);
        setTimeout(() => {
            setForm(EMPTY);
            setStartDate(undefined);
            setEndDate(undefined);
            setRemarksOption("");
            setCustomRemarks("");
            setErrors({});
            setSelectedTeacher(null);
        }, 300);
    };

    const handleSubmit = async () => {
        const errs = validate(form, startDate, endDate);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        const finalRemarks =
            remarksOption === "Other (specify below)"
                ? customRemarks.trim()
                : remarksOption;

        const payload: AddAppointmentForm = {
            ...form,
            start_date: startDate ? format(startDate, "yyyy-MM-dd") : "",
            end_date: endDate ? format(endDate, "yyyy-MM-dd") : "",
            remarks: finalRemarks,
        };

        setSubmitting(true);
        try {
            await addAppointmentHistoryEntry(payload);
            toast.success("Appointment history entry added.");
            handleClose();
            onSuccess();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to add entry.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={cn(
                        "flex flex-col gap-0 p-0",
                        isMobile
                            ? "h-[95vh] rounded-t-2xl"
                            : "w-[480px] sm:w-[520px]",
                    )}
                >
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 shrink-0">
                                <ClipboardCheck className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                                        New Entry
                                    </span>
                                </div>
                                <SheetTitle className="text-base leading-snug">
                                    Add Appointment History
                                </SheetTitle>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                        {/* Teacher */}
                        <div>
                            <FieldLabel>Teacher</FieldLabel>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start font-normal",
                                    !selectedTeacher && "text-muted-foreground",
                                    errors.teacher_id && "border-rose-500/50",
                                )}
                                onClick={() => setPickerOpen(true)}
                            >
                                {selectedTeacher ? (
                                    <span className="flex items-center gap-2">
                                        <UserAvatar
                                            name={selectedTeacher.fullName}
                                            src={selectedTeacher.profileImage}
                                            className="h-5 w-5"
                                        />
                                        {selectedTeacher.fullName}
                                    </span>
                                ) : (
                                    "Select teacher..."
                                )}
                            </Button>
                            <FieldError message={errors.teacher_id} />
                        </div>

                        <Separator />

                        {/* Position */}
                        <div>
                            <FieldLabel>Position</FieldLabel>
                            <PositionSelect
                                value={form.position}
                                onChange={set("position")}
                            />
                            {errors.position && (
                                <FieldError message={errors.position} />
                            )}
                            <FieldError message={errors.position} />
                        </div>

                        {/* Appointment Type */}
                        <div>
                            <FieldLabel>Appointment Type</FieldLabel>
                            <Select
                                value={form.appointment_type}
                                onValueChange={set("appointment_type")}
                            >
                                <SelectTrigger
                                    className={cn(
                                        errors.appointment_type &&
                                            "border-rose-500/50",
                                    )}
                                >
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {APPOINTMENT_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.appointment_type} />
                        </div>

                        <Separator />

                        {/* School Name */}
                        <div>
                            <FieldLabel optional>School Name</FieldLabel>
                            <SchoolInput
                                value={form.school_name}
                                onChange={(v) => set("school_name")(v)}
                                placeholder="e.g. Ormoc City National High School"
                            />
                        </div>

                        {/* Dates — shadcn Calendar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DatePickerField
                                label="Start Date"
                                value={startDate}
                                onChange={(d) => {
                                    setStartDate(d);
                                    setErrors((e) => {
                                        const n = { ...e };
                                        delete n.start_date;
                                        return n;
                                    });
                                    // Clear end date if it's before the new start
                                    if (d && endDate && endDate < d)
                                        setEndDate(undefined);
                                }}
                                error={errors.start_date}
                            />
                            <DatePickerField
                                label="End Date"
                                value={endDate}
                                onChange={(d) => {
                                    setEndDate(d);
                                    setErrors((e) => {
                                        const n = { ...e };
                                        delete n.end_date;
                                        return n;
                                    });
                                }}
                                error={errors.end_date}
                                optional
                                minDate={startDate}
                            />
                        </div>

                        <Separator />

                        {/* Memo No */}
                        <div>
                            <FieldLabel optional>Memo No.</FieldLabel>
                            <Input
                                value={form.memo_no}
                                onChange={(e) => set("memo_no")(e.target.value)}
                                placeholder="e.g. DepEd-2024-001"
                            />
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <FieldLabel optional>Remarks</FieldLabel>
                            <Select
                                value={remarksOption}
                                onValueChange={(v) => {
                                    setRemarksOption(v);
                                    setCustomRemarks("");
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a remark..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {REMARKS_OPTIONS.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {remarksOption === "Other (specify below)" && (
                                <Textarea
                                    rows={3}
                                    value={customRemarks}
                                    onChange={(e) =>
                                        setCustomRemarks(e.target.value)
                                    }
                                    placeholder="Specify remarks..."
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-3 flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={submitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Send className="h-3.5 w-3.5" />
                            {submitting ? "Saving..." : "Add Entry"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <TeacherPickerModal
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                selectedId={selectedTeacher?.id}
                onSelect={(t) => {
                    setSelectedTeacher(t);
                    setForm((f) => ({ ...f, teacher_id: t.id }));
                    setErrors((e) => {
                        const n = { ...e };
                        delete n.teacher_id;
                        return n;
                    });
                }}
            />
        </>
    );
}
