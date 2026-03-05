"use client";

import {
    Loader2, Plus, Pencil, Eye, CalendarIcon, X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface PdFormSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    mode: Mode;
    formData: FormData;
    setFormData: (data: FormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    extraFooter?: React.ReactNode;
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
        badgeLabel: "Viewing",
        title: "Training/Seminar Details",
        submitLabel: "",
        submittingLabel: "",
        submitCls: "",
    },
};

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</span>
            {optional && <span className="text-[10px] text-muted-foreground/50 normal-case tracking-normal">optional</span>}
        </div>
    );
}

function DatePickerField({
    label,
    value,
    onChange,
    disabled,
    optional,
}: {
    label: string;
    value: Date | undefined;
    onChange: (d: Date | undefined) => void;
    disabled?: boolean;
    optional?: boolean;
}) {
    if (disabled) {
        return (
            <div>
                <FieldLabel optional={optional}>{label}</FieldLabel>
                <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground h-9 flex items-center">
                    {value
                        ? <span className="font-mono">{format(value, "PPP")}</span>
                        : <span className="text-muted-foreground">—</span>
                    }
                </div>
            </div>
        );
    }

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
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default function PdFormSheet({
    open,
    onOpenChange,
    mode,
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
    extraFooter,
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
                    isMobile ? "h-[95vh] rounded-t-2xl" : "w-[520px] sm:w-[560px]",
                ].join(" ")}
            >
                {/* ── Header ── */}
                <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className={`rounded-lg border p-2 shrink-0 ${cfg.iconBg}`}>
                                <ModeIcon className={`h-4 w-4 ${cfg.iconColor}`} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cfg.badge}`}>
                                        {cfg.badgeLabel}
                                    </span>
                                </div>
                                <SheetTitle className="text-base leading-snug">
                                    {cfg.title}
                                </SheetTitle>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-7 w-7"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                {/* ── Form body ── */}
                <form onSubmit={onSubmit} className="flex flex-col flex-1">
                    <div className="flex-1 px-5 py-4 space-y-5">

                        {/* Type + Level */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>Type</FieldLabel>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: "TRAINING" | "SEMINAR") => setFormData({ ...formData, type: value })}
                                    disabled={isReadOnly}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TRAINING">Training</SelectItem>
                                        <SelectItem value="SEMINAR">Seminar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <FieldLabel>Level</FieldLabel>
                                <Select
                                    value={formData.level}
                                    onValueChange={(value: "REGIONAL" | "NATIONAL" | "INTERNATIONAL") => setFormData({ ...formData, level: value })}
                                    disabled={isReadOnly}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="REGIONAL">Regional</SelectItem>
                                        <SelectItem value="NATIONAL">National</SelectItem>
                                        <SelectItem value="INTERNATIONAL">International</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <FieldLabel>Title</FieldLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, sponsoring_agency: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, total_hours: e.target.value })}
                                    placeholder="e.g. 24"
                                    required
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Start + End Date */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <FieldLabel>Date Range</FieldLabel>
                                {(formData.start_date || formData.end_date) && !isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, start_date: undefined, end_date: undefined })}
                                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                                    >
                                        <X className="h-3 w-3" /> Clear
                                    </button>
                                )}
                            </div>
                            {isReadOnly ? (
                                <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm h-9 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                    {formData.start_date
                                        ? <span className="font-mono">{format(formData.start_date, "PPP")}{formData.end_date ? ` → ${format(formData.end_date, "PPP")}` : ""}</span>
                                        : <span className="text-muted-foreground">—</span>
                                    }
                                </div>
                            ) : (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.start_date
                                                ? formData.end_date
                                                    ? <>{format(formData.start_date, "LLL dd, y")} - {format(formData.end_date, "LLL dd, y")}</>
                                                    : format(formData.start_date, "LLL dd, y")
                                                : <span>Pick a date range</span>
                                            }
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="range"
                                            selected={{ from: formData.start_date, to: formData.end_date }}
                                            onSelect={(range: DateRange | undefined) => setFormData({
                                                ...formData,
                                                start_date: range?.from,
                                                end_date: range?.to,
                                            })}
                                            captionLayout="dropdown"
                                            numberOfMonths={1}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>

                        <Separator />

                        {/* Venue */}
                        <div>
                            <FieldLabel optional>Venue</FieldLabel>
                            <Input
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                placeholder="e.g. Cebu City Sports Center"
                                disabled={isReadOnly}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <FieldLabel optional>Description</FieldLabel>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this training or seminar..."
                                rows={3}
                                disabled={isReadOnly}
                            />
                        </div>

                        {extraFooter}
                    </div>

                    {/* ── Footer — sticky at bottom ── */}
                    <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-3 flex gap-2">
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
                                className={cn("flex-1 gap-2", cfg.submitCls)}
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isSubmitting ? cfg.submittingLabel : cfg.submitLabel}
                            </Button>
                        )}
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}