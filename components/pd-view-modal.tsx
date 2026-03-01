"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { fetchPdDetails } from "@/app/actions/pd-details";
import {
    GraduationCap,
    MapPin,
    Building2,
    Clock,
    CalendarDays,
    FileText,
    Loader2,
} from "lucide-react";

type PdDetails = {
    id: string;
    title: string;
    type: string;
    level: string;
    start_date: string;
    end_date: string | null;
    total_hours: number;
    sponsoring_agency: string | null;
    venue: string | null;
    description: string | null;
};

type FetchResult = { ok: true; data: PdDetails } | { ok: false; error: string };

/* ── Type chip colours ── */
const typeColors: Record<string, string> = {
    training: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    seminar: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    workshop: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    webinar: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    conference: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function TypeBadge({ type }: { type: string }) {
    const cls =
        typeColors[(type ?? "").toLowerCase()] ??
        "bg-slate-500/15 text-slate-400 border-slate-500/30";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {type}
        </span>
    );
}

/* ── Level pill colours ── */
function LevelBadge({ level }: { level: string }) {
    const l = (level ?? "").toLowerCase();
    const cls =
        l === "regional"
            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
            : l === "national"
              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
              : l === "international"
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : "bg-slate-500/15 text-slate-400 border-slate-500/30";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {level}
        </span>
    );
}

/* ── Info row ── */
function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md border border-white/10 bg-white/5 p-1.5 shrink-0">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                    {label}
                </div>
                <div className="text-sm text-foreground leading-snug">
                    {value ?? <span className="text-muted-foreground">—</span>}
                </div>
            </div>
        </div>
    );
}

export default function PdViewModal({
    open,
    onOpenChange,
    trainingId,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    trainingId: string | null;
}) {
    const [loading, setLoading] = useState(false);
    const [pd, setPd] = useState<PdDetails | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !trainingId) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            setErr(null);
            setPd(null);

            const res = (await fetchPdDetails(trainingId)) as FetchResult;
            if (cancelled) return;

            if (!res.ok) {
                setErr(res.error);
                setLoading(false);
                return;
            }
            setPd(res.data);
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [open, trainingId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[90vw] max-h-[90vh] overflow-y-auto p-0 overflow-x-hidden gap-0">
                {/* Header band */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    {/* Decorative glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />

                    <DialogHeader className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <GraduationCap className="h-4 w-4 text-blue-400" />
                            </div>
                            <DialogTitle className="text-sm font-medium text-muted-foreground">
                                Training / Seminar Details
                            </DialogTitle>
                        </div>

                        {pd && (
                            <>
                                <h2 className="text-xl font-semibold tracking-tight leading-tight">
                                    {pd.title}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                    <TypeBadge type={pd.type} />
                                    <LevelBadge level={pd.level} />
                                </div>
                            </>
                        )}

                        {loading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading details…
                            </div>
                        )}

                        {err && (
                            <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md px-3 py-2 mt-2">
                                {err}
                            </div>
                        )}
                    </DialogHeader>
                </div>

                {/* Body */}
                {pd && (
                    <div className="px-6 py-5 space-y-4">
                        <div className="flex flex-wrap items-start gap-4">
                            <InfoRow
                                icon={CalendarDays}
                                label="Dates"
                                value={
                                    <span className="font-mono text-xs">
                                        {pd.start_date}
                                        {pd.end_date ? (
                                            <>
                                                <span className="text-muted-foreground mx-1">
                                                    →
                                                </span>
                                                {pd.end_date}
                                            </>
                                        ) : null}
                                    </span>
                                }
                            />
                            <InfoRow
                                icon={Clock}
                                label="Total Hours"
                                value={
                                    <span className="font-semibold text-emerald-400 tabular-nums">
                                        {pd.total_hours}h
                                    </span>
                                }
                            />
                        </div>

                        <div className="h-px bg-border/50" />

                        <InfoRow
                            icon={Building2}
                            label="Sponsoring Agency"
                            value={pd.sponsoring_agency}
                        />
                        <InfoRow icon={MapPin} label="Venue" value={pd.venue} />
                        <InfoRow
                            icon={FileText}
                            label="Description"
                            value={pd.description}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
