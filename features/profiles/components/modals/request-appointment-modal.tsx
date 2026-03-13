"use client";

import React, { useState } from "react";
import {
    Send,
    X,
    Briefcase,
    ClipboardList,
    Calendar,
    School,
    FileText,
} from "lucide-react";
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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    APPOINTMENT_TYPES,
    type AppointmentRequestForm,
} from "@/features/profiles/appointment/types/appointment";

// ── Date helpers ──────────────────────────────────────────────────────────────

function parseDateLocal(value: string): Date | undefined {
    if (!value) return undefined;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function toDateString(d?: Date): string {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// ── Field label ───────────────────────────────────────────────────────────────

function FieldLabel({
    icon: Icon,
    label,
    required,
    optional,
}: {
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    required?: boolean;
    optional?: boolean;
}) {
    return (
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            {Icon && <Icon size={14} className="text-blue-600" />}
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
            {optional && (
                <span className="text-muted-foreground font-normal ml-1">
                    (optional)
                </span>
            )}
        </label>
    );
}

// ── Date picker ───────────────────────────────────────────────────────────────

function DatePickerField(props: {
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    value: string;
    onChange: (val: string) => void;
    required?: boolean;
    optional?: boolean;
    minDate?: string;
    disabled?: boolean;
}) {
    const {
        label,
        icon,
        value,
        onChange,
        required,
        optional,
        minDate,
        disabled,
    } = props;
    const [open, setOpen] = useState(false);

    const dateValue = value ? parseDateLocal(value) : undefined;
    const minDateObj = minDate ? parseDateLocal(minDate) : undefined;

    return (
        <div className="space-y-1.5">
            <FieldLabel
                icon={icon}
                label={label}
                required={required}
                optional={optional}
            />
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
                        disabled={(d) => (minDateObj ? d < minDateObj : false)}
                        onSelect={(date) => {
                            onChange(date ? toDateString(date) : "");
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const POSITIONS = [
    "Teacher I",
    "Teacher II",
    "Teacher III",
    "Teacher IV",
    "Teacher V",
    "Teacher VI",
    "Teacher VII",
    "Master Teacher I",
    "Master Teacher II",
    "Master Teacher III",
    "Master Teacher IV",
    "School Principal I",
    "School Principal II",
    "School Principal III",
    "School Principal IV",
    "Administrative Staff",
];

const REASONS = [
    "Promotion / Salary grade upgrade",
    "Transfer from another school",
    "Renewal of appointment",
    "Initial entry into service",
    "Correction of records",
    "End of temporary appointment",
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

// ── Component ─────────────────────────────────────────────────────────────────

export function RequestAppointmentModal(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submitting: boolean;
    onSubmit: (form: AppointmentRequestForm) => Promise<boolean>;
}) {
    const { open, onOpenChange, submitting, onSubmit } = props;
    const isMobile = useIsMobile();

    const [form, setForm] = useState<AppointmentRequestForm>(EMPTY_FORM);

    // Reset form each time sheet opens
    React.useEffect(() => {
        if (open) setForm(EMPTY_FORM);
    }, [open]);

    const set = (key: keyof AppointmentRequestForm) => (val: string) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async () => {
        const success = await onSubmit(form);
        if (success) {
            setForm(EMPTY_FORM);
            onOpenChange(false);
        }
    };

    const isCustomReason = !!form.remarks && !REASONS.includes(form.remarks);
    const dropdownValue = REASONS.includes(form.remarks)
        ? form.remarks
        : form.remarks
          ? "__custom__"
          : "";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={[
                    "flex flex-col gap-0 p-0 overflow-hidden",
                    isMobile
                        ? "h-[92vh] rounded-t-2xl"
                        : "w-[500px] sm:w-[540px]",
                ].join(" ")}
            >
                {/* ── Header ── */}
                <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="text-blue-600" size={18} />
                        <SheetTitle>Request Appointment Change</SheetTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Submit a request for an appointment change. An admin
                        will review before any changes are applied.
                    </p>
                </SheetHeader>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                    {/* Position */}
                    <div className="space-y-1.5">
                        <FieldLabel
                            icon={Briefcase}
                            label="Position"
                            required
                        />
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
                        <FieldLabel
                            icon={FileText}
                            label="Appointment Type"
                            required
                        />
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

                    {/* School Name */}
                    <div className="space-y-1.5">
                        <FieldLabel
                            icon={School}
                            label="School Name"
                            optional
                        />
                        <Input
                            value={form.school_name}
                            onChange={(e) => set("school_name")(e.target.value)}
                            placeholder="e.g. Ormoc City National High School"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <DatePickerField
                            icon={Calendar}
                            label="Start Date"
                            value={form.start_date}
                            onChange={(d) => {
                                set("start_date")(d);
                                if (form.end_date && d && form.end_date < d) {
                                    set("end_date")("");
                                }
                            }}
                            required
                        />
                        <DatePickerField
                            icon={Calendar}
                            label="End Date"
                            value={form.end_date}
                            onChange={set("end_date")}
                            minDate={form.start_date}
                            disabled={!form.start_date}
                            required
                        />
                    </div>

                    {/* Memo No */}
                    <div className="space-y-1.5">
                        <FieldLabel icon={FileText} label="Memo No." optional />
                        <Input
                            value={form.memo_no}
                            onChange={(e) => set("memo_no")(e.target.value)}
                            placeholder="e.g. DepEd-2024-001"
                        />
                    </div>

                    {/* Remarks / Reason */}
                    <div className="space-y-2">
                        <FieldLabel
                            icon={ClipboardList}
                            label="Remarks / Reason"
                            required
                        />
                        <Select
                            value={dropdownValue}
                            onValueChange={(val) => {
                                if (val === "__custom__") {
                                    set("remarks")("");
                                } else {
                                    set("remarks")(val);
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason..." />
                            </SelectTrigger>
                            <SelectContent>
                                {REASONS.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                                <SelectItem value="__custom__">
                                    Other (specify below)
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {(dropdownValue === "__custom__" || isCustomReason) && (
                            <textarea
                                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                rows={3}
                                placeholder="Explain the reason for this appointment change..."
                                value={isCustomReason ? form.remarks : ""}
                                onChange={(e) => set("remarks")(e.target.value)}
                                autoFocus
                            />
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <SheetFooter className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-row gap-2 shrink-0">
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            submitting ||
                            !form.remarks.trim() ||
                            !form.position ||
                            !form.appointment_type ||
                            !form.start_date
                        }
                        className="gap-2 flex-1"
                    >
                        {submitting ? (
                            <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        {submitting ? "Submitting..." : "Submit Request"}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                        className="gap-2 flex-1"
                    >
                        <X size={16} /> Cancel
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
