import React, { useState } from "react";
import {
    Send,
    X,
    FileText,
    Briefcase,
    Calendar,
    ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
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
import type { ProfileState } from "@/features/profiles/types/profile";
import type { HRChangeRequestPayload } from "@/features/profiles/types/employment-info";
import { EmployeeIdInput } from "@/components/formatter/employee-id-format";
import { PositionSelect } from "@/components/formatter/position-select";

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
                <span className="text-muted-foreground font-normal">
                    (optional)
                </span>
            )}
        </label>
    );
}

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
            <Popover open={open} onOpenChange={setOpen}>
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
                        disabled={(d) =>
                            d > new Date() ||
                            (minDateObj ? d < minDateObj : false)
                        }
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

const REASONS = [
    "Correction of records",
    "Promotion / Salary grade upgrade",
    "Transfer from another school",
    "Renewal of appointment",
    "Initial entry into service",
];

type Form = {
    employeeId: string;
    position: string;
    plantillaNo: string;
    dateOfOriginalAppointment: string;
    dateOfLatestAppointment: string;
    reason: string;
};

export function RequestHRChangeModal(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentData: ProfileState;
    submitting: boolean;
    onSubmit: (payload: HRChangeRequestPayload) => Promise<boolean>;
}) {
    const { open, onOpenChange, currentData, submitting, onSubmit } = props;
    const isMobile = useIsMobile();

    const [form, setForm] = useState<Form>({
        employeeId: currentData.employeeId ?? "",
        position: currentData.position ?? "",
        plantillaNo: currentData.plantillaNo ?? "",
        dateOfOriginalAppointment: toDateString(
            currentData.dateOfOriginalAppointment,
        ),
        dateOfLatestAppointment: toDateString(
            currentData.dateOfLatestAppointment,
        ),
        reason: "",
    });

    // Re-sync form with latest currentData each time sheet opens
    React.useEffect(() => {
        if (open) {
            setForm({
                employeeId: currentData.employeeId ?? "",
                position: currentData.position ?? "",
                plantillaNo: currentData.plantillaNo ?? "",
                dateOfOriginalAppointment: toDateString(
                    currentData.dateOfOriginalAppointment,
                ),
                dateOfLatestAppointment: toDateString(
                    currentData.dateOfLatestAppointment,
                ),
                reason: "",
            });
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const set = (key: keyof Form) => (val: string) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async () => {
        const success = await onSubmit({
            employeeId: form.employeeId || null,
            position: form.position || null,
            plantillaNo: form.plantillaNo || null,
            dateOfOriginalAppointment: form.dateOfOriginalAppointment || null,
            dateOfLatestAppointment: form.dateOfLatestAppointment || null,
            reason: form.reason,
        });
        if (success) {
            setForm((f) => ({ ...f, reason: "" }));
            onOpenChange(false);
        }
    };

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
                        <SheetTitle>Request Employment Info Change</SheetTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Fill in only the fields you want changed. An admin will
                        review before applying.
                    </p>
                </SheetHeader>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <FieldLabel icon={FileText} label="Employee ID" />
                        <EmployeeIdInput
                            value={form.employeeId}
                            onChange={set("employeeId")}
                            placeholder={
                                currentData.employeeId || "Current value"
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <FieldLabel
                            icon={Briefcase}
                            label="Position / Designation"
                        />
                        <PositionSelect
                            value={form.position}
                            onChange={set("position")}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <FieldLabel
                            icon={FileText}
                            label="Plantilla No."
                            optional
                        />
                        <Input
                            value={form.plantillaNo}
                            onChange={(e) => set("plantillaNo")(e.target.value)}
                            placeholder={
                                currentData.plantillaNo || "Current value"
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <DatePickerField
                            icon={Calendar}
                            label="Original Appointment"
                            value={form.dateOfOriginalAppointment}
                            onChange={(d) => {
                                set("dateOfOriginalAppointment")(d);
                                if (
                                    form.dateOfLatestAppointment &&
                                    d &&
                                    form.dateOfLatestAppointment < d
                                ) {
                                    set("dateOfLatestAppointment")("");
                                }
                            }}
                        />
                        <DatePickerField
                            icon={Calendar}
                            label="Latest Appointment"
                            value={form.dateOfLatestAppointment}
                            minDate={form.dateOfOriginalAppointment}
                            disabled={!form.dateOfOriginalAppointment}
                            onChange={set("dateOfLatestAppointment")}
                        />
                    </div>

                    <div className="space-y-2">
                        <FieldLabel
                            icon={ClipboardList}
                            label="Reason for Change"
                            required
                        />
                        <Select
                            value={
                                REASONS.includes(form.reason)
                                    ? form.reason
                                    : form.reason
                                      ? "__custom__"
                                      : ""
                            }
                            onValueChange={(val) => {
                                if (val === "__custom__") {
                                    set("reason")("");
                                } else {
                                    set("reason")(val);
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

                        {!REASONS.includes(form.reason) && (
                            <textarea
                                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                rows={3}
                                placeholder="Describe your reason..."
                                value={form.reason}
                                onChange={(e) => set("reason")(e.target.value)}
                                autoFocus
                            />
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <SheetFooter className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-row gap-2 shrink-0">
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || !form.reason.trim()}
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
