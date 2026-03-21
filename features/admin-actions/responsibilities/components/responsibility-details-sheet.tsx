/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
    ClipboardList,
    Pencil,
    X,
    Send,
    Loader2,
    BookOpen,
    Users,
    MoreHorizontal,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import InitialAvatar from "@/components/ui-elements/avatars/avatar-color";
import {
    TeacherPickerModal,
    type TeacherOption,
} from "@/components/teacher-picker-modal";
import { updateResponsibility } from "@/features/admin-actions/responsibilities/actions/admin-responsibility-actions";
import type { ResponsibilityWithTeacher } from "@/features/admin-actions/responsibilities/types/responsibility";

// ── Constants (shared with add sheet) ─────────────────────────────────────────

const SUBJECTS = [
    "Mathematics",
    "Science",
    "English",
    "Filipino",
    "Araling Panlipunan",
    "MAPEH",
    "TLE",
    "Values Education",
    "Computer Science",
    "Earth Science",
    "Biology",
    "Chemistry",
    "Physics",
    "Statistics",
    "Oral Communication",
    "Other",
];

const GRADE_LEVELS = [
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
];

const DAYS = [
    { key: "M", label: "M", full: "Monday" },
    { key: "T", label: "T", full: "Tuesday" },
    { key: "W", label: "W", full: "Wednesday" },
    { key: "Th", label: "Th", full: "Thursday" },
    { key: "F", label: "F", full: "Friday" },
    { key: "Sa", label: "Sa", full: "Saturday" },
];

const DAY_FULL: Record<string, string> = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
    Sa: "Saturday",
};

const HOURS = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return {
        value: String(h).padStart(2, "0"),
        label: String(h).padStart(2, "0"),
    };
});

const MINUTES = [
    "00",
    "05",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55",
].map((m) => ({ value: m, label: m }));

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

type ScheduleBlock = {
    id: string;
    days: string[];
    startTime: string;
    endTime: string;
};

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

const EMPTY_BLOCK = (): ScheduleBlock => ({
    id: Math.random().toString(36).slice(2),
    days: [],
    startTime: "",
    endTime: "",
});

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
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground min-h-9 flex items-center">
                {value || <span className="text-muted-foreground">—</span>}
            </div>
        </div>
    );
}

function TimePicker({
    value,
    onChange,
    error,
    placeholder,
}: {
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
        <div
            className={cn(
                "flex items-center gap-2 rounded-md border bg-background px-3 py-2 w-full",
                error && "border-rose-500/50",
            )}
        >
            <Select
                value={parsed.hour}
                onValueChange={(v) => update("hour", v)}
            >
                <SelectTrigger className="h-6 w-14 border-0 p-0 text-sm font-mono shadow-none focus:ring-0 bg-transparent">
                    <SelectValue placeholder={placeholder ?? "HH"} />
                </SelectTrigger>
                <SelectContent className="min-w-[4rem]">
                    {HOURS.map((h) => (
                        <SelectItem
                            key={h.value}
                            value={h.value}
                            className="text-xs font-mono"
                        >
                            {h.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground font-mono">:</span>
            <Select
                value={parsed.minute}
                onValueChange={(v) => update("minute", v)}
            >
                <SelectTrigger className="h-6 w-14 border-0 p-0 text-sm font-mono shadow-none focus:ring-0 bg-transparent">
                    <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="min-w-[4rem]">
                    {MINUTES.map((m) => (
                        <SelectItem
                            key={m.value}
                            value={m.value}
                            className="text-xs font-mono"
                        >
                            {m.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex rounded border border-border/60 overflow-hidden ml-1">
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

function DayPicker({
    value,
    onChange,
    disabled,
}: {
    value: string[];
    onChange: (d: string[]) => void;
    disabled?: boolean;
}) {
    const toggle = (key: string) => {
        if (disabled) return;
        onChange(
            value.includes(key)
                ? value.filter((d) => d !== key)
                : [...value, key],
        );
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
                        disabled={disabled}
                        className={cn(
                            "h-8 min-w-[2rem] px-2.5 rounded-md border text-xs font-semibold transition-all",
                            active
                                ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                : "bg-muted/20 border-border/60 text-muted-foreground",
                            !disabled &&
                                !active &&
                                "hover:bg-muted/40 hover:text-foreground",
                            disabled && "opacity-60 cursor-not-allowed",
                        )}
                    >
                        {d.label}
                    </button>
                );
            })}
        </div>
    );
}

// ── Type config ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
    string,
    { label: string; color: string; icon: React.ElementType }
> = {
    TEACHING_LOAD: {
        label: "Teaching Load",
        color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
        icon: BookOpen,
    },
    COORDINATOR: {
        label: "Coordinator Role",
        color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
        icon: Users,
    },
    OTHER: {
        label: "Other Duties",
        color: "text-orange-400 border-orange-500/20 bg-orange-500/10",
        icon: MoreHorizontal,
    },
};

// ── Main component ─────────────────────────────────────────────────────────────

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    responsibility: ResponsibilityWithTeacher | null;
    onSuccess: () => void;
};

export function ResponsibilityDetailSheet({
    open,
    onOpenChange,
    responsibility,
    onSuccess,
}: Props) {
    const isMobile = useIsMobile();
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [submitting, setSubmitting] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    // Edit state
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [selectedTeacher, setSelectedTeacher] =
        useState<TeacherOption | null>(null);
    const [details, setDetails] = useState<Record<string, any>>({});
    const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([
        EMPTY_BLOCK(),
    ]);

    const typeConfig =
        TYPE_CONFIG[responsibility?.type ?? ""] ?? TYPE_CONFIG.OTHER;
    const TypeIcon = typeConfig.icon;

    // Populate form from responsibility
    useEffect(() => {
        if (!responsibility) return;
        setMode("view");
        setTitle(responsibility.title);
        setType(responsibility.type);
        setTeacherId(responsibility.teacher_id);
        setDetails({ ...(responsibility.details as Record<string, any>) });
        setSelectedTeacher(
            responsibility.teacher
                ? {
                      id: responsibility.teacher_id,
                      fullName: `${responsibility.teacher.firstName} ${responsibility.teacher.lastName}`,
                      employeeId: "",
                      position: "",
                      email: responsibility.teacher.email ?? "",
                      profileImage: null,
                  }
                : null,
        );
        setScheduleBlocks([EMPTY_BLOCK()]);
    }, [responsibility]);

    const handleClose = () => {
        if (submitting) return;
        onOpenChange(false);
        setTimeout(() => setMode("view"), 300);
    };

    const setDetail = (key: string, val: any) => {
        setDetails((d) => ({ ...d, [key]: val }));
    };

    const updateBlock = (id: string, updated: ScheduleBlock) =>
        setScheduleBlocks((prev) =>
            prev.map((b) => (b.id === id ? updated : b)),
        );

    const handleSave = async () => {
        if (!responsibility) return;
        if (!title.trim()) {
            toast.error("Title is required.");
            return;
        }

        // Build schedule string
        const scheduleString = scheduleBlocks
            .filter((b) => b.days.length > 0 || b.startTime)
            .map(formatScheduleReadable)
            .filter(Boolean)
            .join("; ");

        const subjectValue =
            details.subject === "Other"
                ? (details.customSubject ?? "")
                : (details.subject ?? "");

        const cleanDetails = {
            ...details,
            subject: subjectValue,
            schedule: scheduleString || undefined,
            customSubject: undefined,
        };

        setSubmitting(true);
        try {
            await updateResponsibility(responsibility.id, {
                teacher_id: teacherId,
                type,
                title,
                details: cleanDetails,
            });
            toast.success("Responsibility updated.");
            setMode("view");
            onSuccess();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!responsibility) return null;

    const det = (responsibility.details ?? {}) as Record<string, any>;
    const isEdit = mode === "edit";

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
                            <div className="flex items-center gap-2 min-w-0">
                                <div
                                    className={cn(
                                        "rounded-lg border p-2 shrink-0",
                                        typeConfig.color,
                                    )}
                                >
                                    <TypeIcon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span
                                            className={cn(
                                                "inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                                                typeConfig.color,
                                            )}
                                        >
                                            {typeConfig.label}
                                        </span>
                                        {isEdit && (
                                            <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                                                Editing
                                            </span>
                                        )}
                                    </div>
                                    <SheetTitle className="text-base leading-snug break-words whitespace-normal">
                                        {isEdit
                                            ? title || "Edit Responsibility"
                                            : responsibility.title}
                                    </SheetTitle>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {mode === "view" && (
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
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={handleClose}
                                    disabled={submitting}
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
                        </div>

                        <Separator />

                        {/* Type */}
                        <div>
                            <FieldLabel>Type</FieldLabel>
                            {isEdit ? (
                                <Select
                                    value={type}
                                    onValueChange={(v) => {
                                        setType(v);
                                        setDetails({});
                                        setScheduleBlocks([EMPTY_BLOCK()]);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
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
                            ) : (
                                <ReadOnlyField
                                    label=""
                                    value={typeConfig.label}
                                />
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <FieldLabel>Title</FieldLabel>
                            {isEdit ? (
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter title..."
                                />
                            ) : (
                                <ReadOnlyField
                                    label=""
                                    value={responsibility.title}
                                />
                            )}
                        </div>

                        <Separator />

                        {/* ── Teaching Load details ── */}
                        {(isEdit ? type : responsibility.type) ===
                            "TEACHING_LOAD" && (
                            <div className="space-y-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Teaching Load Details
                                </p>

                                {isEdit ? (
                                    <>
                                        {/* Subject */}
                                        <div>
                                            <FieldLabel>Subject</FieldLabel>
                                            <Select
                                                value={details.subject ?? ""}
                                                onValueChange={(v) => {
                                                    setDetail("subject", v);
                                                    if (v !== "Other")
                                                        setDetail(
                                                            "customSubject",
                                                            "",
                                                        );
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select subject..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SUBJECTS.map((s) => (
                                                        <SelectItem
                                                            key={s}
                                                            value={s}
                                                        >
                                                            {s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {details.subject === "Other" && (
                                                <Input
                                                    className="mt-2"
                                                    value={
                                                        details.customSubject ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setDetail(
                                                            "customSubject",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter subject name..."
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                        {/* Grade + Section */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <FieldLabel>
                                                    Grade Level
                                                </FieldLabel>
                                                <Select
                                                    value={details.grade ?? ""}
                                                    onValueChange={(v) =>
                                                        setDetail("grade", v)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select grade..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {GRADE_LEVELS.map(
                                                            (g) => (
                                                                <SelectItem
                                                                    key={g}
                                                                    value={g}
                                                                >
                                                                    {g}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <FieldLabel optional>
                                                    Section
                                                </FieldLabel>
                                                <Input
                                                    value={
                                                        details.section ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setDetail(
                                                            "section",
                                                            e.target.value,
                                                        )
                                                    }
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
                                                        onClick={() =>
                                                            setScheduleBlocks(
                                                                (p) => [
                                                                    ...p,
                                                                    EMPTY_BLOCK(),
                                                                ],
                                                            )
                                                        }
                                                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                                    >
                                                        <Plus className="h-3 w-3" />{" "}
                                                        Add schedule
                                                    </button>
                                                )}
                                            </div>
                                            {scheduleBlocks.map((block, i) => {
                                                const preview =
                                                    formatScheduleReadable(
                                                        block,
                                                    );
                                                return (
                                                    <div
                                                        key={block.id}
                                                        className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                                Schedule{" "}
                                                                {scheduleBlocks.length >
                                                                1
                                                                    ? i + 1
                                                                    : ""}
                                                            </span>
                                                            {scheduleBlocks.length >
                                                                1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setScheduleBlocks(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.filter(
                                                                                    (
                                                                                        b,
                                                                                    ) =>
                                                                                        b.id !==
                                                                                        block.id,
                                                                                ),
                                                                        )
                                                                    }
                                                                    className="text-muted-foreground/50 hover:text-rose-400 transition-colors"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-[11px] text-muted-foreground mb-1.5 block">
                                                                Days
                                                            </span>
                                                            <DayPicker
                                                                value={
                                                                    block.days
                                                                }
                                                                onChange={(
                                                                    days,
                                                                ) =>
                                                                    updateBlock(
                                                                        block.id,
                                                                        {
                                                                            ...block,
                                                                            days,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <span className="text-[11px] text-muted-foreground block">
                                                                Time
                                                            </span>
                                                            <div>
                                                                <span className="text-[10px] text-muted-foreground/60 mb-1 block">
                                                                    Start
                                                                </span>
                                                                <TimePicker
                                                                    value={
                                                                        block.startTime
                                                                    }
                                                                    onChange={(
                                                                        v,
                                                                    ) =>
                                                                        updateBlock(
                                                                            block.id,
                                                                            {
                                                                                ...block,
                                                                                startTime:
                                                                                    v,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="HH"
                                                                />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-muted-foreground/60 mb-1 block">
                                                                    End
                                                                </span>
                                                                <TimePicker
                                                                    value={
                                                                        block.endTime
                                                                    }
                                                                    onChange={(
                                                                        v,
                                                                    ) =>
                                                                        updateBlock(
                                                                            block.id,
                                                                            {
                                                                                ...block,
                                                                                endTime:
                                                                                    v,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="HH"
                                                                />
                                                            </div>
                                                        </div>
                                                        {preview && (
                                                            <div className="rounded-md bg-blue-500/5 border border-blue-500/20 px-3 py-2 text-xs text-blue-300/80">
                                                                <span className="font-medium text-blue-400/70">
                                                                    Preview:{" "}
                                                                </span>
                                                                {preview}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <ReadOnlyField
                                            label="Subject"
                                            value={det.subject}
                                        />
                                        <ReadOnlyField
                                            label="Grade Level"
                                            value={det.grade}
                                        />
                                        <ReadOnlyField
                                            label="Section"
                                            value={det.section}
                                        />
                                        <ReadOnlyField
                                            label="Schedule"
                                            value={det.schedule}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Coordinator details ── */}
                        {(isEdit ? type : responsibility.type) ===
                            "COORDINATOR" && (
                            <div className="space-y-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Coordinator Details
                                </p>
                                {isEdit ? (
                                    <div>
                                        <FieldLabel>Role</FieldLabel>
                                        <Input
                                            value={details.role ?? ""}
                                            onChange={(e) =>
                                                setDetail(
                                                    "role",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Department Head"
                                        />
                                    </div>
                                ) : (
                                    <ReadOnlyField
                                        label="Role"
                                        value={det.role}
                                    />
                                )}
                            </div>
                        )}

                        {/* ── Other details ── */}
                        {(isEdit ? type : responsibility.type) === "OTHER" && (
                            <div className="space-y-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Other Duty Details
                                </p>
                                {isEdit ? (
                                    <>
                                        <div>
                                            <FieldLabel optional>
                                                Organization / Committee
                                            </FieldLabel>
                                            <Input
                                                value={
                                                    details.organization ?? ""
                                                }
                                                onChange={(e) =>
                                                    setDetail(
                                                        "organization",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Math Club"
                                            />
                                        </div>
                                        <div>
                                            <FieldLabel optional>
                                                Description
                                            </FieldLabel>
                                            <textarea
                                                rows={3}
                                                value={
                                                    details.description ?? ""
                                                }
                                                onChange={(e) =>
                                                    setDetail(
                                                        "description",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Brief description..."
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ReadOnlyField
                                            label="Organization"
                                            value={det.organization}
                                        />
                                        <ReadOnlyField
                                            label="Description"
                                            value={det.description}
                                        />
                                    </>
                                )}
                            </div>
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

            <TeacherPickerModal
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                selectedId={teacherId}
                onSelect={(t) => {
                    setSelectedTeacher(t);
                    setTeacherId(t.id);
                }}
            />
        </>
    );
}
