"use client";

import { Archive } from "lucide-react";

function fmtDate(dt: string | null) {
    if (!dt) return "—";
    try {
        return new Date(dt).toLocaleDateString("en-PH", {
            year: "numeric", month: "long", day: "numeric",
        });
    } catch { return dt; }
}

interface ArchiveProfileBannerProps {
    archivedAt:    string | null;
    archiveReason: string | null;
}

export default function ArchiveProfileBanner({
    archivedAt,
    archiveReason,
}: ArchiveProfileBannerProps) {
    return (
        <div className="w-full bg-slate-500/10 border-b border-slate-500/20 px-4 py-3 md:px-6">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 shrink-0">
                    <Archive className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                        Archived Account
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                    <span>Archived on {fmtDate(archivedAt)}</span>
                    {archiveReason && (
                        <span>Reason: <span className="text-foreground">{archiveReason}</span></span>
                    )}
                </div>
            </div>
        </div>
    );
}