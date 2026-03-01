"use client";

import { useState } from "react";
import {
    Loader2,
    Plus,
    Pencil,
    Eye,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type Mode = "create" | "edit" | "view";

export type FormData = {
    title: string;
    type: "TRAINING" | "SEMINAR";
    level: "REGIONAL" | "NATIONAL" | "INTERNATIONAL";
    sponsoring_agency: string;
    total_hours: string;
    start_date: Date | undefined;
    end_date: Date | undefined;
    venue: string;
    description: string;
};

interface PdFormModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    mode: Mode;
    formData: FormData;
    setFormData: (data: FormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

const modeConfig = {
    create: {
        icon: Plus,
        iconBg: "bg-teal-500/10 border-teal-500/20",
        iconColor: "text-teal-400",
        glow: "from-teal-500/5 via-transparent to-emerald-500/5",
        badge: "bg-teal-500/10 text-teal-400 border-teal-500/30",
        badgeLabel: "New Record",
        title: "Add Training or Seminar",
        description:
            "Fill in the details to add a new professional development record.",
        submitLabel: "Create",
        submittingLabel: "Creating...",
        submitCls: "bg-teal-600 hover:bg-teal-700 text-white",
        accent: "orange",
    },
    edit: {
        icon: Pencil,
        iconBg: "bg-blue-500/10 border-blue-500/20",
        iconColor: "text-blue-400",
        glow: "from-blue-500/5 via-transparent to-violet-500/5",
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        badgeLabel: "Editing",
        title: "Edit Training/Seminar",
        description: "Update the details and save your changes.",
        submitLabel: "Save Changes",
        submittingLabel: "Saving...",
        submitCls: "bg-blue-600 hover:bg-blue-700 text-white",
        accent: "orange",
    },
    view: {
        icon: Eye,
        iconBg: "bg-violet-500/10 border-violet-500/20",
        iconColor: "text-violet-400",
        glow: "from-violet-500/5 via-transparent to-blue-500/5",
        badge: "bg-violet-500/10 text-violet-400 border-violet-500/30",
        badgeLabel: "Viewing",
        title: "Training/Seminar Details",
        description: "View the complete details of this record.",
        submitLabel: "",
        submittingLabel: "",
        submitCls: "",
        accent: "orange",
    },
};

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const MONTHS_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number) {
    return n < 10 ? `0${n}` : String(n);
}

function MiniCalendar({
    value,
    onChange,
    disabled,
}: {
    value: Date | undefined;
    onChange: (d: Date | undefined) => void;
    disabled?: boolean;
}) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(
        value?.getFullYear() ?? today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = useState(
        value?.getMonth() ?? today.getMonth(),
    );
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(
        value?.getFullYear() ?? today.getFullYear(),
    );

    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();
    const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const selectedKey = value
        ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
        : null;

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

    if (disabled && value) {
        return (
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground font-mono">
                {value.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </div>
        );
    }
    if (disabled) {
        return (
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                —
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-muted/20 p-3 relative">
            {/* Navigation */}
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
                    {MONTHS[viewMonth]} {viewYear}
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

            {/* Month/year picker overlay */}
            <AnimatePresence>
                {pickerOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-x-0 top-[2.75rem] z-10 mx-3 rounded-lg border bg-card shadow-lg p-3"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                type="button"
                                onClick={() => setPickerYear((y) => y - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-semibold">
                                {pickerYear}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                type="button"
                                onClick={() => setPickerYear((y) => y + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {MONTHS_SHORT.map((m, i) => {
                                const isCurrent =
                                    i === viewMonth && pickerYear === viewYear;
                                const isThisMonth =
                                    i === today.getMonth() &&
                                    pickerYear === today.getFullYear();
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => {
                                            setViewMonth(i);
                                            setViewYear(pickerYear);
                                            setPickerOpen(false);
                                        }}
                                        className={cn(
                                            "rounded-md py-2 text-sm transition-colors",
                                            isCurrent
                                                ? "bg-orange-600/50 text-orange-100 font-semibold"
                                                : isThisMonth
                                                  ? "border border-orange-500/40 font-semibold hover:bg-accent"
                                                  : "hover:bg-accent text-foreground",
                                        )}
                                    >
                                        {m}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                    <div
                        key={d}
                        className="text-center text-[0.72rem] text-muted-foreground py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} />;
                    const key = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
                    const isToday = key === todayKey;
                    const isSelected = key === selectedKey;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() =>
                                onChange(new Date(viewYear, viewMonth, day))
                            }
                            className={cn(
                                "relative mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                                isSelected
                                    ? "bg-orange-600/50 text-orange-100 font-semibold"
                                    : isToday
                                      ? "border border-orange-500/40 font-semibold text-orange-300 hover:bg-accent"
                                      : "hover:bg-accent",
                            )}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

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

export default function PdFormModal({
    open,
    onOpenChange,
    mode,
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
}: PdFormModalProps) {
    const isReadOnly = mode === "view";
    const cfg = modeConfig[mode];
    const ModeIcon = cfg.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto p-0 gap-0">
                {/* ── Header band ── */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div
                        className={`absolute inset-0 bg-gradient-to-br ${cfg.glow} pointer-events-none`}
                    />
                    <DialogHeader className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className={`rounded-lg border p-2 ${cfg.iconBg}`}
                            >
                                <ModeIcon
                                    className={`h-4 w-4 ${cfg.iconColor}`}
                                />
                            </div>
                            <span
                                className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cfg.badge}`}
                            >
                                {cfg.badgeLabel}
                            </span>
                        </div>
                        <DialogTitle className="text-lg font-semibold tracking-tight">
                            {cfg.title}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {cfg.description}
                        </p>
                    </DialogHeader>
                </div>

                {/* ── Form body ── */}
                <form onSubmit={onSubmit}>
                    <div className="px-6 py-5 space-y-5">
                        {/* Type + Level */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    disabled={isReadOnly}
                                >
                                    <SelectTrigger>
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
                                        value:
                                            | "REGIONAL"
                                            | "NATIONAL"
                                            | "INTERNATIONAL",
                                    ) =>
                                        setFormData({
                                            ...formData,
                                            level: value,
                                        })
                                    }
                                    disabled={isReadOnly}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="REGIONAL">
                                            Regional
                                        </SelectItem>
                                        <SelectItem value="NATIONAL">
                                            National
                                        </SelectItem>
                                        <SelectItem value="INTERNATIONAL">
                                            International
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <FieldLabel>Title</FieldLabel>
                            <Input
                                id="title"
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

                        <div className="h-px bg-border/50" />

                        {/* Sponsor + Hours */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>Sponsoring Agency</FieldLabel>
                                <Input
                                    id="sponsor"
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
                                    id="hours"
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

                        <div className="h-px bg-border/50" />

                        {/* Start + End Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <FieldLabel>Start Date</FieldLabel>
                                    {formData.start_date && !isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    start_date: undefined,
                                                })
                                            }
                                            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" /> Clear
                                        </button>
                                    )}
                                </div>
                                <MiniCalendar
                                    value={formData.start_date}
                                    onChange={(d) =>
                                        setFormData({
                                            ...formData,
                                            start_date: d,
                                        })
                                    }
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <FieldLabel optional>End Date</FieldLabel>
                                    {formData.end_date && !isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    end_date: undefined,
                                                })
                                            }
                                            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" /> Clear
                                        </button>
                                    )}
                                </div>
                                <MiniCalendar
                                    value={formData.end_date}
                                    onChange={(d) =>
                                        setFormData({
                                            ...formData,
                                            end_date: d,
                                        })
                                    }
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Venue */}
                        <div>
                            <FieldLabel optional>Venue</FieldLabel>
                            <Input
                                id="venue"
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
                                id="description"
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
                    <div className="px-6 py-4 border-t border-border/60 bg-muted/20">
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                {mode === "view" ? "Close" : "Cancel"}
                            </Button>

                            {mode !== "view" && (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={cn("gap-2", cfg.submitCls)}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {isSubmitting
                                        ? cfg.submittingLabel
                                        : cfg.submitLabel}
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
