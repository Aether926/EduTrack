/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
    Send,
    ClipboardCheck,
    Pencil,
    X,
    Loader2,
    CalendarIcon,
    Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    updateAppointmentHistoryEntry,
    deleteAppointmentHistoryEntry,
} from "@/features/admin-actions/appointment-history/actions/appointment-history-actions";
import type { AppointmentHistoryRow } from "@/features/admin-actions/appointment-history/types/appointment-history";
import {
    TeacherPickerModal,
    type TeacherOption,
} from "@/components/teacher-picker-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import InitialAvatar from "@/components/ui-elements/avatars/avatar-color";

// ── Constants ──────────────────────────────────────────────────────────────────

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

const TYPE_COLORS: Record<string, string> = {
    Original: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    Promotion: "text-violet-400 border-violet-500/30 bg-violet-500/10",
    Reappointment: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    Transfer: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    Reinstatement: "text-pink-400 border-pink-500/30 bg-pink-500/10",
};

// ── Sub-components ─────────────────────────────────────────────────────────────

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

function ReadOnlyField({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm min-h-9 flex items-center">
                {value || <span className="text-muted-foreground">—</span>}
            </div>
        </div>
    );
}

function DatePickerField({
    label,
    value,
    onChange,
    error,
    optional,
    minDate,
}: {
    label: string;
    value: Date | undefined;
    onChange: (d: Date | undefined) => void;
    error?: string;
    optional?: boolean;
    minDate?: Date;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <FieldLabel optional={optional}>{label}</FieldLabel>
                {value && optional && (
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
                        disabled={(date) => !!(minDate && date < minDate)}
                    />
                </PopoverContent>
            </Popover>
            <FieldError message={error} />
        </div>
    );
}

function fmt(d?: string | null) {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return String(d);
    }
}

// ── Validation ─────────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<string, string>>;

function validate(
    teacherId: string,
    position: string,
    appointmentType: string,
    startDate: Date | undefined,
    endDate: Date | undefined,
): FormErrors {
    const errors: FormErrors = {};
    if (!teacherId) errors.teacher_id = "Please select a teacher.";
    if (!position) errors.position = "Please select a position.";
    if (!appointmentType)
        errors.appointment_type = "Please select an appointment type.";
    if (!startDate) errors.start_date = "Start date is required.";
    if (startDate && endDate && endDate < startDate)
        errors.end_date = "End date cannot be before start date.";
    return errors;
}

// ── Main component ─────────────────────────────────────────────────────────────

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    row: AppointmentHistoryRow | null;
    onSuccess: () => void;
};

export function AppointmentDetailSheet({
    open,
    onOpenChange,
    row,
    onSuccess,
}: Props) {
    const isMobile = useIsMobile();
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Edit state
    const [teacherId, setTeacherId] = useState("");
    const [selectedTeacher, setSelectedTeacher] =
        useState<TeacherOption | null>(null);
    const [position, setPosition] = useState("");
    const [appointmentType, setAppointmentType] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [memoNo, setMemoNo] = useState("");
    const [remarksOption, setRemarksOption] = useState("");
    const [customRemarks, setCustomRemarks] = useState("");

    useEffect(() => {
        if (!row) return;
        setMode("view");
        setErrors({});
        setTeacherId(row.teacher_id);
        setSelectedTeacher(
            row.teacher
                ? {
                      id: row.teacher_id,
                      fullName: `${row.teacher.firstName} ${row.teacher.lastName}`,
                      employeeId: (row.teacher as any).employeeId ?? "—",
                      position: "",
                      email: row.teacher.email ?? "",
                      profileImage: (row.teacher as any).profileImage ?? null,
                  }
                : null,
        );
        setPosition(row.position ?? "");
        setAppointmentType(row.appointment_type ?? "");
        setSchoolName((row as any).school_name ?? "");
        setStartDate(row.start_date ? new Date(row.start_date) : undefined);
        setEndDate(row.end_date ? new Date(row.end_date) : undefined);
        setMemoNo(row.memo_no ?? "");
        const existingRemarks = row.remarks ?? "";
        if (REMARKS_OPTIONS.includes(existingRemarks)) {
            setRemarksOption(existingRemarks);
            setCustomRemarks("");
        } else if (existingRemarks) {
            setRemarksOption("Other (specify below)");
            setCustomRemarks(existingRemarks);
        } else {
            setRemarksOption("");
            setCustomRemarks("");
        }
    }, [row]);

    const handleClose = () => {
        if (submitting || deleting) return;
        onOpenChange(false);
        setTimeout(() => setMode("view"), 300);
    };

    const clearError = (key: string) =>
        setErrors((e) => {
            const n = { ...e };
            delete n[key];
            return n;
        });

    const handleSave = async () => {
        if (!row) return;
        const errs = validate(
            teacherId,
            position,
            appointmentType,
            startDate,
            endDate,
        );
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setSubmitting(true);
        try {
            const finalRemarks =
                remarksOption === "Other (specify below)"
                    ? customRemarks.trim() || null
                    : remarksOption || null;

            await updateAppointmentHistoryEntry(row.id, {
                teacher_id: teacherId,
                position,
                appointment_type: appointmentType,
                school_name: schoolName || null,
                start_date: startDate ? format(startDate, "yyyy-MM-dd") : "",
                end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
                memo_no: memoNo || null,
                remarks: finalRemarks,
            });
            toast.success("Entry updated.");
            setMode("view");
            onSuccess();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!row) return;
        setDeleting(true);
        try {
            await deleteAppointmentHistoryEntry(row.id);
            toast.success("Entry deleted.");
            onOpenChange(false);
            onSuccess();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to delete.");
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    if (!row) return null;

    const isEdit = mode === "edit";
    const typeColor =
        TYPE_COLORS[row.appointment_type] ??
        "text-muted-foreground border-border bg-muted/10";

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={cn(
                        "flex flex-col gap-0 p-0",
                        isMobile
                            ? "h-[95vh] rounded-t-2xl"
                            : "w-[500px] sm:w-[540px]",
                    )}
                >
                    {/* Header */}
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-2 shrink-0">
                                    <ClipboardCheck className="h-4 w-4 text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span
                                            className={cn(
                                                "inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                                                typeColor,
                                            )}
                                        >
                                            {isEdit
                                                ? appointmentType ||
                                                  "Edit Entry"
                                                : row.appointment_type}
                                        </span>
                                        {isEdit && (
                                            <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                                                Editing
                                            </span>
                                        )}
                                    </div>
                                    <SheetTitle className="text-base leading-snug">
                                        Appointment Record
                                    </SheetTitle>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {mode === "view" && (
                                    <>
                                        <TooltipProvider delayDuration={200}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                                        onClick={() =>
                                                            setConfirmDelete(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    Delete
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider delayDuration={200}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() =>
                                                            setMode("edit")
                                                        }
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    Edit
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={handleClose}
                                    disabled={submitting || deleting}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                        {/* Teacher */}
                        <div>
                            <FieldLabel>Teacher</FieldLabel>
                            {isEdit ? (
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start font-normal",
                                        !selectedTeacher &&
                                            "text-muted-foreground",
                                        errors.teacher_id &&
                                            "border-rose-500/50",
                                    )}
                                    onClick={() => setPickerOpen(true)}
                                >
                                    {selectedTeacher ? (
                                        <span className="flex items-center gap-2">
                                            <InitialAvatar
                                                name={selectedTeacher.fullName}
                                                src={
                                                    selectedTeacher.profileImage
                                                }
                                                className="h-5 w-5"
                                            />
                                            {selectedTeacher.fullName}
                                        </span>
                                    ) : (
                                        "Select teacher..."
                                    )}
                                </Button>
                            ) : (
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                                    <InitialAvatar
                                        name={selectedTeacher?.fullName ?? "?"}
                                        src={selectedTeacher?.profileImage}
                                        className="h-8 w-8 shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {selectedTeacher?.fullName ?? "—"}
                                        </div>
                                        {selectedTeacher?.email && (
                                            <div className="text-xs text-muted-foreground truncate">
                                                {selectedTeacher.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <FieldError message={errors.teacher_id} />
                        </div>

                        <Separator />

                        {/* Position + Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>Position</FieldLabel>
                                {isEdit ? (
                                    <>
                                        <Select
                                            value={position}
                                            onValueChange={(v) => {
                                                setPosition(v);
                                                clearError("position");
                                            }}
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    errors.position &&
                                                        "border-rose-500/50",
                                                )}
                                            >
                                                <SelectValue placeholder="Select position..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {POSITIONS.map((p) => (
                                                    <SelectItem
                                                        key={p}
                                                        value={p}
                                                    >
                                                        {p}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError message={errors.position} />
                                    </>
                                ) : (
                                    <ReadOnlyField
                                        label=""
                                        value={row.position}
                                    />
                                )}
                            </div>
                            <div>
                                <FieldLabel>Appointment Type</FieldLabel>
                                {isEdit ? (
                                    <>
                                        <Select
                                            value={appointmentType}
                                            onValueChange={(v) => {
                                                setAppointmentType(v);
                                                clearError("appointment_type");
                                            }}
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
                                                    <SelectItem
                                                        key={t}
                                                        value={t}
                                                    >
                                                        {t}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError
                                            message={errors.appointment_type}
                                        />
                                    </>
                                ) : (
                                    <ReadOnlyField
                                        label=""
                                        value={row.appointment_type}
                                    />
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* School */}
                        <div>
                            <FieldLabel optional>School Name</FieldLabel>
                            {isEdit ? (
                                <Input
                                    value={schoolName}
                                    onChange={(e) =>
                                        setSchoolName(e.target.value)
                                    }
                                    placeholder="e.g. Ormoc City National High School"
                                />
                            ) : (
                                <ReadOnlyField
                                    label=""
                                    value={(row as any).school_name}
                                />
                            )}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isEdit ? (
                                <>
                                    <DatePickerField
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(d) => {
                                            setStartDate(d);
                                            clearError("start_date");
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
                                            clearError("end_date");
                                        }}
                                        error={errors.end_date}
                                        optional
                                        minDate={startDate}
                                    />
                                </>
                            ) : (
                                <>
                                    <ReadOnlyField
                                        label="Start Date"
                                        value={fmt(row.start_date)}
                                    />
                                    <ReadOnlyField
                                        label="End Date"
                                        value={fmt(row.end_date)}
                                    />
                                </>
                            )}
                        </div>

                        <Separator />

                        {/* Memo No */}
                        <div>
                            <FieldLabel optional>Memo No.</FieldLabel>
                            {isEdit ? (
                                <Input
                                    value={memoNo}
                                    onChange={(e) => setMemoNo(e.target.value)}
                                    placeholder="e.g. DepEd-2024-001"
                                />
                            ) : (
                                <ReadOnlyField label="" value={row.memo_no} />
                            )}
                        </div>

                        {/* Remarks */}
                        <div>
                            <FieldLabel optional>Remarks</FieldLabel>
                            {isEdit ? (
                                <div className="space-y-2">
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
                                    {remarksOption ===
                                        "Other (specify below)" && (
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
                            ) : (
                                <ReadOnlyField label="" value={row.remarks} />
                            )}
                        </div>

                        {/* Meta */}
                        {!isEdit && (
                            <>
                                <Separator />
                                <div className="grid grid-cols-2 gap-3">
                                    <ReadOnlyField
                                        label="Created At"
                                        value={fmt(row.created_at)}
                                    />
                                    <ReadOnlyField
                                        label="Status"
                                        value={row.status}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-3 flex gap-2">
                        {isEdit ? (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => setMode("view")}
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={submitting}
                                    className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-3.5 w-3.5" />
                                    )}
                                    {submitting ? "Saving..." : "Save Changes"}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                className="flex-1"
                            >
                                Close
                            </Button>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete confirmation */}
            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div>
                                This will permanently delete the appointment
                                record for{" "}
                                <span className="font-medium text-foreground">
                                    {selectedTeacher?.fullName}
                                </span>
                                . This action cannot be undone.
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <TeacherPickerModal
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                selectedId={teacherId}
                onSelect={(t) => {
                    setSelectedTeacher(t);
                    setTeacherId(t.id);
                    clearError("teacher_id");
                }}
            />
        </>
    );
}
