/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Send, ClipboardList, BookOpen, Users, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "sonner";
import { addResponsibility } from "@/features/admin-actions/responsibilities/actions/admin-responsibility-actions";
import type {
    AddResponsibilityForm,
    ResponsibilityType,
} from "@/features/admin-actions/responsibilities/types/responsibility";
import {
    TeacherPickerModal,
    type TeacherOption,
} from "@/components/teacher-picker-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type ScheduleBlock = {
    id: string;
    days: string[];
    startTime: string;
    endTime: string;
};

const EMPTY_BLOCK = (): ScheduleBlock => ({
    id: Math.random().toString(36).slice(2),
    days: [],
    startTime: "",
    endTime: "",
});

const EMPTY: AddResponsibilityForm = {
    teacher_id: "",
    type: "",
    title: "",
    details: {},
};

type FormErrors = Partial<Record<string, string>>;

// ── Constants ──────────────────────────────────────────────────────────────────

const DAYS = [
    { key: "M",  label: "M",  full: "Monday"    },
    { key: "T",  label: "T",  full: "Tuesday"   },
    { key: "W",  label: "W",  full: "Wednesday" },
    { key: "Th", label: "Th", full: "Thursday"  },
    { key: "F",  label: "F",  full: "Friday"    },
    { key: "Sa", label: "Sa", full: "Saturday"  },
];

const DAY_FULL: Record<string, string> = {
    M: "Monday", T: "Tuesday", W: "Wednesday",
    Th: "Thursday", F: "Friday", Sa: "Saturday",
};

const SUBJECTS = [
    "Mathematics", "Science", "English", "Filipino",
    "Araling Panlipunan", "MAPEH", "TLE", "Values Education",
    "Computer Science", "Earth Science", "Biology", "Chemistry",
    "Physics", "Statistics", "Oral Communication", "Other",
];

const GRADE_LEVELS = [
    "Grade 7", "Grade 8", "Grade 9", "Grade 10",
    "Grade 11", "Grade 12",
];

const HOURS = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return { value: String(h).padStart(2, "0"), label: String(h).padStart(2, "0") };
});

const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
    (m) => ({ value: m, label: m })
);

// ── Time helpers ───────────────────────────────────────────────────────────────

function parse24h(time: string) {
    if (!time) return { hour: "", minute: "00", ampm: "AM" };
    const [hStr, mStr] = time.split(":");
    const h24 = parseInt(hStr ?? "0", 10);
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    return { hour: String(h12).padStart(2, "0"), minute: mStr ?? "00", ampm };
}

function to24h(hour: string, minute: string, ampm: string): string {
    if (!hour) return "";
    let h = parseInt(hour, 10);
    if (ampm === "AM" && h === 12) h = 0;
    if (ampm === "PM" && h !== 12) h += 12;
    return `${String(h).padStart(2, "0")}:${minute}`;
}

function format12h(time24: string): string {
    if (!time24) return "";
    const { hour, minute, ampm } = parse24h(time24);
    return `${parseInt(hour, 10)}:${minute} ${ampm}`;
}

// Human-readable schedule block: "Monday, Wednesday, Friday • 7:00 AM – 8:00 AM"
function formatScheduleReadable(block: ScheduleBlock): string {
    const dayNames = block.days.map((d) => DAY_FULL[d] ?? d).join(", ");
    const start = format12h(block.startTime);
    const end = format12h(block.endTime);
    const parts = [];
    if (dayNames) parts.push(dayNames);
    if (start && end) parts.push(`${start} – ${end}`);
    else if (start) parts.push(start);
    return parts.join(" • ");
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</span>
            {optional && <span className="text-[10px] text-muted-foreground/50 normal-case tracking-normal">optional</span>}
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-rose-400">{message}</p>;
}

function DayPicker({ value, onChange }: { value: string[]; onChange: (days: string[]) => void }) {
    const toggle = (key: string) => {
        onChange(value.includes(key) ? value.filter((d) => d !== key) : [...value, key]);
    };
    return (
        <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d) => {
                const active = value.includes(d.key);
                return (
                    <button
                        key={d.key}
                        type="button"
                        title={d.full}
                        onClick={() => toggle(d.key)}
                        className={cn(
                            "h-8 min-w-[2rem] px-2.5 rounded-md border text-xs font-semibold transition-all",
                            active
                                ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                        )}
                    >
                        {d.label}
                    </button>
                );
            })}
        </div>
    );
}

function TimePicker({ value, onChange, error, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    error?: boolean;
    placeholder?: string;
}) {
    const parsed = parse24h(value);
    const update = (field: "hour" | "minute" | "ampm", val: string) => {
        const next = { ...parsed, [field]: val };
        if (!next.hour) return;
        onChange(to24h(next.hour, next.minute, next.ampm));
    };

    return (
        <div className={cn("flex items-center gap-1 rounded-md border bg-background px-2 py-1.5 flex-1", error && "border-rose-500/50")}>
            <Select value={parsed.hour} onValueChange={(v) => update("hour", v)}>
                <SelectTrigger className="h-6 w-12 border-0 p-0 text-xs font-mono shadow-none focus:ring-0 bg-transparent">
                    <SelectValue placeholder={placeholder ?? "HH"} />
                </SelectTrigger>
                <SelectContent className="min-w-[4rem]">
                    {HOURS.map((h) => (
                        <SelectItem key={h.value} value={h.value} className="text-xs font-mono">{h.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground font-mono">:</span>
            <Select value={parsed.minute} onValueChange={(v) => update("minute", v)}>
                <SelectTrigger className="h-6 w-14 border-0 p-0 text-sm font-mono shadow-none focus:ring-0 bg-transparent">
                    <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="min-w-[4rem]">
                    {MINUTES.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="text-xs font-mono">{m.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex rounded border border-border/60 overflow-hidden ml-2">
                {["AM", "PM"].map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => update("ampm", p)}
                        className={cn(
                            "px-2 py-1 text-xs font-semibold transition-colors",
                            parsed.ampm === p
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Schedule Block ─────────────────────────────────────────────────────────────

function ScheduleBlockRow({
    block,
    index,
    total,
    onChange,
    onRemove,
    error,
}: {
    block: ScheduleBlock;
    index: number;
    total: number;
    onChange: (updated: ScheduleBlock) => void;
    onRemove: () => void;
    error?: string;
}) {
    const preview = formatScheduleReadable(block);

    return (
        <div className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-3">
            {/* Block header */}
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Schedule {total > 1 ? index + 1 : ""}
                </span>
                {total > 1 && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-muted-foreground/50 hover:text-rose-400 transition-colors"
                        title="Remove schedule"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Days */}
            <div>
                <span className="text-[11px] text-muted-foreground mb-1.5 block">Days</span>
                <DayPicker
                    value={block.days}
                    onChange={(days) => onChange({ ...block, days })}
                />
            </div>

            {/* Time */}
            <div>
                <span className="text-[11px] text-muted-foreground mb-1.5 block">Time</span>
                <div className="space-y-2">
                    <div>
                        <span className="text-[10px] text-muted-foreground/60 mb-1 block">Start</span>
                        <TimePicker
                            value={block.startTime}
                            onChange={(v) => onChange({ ...block, startTime: v })}
                            error={!!error}
                            placeholder="HH"
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-muted-foreground/60 mb-1 block">End</span>
                        <TimePicker
                            value={block.endTime}
                            onChange={(v) => onChange({ ...block, endTime: v })}
                            error={!!error}
                            placeholder="HH"
                        />
                    </div>
                </div>
                {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
            </div>

            {/* Human-readable preview */}
            {preview && (
                <div className="rounded-md bg-blue-500/5 border border-blue-500/20 px-3 py-2 text-xs text-blue-300/80">
                    <span className="font-medium text-blue-400/70">Preview: </span>
                    {preview}
                </div>
            )}
        </div>
    );
}

// ── Validation ─────────────────────────────────────────────────────────────────

function validate(form: AddResponsibilityForm, scheduleBlocks: ScheduleBlock[]): FormErrors {
    const errors: FormErrors = {};

    if (!form.teacher_id) errors.teacher_id = "Please select a teacher.";
    if (!form.type) errors.type = "Please select a responsibility type.";

    if (!form.title.trim()) {
        errors.title = "Title is required.";
    } else if (form.title.trim().length < 3) {
        errors.title = "Title must be at least 3 characters.";
    } else if (form.title.trim().length > 100) {
        errors.title = "Title must be 100 characters or fewer.";
    }

    if (form.type === "TEACHING_LOAD") {
        if (!form.details.subject?.trim()) errors["details.subject"] = "Subject is required.";
        if (form.details.subject === "Other" && !form.details.customSubject?.trim()) {
            errors["details.customSubject"] = "Please specify the subject.";
        }
        if (!form.details.grade?.trim()) errors["details.grade"] = "Grade level is required.";

        scheduleBlocks.forEach((block, i) => {
            if (block.startTime && block.endTime && block.startTime >= block.endTime) {
                errors[`schedule.${i}.time`] = "End time must be after start time.";
            }
        });
    }

    if (form.type === "COORDINATOR") {
        if (!form.details.role?.trim()) errors["details.role"] = "Role is required.";
    }

    if (form.type === "OTHER") {
        if (form.details.description && form.details.description.length > 300) {
            errors["details.description"] = "Description must be 300 characters or fewer.";
        }
    }

    return errors;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AddResponsibilitySheet(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const { open, onOpenChange, onSuccess } = props;
    const isMobile = useIsMobile();

    const [pickerOpen, setPickerOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(null);
    const [form, setForm] = useState<AddResponsibilityForm>(EMPTY);
    const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([EMPTY_BLOCK()]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const setDetail = (key: string) => (val: string | string[]) => {
        setForm((f) => ({ ...f, details: { ...f.details, [key]: val } }));
        setErrors((e) => { const next = { ...e }; delete next[`details.${key}`]; return next; });
    };

    const clearError = (key: string) => () =>
        setErrors((e) => { const next = { ...e }; delete next[key]; return next; });

    const updateBlock = (id: string, updated: ScheduleBlock) => {
        setScheduleBlocks((prev) => prev.map((b) => b.id === id ? updated : b));
        // clear time errors for this block
        const idx = scheduleBlocks.findIndex((b) => b.id === id);
        setErrors((e) => { const next = { ...e }; delete next[`schedule.${idx}.time`]; return next; });
    };

    const addBlock = () => setScheduleBlocks((prev) => [...prev, EMPTY_BLOCK()]);

    const removeBlock = (id: string) =>
        setScheduleBlocks((prev) => prev.filter((b) => b.id !== id));

    const handleClose = () => {
        if (submitting) return;
        onOpenChange(false);
        setTimeout(() => {
            setForm(EMPTY);
            setScheduleBlocks([EMPTY_BLOCK()]);
            setErrors({});
            setSelectedTeacher(null);
        }, 300);
    };

    const handleSubmit = async () => {
        const errs = validate(form, scheduleBlocks);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        // Build schedule string from all blocks
        const scheduleString = scheduleBlocks
            .filter((b) => b.days.length > 0 || b.startTime)
            .map((b) => formatScheduleReadable(b))
            .filter(Boolean)
            .join("; ");

        // Resolve subject
        const subjectValue = form.details.subject === "Other"
            ? form.details.customSubject ?? ""
            : form.details.subject ?? "";

        const cleanedForm: AddResponsibilityForm = {
            ...form,
            details: {
                ...form.details,
                subject: subjectValue,
                schedule: scheduleString || undefined,
                customSubject: undefined,
            },
        };

        setSubmitting(true);
        try {
            await addResponsibility(cleanedForm);
            toast.success("Responsibility assigned successfully.");
            handleClose();
            onSuccess();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to assign.");
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
                        isMobile ? "h-[95vh] rounded-t-2xl" : "w-[480px] sm:w-[520px]",
                    )}
                >
                    {/* Header */}
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 shrink-0">
                                <ClipboardList className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                                        New Assignment
                                    </span>
                                </div>
                                <SheetTitle className="text-base leading-snug">
                                    Assign Responsibility
                                </SheetTitle>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Body */}
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
                                {selectedTeacher ? selectedTeacher.fullName : "Select teacher..."}
                            </Button>
                            <FieldError message={errors.teacher_id} />
                        </div>

                        <Separator />

                        {/* Type */}
                        <div>
                            <FieldLabel>Responsibility Type</FieldLabel>
                            <Select
                                value={form.type}
                                onValueChange={(v) => {
                                    setForm((f) => ({ ...f, type: v as ResponsibilityType, details: {}, title: "" }));
                                    setScheduleBlocks([EMPTY_BLOCK()]);
                                    setErrors({});
                                }}
                            >
                                <SelectTrigger className={cn(errors.type && "border-rose-500/50")}>
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEACHING_LOAD">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                                            Teaching Load
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="COORDINATOR">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5 text-emerald-400" />
                                            Coordinator Role
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="OTHER">
                                        <div className="flex items-center gap-2">
                                            <MoreHorizontal className="h-3.5 w-3.5 text-orange-400" />
                                            Other Duties
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.type} />
                        </div>

                        {/* Title */}
                        <div>
                            <FieldLabel>Title</FieldLabel>
                            <Input
                                value={form.title}
                                onChange={(e) => {
                                    setForm((f) => ({ ...f, title: e.target.value }));
                                    clearError("title")();
                                }}
                                placeholder={
                                    form.type === "TEACHING_LOAD" ? "e.g. Math 8 - Section A"
                                    : form.type === "COORDINATOR" ? "e.g. Science Department Head"
                                    : form.type === "OTHER" ? "e.g. Club Adviser - Math Club"
                                    : "Enter a title..."
                                }
                                className={cn(errors.title && "border-rose-500/50")}
                            />
                            <div className="flex items-center justify-between mt-1">
                                <FieldError message={errors.title} />
                                <span className={cn(
                                    "text-[10px] ml-auto",
                                    form.title.length > 90 ? "text-rose-400" : "text-muted-foreground/50"
                                )}>
                                    {form.title.length}/100
                                </span>
                            </div>
                        </div>

                        {/* ── Teaching Load fields ── */}
                        {form.type === "TEACHING_LOAD" && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Teaching Load Details
                                    </p>

                                    {/* Subject */}
                                    <div>
                                        <FieldLabel>Subject</FieldLabel>
                                        <Select
                                            value={form.details.subject ?? ""}
                                            onValueChange={(v) => {
                                                setDetail("subject")(v);
                                                if (v !== "Other") setDetail("customSubject")("");
                                            }}
                                        >
                                            <SelectTrigger className={cn(errors["details.subject"] && "border-rose-500/50")}>
                                                <SelectValue placeholder="Select subject..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SUBJECTS.map((s) => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError message={errors["details.subject"]} />
                                        {form.details.subject === "Other" && (
                                            <div className="mt-2">
                                                <Input
                                                    value={form.details.customSubject ?? ""}
                                                    onChange={(e) => setDetail("customSubject")(e.target.value)}
                                                    placeholder="Enter subject name..."
                                                    className={cn(errors["details.customSubject"] && "border-rose-500/50")}
                                                    autoFocus
                                                />
                                                <FieldError message={errors["details.customSubject"]} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Grade Level + Section */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <FieldLabel>Grade Level</FieldLabel>
                                            <Select
                                                value={form.details.grade ?? ""}
                                                onValueChange={(v) => setDetail("grade")(v)}
                                            >
                                                <SelectTrigger className={cn(errors["details.grade"] && "border-rose-500/50")}>
                                                    <SelectValue placeholder="Select grade..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GRADE_LEVELS.map((g) => (
                                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError message={errors["details.grade"]} />
                                        </div>
                                        <div>
                                            <FieldLabel optional>Section</FieldLabel>
                                            <Input
                                                value={form.details.section ?? ""}
                                                onChange={(e) => setDetail("section")(e.target.value)}
                                                placeholder="e.g. Rizal"
                                            />
                                        </div>
                                    </div>

                                    {/* Schedule blocks */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Schedule
                                            </p>
                                            {scheduleBlocks.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={addBlock}
                                                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Add schedule
                                                </button>
                                            )}
                                        </div>

                                        {scheduleBlocks.map((block, i) => (
                                            <ScheduleBlockRow
                                                key={block.id}
                                                block={block}
                                                index={i}
                                                total={scheduleBlocks.length}
                                                onChange={(updated) => updateBlock(block.id, updated)}
                                                onRemove={() => removeBlock(block.id)}
                                                error={errors[`schedule.${i}.time`]}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Coordinator fields ── */}
                        {form.type === "COORDINATOR" && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Coordinator Details
                                    </p>
                                    <div>
                                        <FieldLabel>Role</FieldLabel>
                                        <Input
                                            value={form.details.role ?? ""}
                                            onChange={(e) => setDetail("role")(e.target.value)}
                                            placeholder="e.g. Department Head"
                                            className={cn(errors["details.role"] && "border-rose-500/50")}
                                        />
                                        <FieldError message={errors["details.role"]} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Other Duties fields ── */}
                        {form.type === "OTHER" && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Other Duty Details
                                    </p>
                                    <div>
                                        <FieldLabel optional>Organization / Committee</FieldLabel>
                                        <Input
                                            value={form.details.organization ?? ""}
                                            onChange={(e) => setDetail("organization")(e.target.value)}
                                            placeholder="e.g. Math Club"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel optional>Description</FieldLabel>
                                        <Textarea
                                            rows={3}
                                            value={form.details.description ?? ""}
                                            onChange={(e) => setDetail("description")(e.target.value)}
                                            placeholder="Brief description of the duty..."
                                            className={cn(errors["details.description"] && "border-rose-500/50")}
                                        />
                                        <div className="flex items-center justify-between mt-1">
                                            <FieldError message={errors["details.description"]} />
                                            <span className={cn(
                                                "text-[10px] ml-auto",
                                                (form.details.description?.length ?? 0) > 280 ? "text-rose-400" : "text-muted-foreground/50"
                                            )}>
                                                {form.details.description?.length ?? 0}/300
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
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
                            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Send className="h-3.5 w-3.5" />
                            {submitting ? "Assigning..." : "Assign"}
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
                    setErrors((e) => { const next = { ...e }; delete next.teacher_id; return next; });
                }}
            />
        </>
    );
}