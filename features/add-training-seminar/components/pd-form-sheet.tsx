"use client";

import { useState, useRef, useEffect } from "react";
import {
    Loader2,
    Plus,
    Pencil,
    Eye,
    X,
    Trash2,
    UserPlus,
    Lock,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypeBadge, LevelBadge } from "@/components/ui-elements/badges";
import { MONTHS, MONTHS_SHORT, DAYS } from "@/enums/date";
import { TrainingLevel } from "@/enums/level";

export type Mode = "create" | "edit" | "view";

export type FormData = {
    title: string;
    type: "TRAINING" | "SEMINAR";
    level: keyof typeof TrainingLevel;
    sponsoring_agency: string;
    total_hours: string;
    start_date: Date | undefined;
    end_date: Date | undefined;
    venue: string;
    description: string;
};

interface PdFormSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    mode: Mode;
    formData: FormData;
    setFormData: (data: FormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    isPast?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onAssign?: () => void;
}

const modeConfig = {
    create: {
        icon: Plus,
        iconBg: "bg-teal-500/10 border-teal-500/20",
        iconColor: "text-teal-400",
        badge: "bg-teal-500/10 text-teal-400 border-teal-500/30",
        badgeLabel: "New Record",
        title: "Add Training or Seminar",
        submitLabel: "Create",
        submittingLabel: "Creating...",
        submitCls: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    edit: {
        icon: Pencil,
        iconBg: "bg-blue-500/10 border-blue-500/20",
        iconColor: "text-blue-400",
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        badgeLabel: "Editing",
        title: "Edit Training/Seminar",
        submitLabel: "Save Changes",
        submittingLabel: "Saving...",
        submitCls: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    view: {
        icon: Eye,
        iconBg: "bg-violet-500/10 border-violet-500/20",
        iconColor: "text-violet-400",
        badge: "bg-violet-500/10 text-violet-400 border-violet-500/30",
        badgeLabel: "Details",
        title: "Training/Seminar Details",
        submitLabel: "",
        submittingLabel: "",
        submitCls: "",
    },
};

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

const YEAR_RANGE_BACK = 10;
const YEAR_RANGE_FORWARD = 5;

// Derive ordered string arrays from numeric enums (strips reverse-mapping keys)
const MONTHS_LIST = Object.keys(MONTHS).filter((k) =>
    isNaN(Number(k)),
) as string[];
const MONTHS_SHORT_LIST = Object.keys(MONTHS_SHORT).filter((k) =>
    isNaN(Number(k)),
) as string[];
const DAYS_LIST = Object.keys(DAYS).filter((k) => isNaN(Number(k))) as string[];

function pad(n: number) {
    return n < 10 ? `0${n}` : String(n);
}
function toKey(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function PickerOverlay({
    viewYear,
    viewMonth,
    pickerYear,
    today,
    setPickerYear,
    selectMonthYear,
}: {
    viewYear: number;
    viewMonth: number;
    pickerYear: number;
    today: Date;
    setPickerYear: React.Dispatch<React.SetStateAction<number>>;
    selectMonthYear: (month: number) => void;
}) {
    const currentYear = today.getFullYear();
    const years = Array.from(
        { length: YEAR_RANGE_BACK + YEAR_RANGE_FORWARD + 1 },
        (_, i) => currentYear - YEAR_RANGE_BACK + i,
    );
    const yearListRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = yearListRef.current?.querySelector(
            `[data-year="${pickerYear}"]`,
        ) as HTMLElement | null;
        if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
    }, [pickerYear]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-[2.75rem] z-20 mx-3 rounded-lg border bg-card shadow-lg p-3"
        >
            <div className="flex gap-3">
                <div className="flex flex-col gap-0.5 w-16 shrink-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 text-center">
                        Year
                    </p>
                    <div
                        ref={yearListRef}
                        className="overflow-y-auto max-h-[168px] flex flex-col gap-0.5"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {years.map((y) => {
                            const isPickerYear = y === pickerYear;
                            const isViewYear = y === viewYear;
                            const isTodayYear = y === currentYear;
                            return (
                                <button
                                    key={y}
                                    data-year={y}
                                    type="button"
                                    onClick={() => setPickerYear(y)}
                                    className={[
                                        "rounded-md py-1.5 text-sm w-full transition-colors",
                                        isPickerYear
                                            ? "bg-blue-500/20 text-blue-300 font-semibold"
                                            : isViewYear
                                              ? "bg-muted/50 text-foreground font-semibold"
                                              : isTodayYear
                                                ? "border border-blue-500/30 text-blue-300 hover:bg-accent"
                                                : "hover:bg-accent text-foreground/80",
                                    ].join(" ")}
                                >
                                    {y}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="w-px bg-border/40 self-stretch" />
                <div className="flex-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 text-center">
                        Month
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                        {MONTHS_SHORT_LIST.map((m, i) => {
                            const isCurrent =
                                i === viewMonth && pickerYear === viewYear;
                            const isNow =
                                i === today.getMonth() &&
                                pickerYear === today.getFullYear();
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => selectMonthYear(i)}
                                    className={[
                                        "rounded-md py-2 text-sm transition-colors",
                                        isCurrent
                                            ? "bg-blue-500/20 text-blue-300 font-semibold"
                                            : isNow
                                              ? "border border-amber-500/40 text-amber-300 font-semibold hover:bg-accent"
                                              : "hover:bg-accent text-foreground/80",
                                    ].join(" ")}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function RangeDatePicker({
    startDate,
    endDate,
    onChange,
    disabled,
}: {
    startDate: Date | undefined;
    endDate: Date | undefined;
    onChange: (start: Date | undefined, end: Date | undefined) => void;
    disabled?: boolean;
}) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(
        startDate?.getFullYear() ?? today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = useState(
        startDate?.getMonth() ?? today.getMonth(),
    );
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(
        startDate?.getFullYear() ?? today.getFullYear(),
    );

    const todayKey = toKey(today);
    const startKey = startDate ? toKey(startDate) : null;
    const endKey = endDate ? toKey(endDate) : null;

    const phase: "none" | "start-only" | "complete" = !startDate
        ? "none"
        : !endDate
          ? "start-only"
          : "complete";

    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();
    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewYear((y) => y - 1);
            setViewMonth(11);
        } else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewYear((y) => y + 1);
            setViewMonth(0);
        } else setViewMonth((m) => m + 1);
    };

    function handleDayClick(day: number) {
        const clicked = new Date(viewYear, viewMonth, day);
        const key = toKey(clicked);
        if (phase === "none" || phase === "complete") {
            onChange(clicked, undefined);
        } else {
            if (key < startKey!) onChange(clicked, undefined);
            else if (key === startKey) onChange(undefined, undefined);
            else onChange(startDate, clicked);
        }
    }

    function inRange(key: string) {
        if (!startKey || !endKey) return false;
        return key > startKey && key < endKey;
    }
    function isRangeStart(key: string) {
        return !!startKey && key === startKey;
    }
    function isRangeEnd(key: string) {
        return !!endKey && key === endKey;
    }

    if (disabled) {
        return (
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground font-mono space-y-1">
                <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider mr-2">
                        Start
                    </span>
                    {startDate
                        ? startDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                          })
                        : "—"}
                </div>
                <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider mr-2">
                        End
                    </span>
                    {endDate
                        ? endDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                          })
                        : "—"}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 rounded-md border border-border/60 bg-muted/20 px-3 py-1.5 text-sm flex-1 min-w-0">
                    <div className="flex items-center justify-between sm:contents">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Start
                        </span>
                        <div className="sm:hidden">
                            {startDate ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange(undefined, undefined)
                                    }
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            ) : (
                                <span className="w-3 h-3 block" />
                            )}
                        </div>
                    </div>
                    <span
                        className={cn(
                            "flex-1",
                            startDate
                                ? "text-foreground font-medium"
                                : "text-muted-foreground",
                        )}
                    >
                        {startDate
                            ? startDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "—"}
                    </span>
                    <div className="hidden sm:flex w-4 shrink-0 items-center justify-center">
                        {startDate && (
                            <button
                                type="button"
                                onClick={() => onChange(undefined, undefined)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
                <span className="text-muted-foreground text-xs shrink-0">
                    →
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 rounded-md border border-border/60 bg-muted/20 px-3 py-1.5 text-sm flex-1 min-w-0">
                    <div className="flex items-center justify-between sm:contents">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            End
                        </span>
                        <div className="sm:hidden">
                            {endDate ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange(startDate, undefined)
                                    }
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            ) : (
                                <span className="w-3 h-3 block" />
                            )}
                        </div>
                    </div>
                    <span
                        className={cn(
                            "flex-1",
                            endDate
                                ? "text-foreground font-medium"
                                : "text-muted-foreground",
                        )}
                    >
                        {endDate
                            ? endDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "optional"}
                    </span>
                    <div className="hidden sm:flex w-4 shrink-0 items-center justify-center">
                        {endDate && (
                            <button
                                type="button"
                                onClick={() => onChange(startDate, undefined)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
                {phase === "none" && "Click a date to set the start date."}
                {phase === "start-only" &&
                    "Click another date to set the end date, or click the same date to deselect."}
                {phase === "complete" &&
                    "Click any date to reset and pick a new range."}
            </p>

            <div className="rounded-lg border bg-muted/20 p-3 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 px-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={prevMonth}
                        type="button"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <button
                        type="button"
                        onClick={() => {
                            setPickerYear(viewYear);
                            setPickerOpen((v) => !v);
                        }}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent transition-colors"
                    >
                        {MONTHS_LIST[viewMonth]} {viewYear}
                        {pickerOpen ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={nextMonth}
                        type="button"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <AnimatePresence>
                    {pickerOpen && (
                        <PickerOverlay
                            viewYear={viewYear}
                            viewMonth={viewMonth}
                            pickerYear={pickerYear}
                            today={today}
                            setPickerYear={setPickerYear}
                            selectMonthYear={(i) => {
                                setViewMonth(i);
                                setViewYear(pickerYear);
                                setPickerOpen(false);
                            }}
                        />
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-7 mb-1">
                    {DAYS_LIST.map((d) => (
                        <div
                            key={d}
                            className="text-center text-[0.72rem] text-muted-foreground py-1"
                        >
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {cells.map((day, i) => {
                        if (day === null)
                            return <div key={`e-${i}`} className="h-9" />;
                        const key = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
                        const isToday = key === todayKey;
                        const isStart = isRangeStart(key);
                        const isEnd = isRangeEnd(key);
                        const inRng = inRange(key);
                        const isSelected = isStart || isEnd;
                        const isSingleDay = isStart && isEnd;

                        const bandStyle: React.CSSProperties = isSingleDay
                            ? {}
                            : isStart
                              ? {
                                    background:
                                        "linear-gradient(to right, transparent 50%, rgba(59,130,246,0.15) 50%)",
                                }
                              : isEnd
                                ? {
                                      background:
                                          "linear-gradient(to left, transparent 50%, rgba(59,130,246,0.15) 50%)",
                                  }
                                : inRng
                                  ? { background: "rgba(59,130,246,0.15)" }
                                  : {};

                        const showBand =
                            !!endKey &&
                            !isSingleDay &&
                            (isStart || isEnd || inRng);

                        return (
                            <div
                                key={key}
                                className="relative h-9 flex items-center justify-center"
                            >
                                {showBand && (
                                    <div
                                        aria-hidden
                                        style={bandStyle}
                                        className="absolute left-0 right-0 h-8 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors",
                                        isSelected
                                            ? "bg-blue-600 text-white font-semibold shadow"
                                            : isToday
                                              ? "border border-blue-500/50 text-blue-300 font-semibold hover:bg-accent"
                                              : inRng
                                                ? "text-blue-300 font-medium hover:bg-blue-500/30"
                                                : "hover:bg-accent text-foreground",
                                    )}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PdFormSheet({
    open,
    onOpenChange,
    mode,
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
    isPast = false,
    onEdit,
    onDelete,
    onAssign,
}: PdFormSheetProps) {
    const isMobile = useIsMobile();
    const isReadOnly = mode === "view";
    const cfg = modeConfig[mode];
    const ModeIcon = cfg.icon;

    const handleClose = () => {
        if (isSubmitting) return;
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={[
                    "flex flex-col gap-0 p-0 overflow-y-auto",
                    isMobile
                        ? "h-[95vh] rounded-t-2xl"
                        : "w-[520px] sm:w-[560px]",
                ].join(" ")}
            >
                {/* ── Header ── */}
                <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className={`rounded-lg border p-2 shrink-0 ${cfg.iconBg}`}
                            >
                                <ModeIcon
                                    className={`h-4 w-4 ${cfg.iconColor}`}
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <span
                                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cfg.badge}`}
                                    >
                                        {cfg.badgeLabel}
                                    </span>
                                    {isPast && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-muted-foreground/20 bg-muted/40 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                            <Lock className="h-2.5 w-2.5" />{" "}
                                            Expired
                                        </span>
                                    )}
                                    {/* TypeBadge + LevelBadge shown in view mode header */}
                                    {isReadOnly && (
                                        <>
                                            <TypeBadge
                                                type={formData.type}
                                                size="xs"
                                            />
                                            <LevelBadge
                                                level={formData.level}
                                                size="xs"
                                            />
                                        </>
                                    )}
                                </div>
                                <SheetTitle className="text-base leading-snug break-words whitespace-normal">
                                    {(mode === "view" || mode === "edit") &&
                                    formData.title
                                        ? formData.title
                                        : cfg.title}
                                </SheetTitle>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {mode === "view" && onEdit && (
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={onEdit}
                                                    disabled={isPast}
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            {isPast
                                                ? "Cannot edit — training has already passed"
                                                : "Edit details"}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                {/* ── Form body ── */}
                <form onSubmit={onSubmit} className="flex flex-col flex-1">
                    <div className="flex-1 px-5 py-4 space-y-5">
                        {/* Type + Level — selects in create/edit only */}
                        {!isReadOnly && (
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <FieldLabel>Type</FieldLabel>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(
                                            value: "TRAINING" | "SEMINAR",
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TRAINING">
                                                Training
                                            </SelectItem>
                                            <SelectItem value="SEMINAR">
                                                Seminar
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel>Level</FieldLabel>
                                    <Select
                                        value={formData.level}
                                        onValueChange={(
                                            value: keyof typeof TrainingLevel,
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                level: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="w-[175px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="withinInstitution">
                                                Within Institution
                                            </SelectItem>
                                            <SelectItem value="interInstitutional">
                                                Inter-Institutional
                                            </SelectItem>
                                            <SelectItem value="local">
                                                Local
                                            </SelectItem>
                                            <SelectItem value="regional">
                                                Regional
                                            </SelectItem>
                                            <SelectItem value="national">
                                                National
                                            </SelectItem>
                                            <SelectItem value="international">
                                                International
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <FieldLabel>Title</FieldLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="e.g. Regional Training on Curriculum Development"
                                required
                                disabled={isReadOnly}
                            />
                        </div>

                        <Separator />

                        {/* Sponsor + Hours */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>Sponsoring Agency</FieldLabel>
                                <Input
                                    value={formData.sponsoring_agency}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sponsoring_agency: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. DepEd Region VII"
                                    required
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div>
                                <FieldLabel>Total Hours</FieldLabel>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.total_hours}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            total_hours: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 24"
                                    required
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Date Range — custom inline picker */}
                        <div>
                            <FieldLabel>
                                Date Range{" "}
                                {!isReadOnly && (
                                    <span className="normal-case tracking-normal text-muted-foreground/50 text-[10px] ml-1">
                                        (end date optional)
                                    </span>
                                )}
                            </FieldLabel>
                            <RangeDatePicker
                                startDate={formData.start_date}
                                endDate={formData.end_date}
                                onChange={(start, end) =>
                                    setFormData({
                                        ...formData,
                                        start_date: start,
                                        end_date: end,
                                    })
                                }
                                disabled={isReadOnly}
                            />
                        </div>

                        <Separator />

                        {/* Venue */}
                        <div>
                            <FieldLabel optional>Venue</FieldLabel>
                            <Input
                                value={formData.venue}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        venue: e.target.value,
                                    })
                                }
                                placeholder="e.g. Cebu City Sports Center"
                                disabled={isReadOnly}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <FieldLabel optional>Description</FieldLabel>
                            <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Brief description of this training or seminar..."
                                rows={3}
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-3 space-y-2">
                        {mode === "view" && (onAssign || onDelete) && (
                            <div className="flex gap-2">
                                {onAssign && (
                                    <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="flex-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full gap-2"
                                                        onClick={onAssign}
                                                        disabled={isPast}
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                        Assign Teachers
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            {isPast && (
                                                <TooltipContent side="top">
                                                    Training has already passed
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {onDelete && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                                        onClick={onDelete}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                {mode === "view" ? "Close" : "Cancel"}
                            </Button>
                            {mode !== "view" && (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={cn(
                                        "flex-1 gap-2",
                                        cfg.submitCls,
                                    )}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {isSubmitting
                                        ? cfg.submittingLabel
                                        : cfg.submitLabel}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
