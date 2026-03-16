
"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

// ── Change this version string whenever you deploy new features ──
const CURRENT_PATCH = "v1.0.1";
const STORAGE_KEY   = `edutrack_patch_seen_${CURRENT_PATCH}`;

const PATCH_NOTES = [
    {
        category: "New",
        items: [
            "Superadmin role with user and security management",
            "Account suspension with reason",
            "Role promotion and demotion system",
            "Security activity log",
            "Date of Original Deployment tracking",
        ],
    },
    {
        category: "Improved",
        items: [
            "fillUp form now collects employment information",
            "Account approval sheet shows full user details",
            "Teacher directory now filters approved teachers only",
        ],
    },
    {
        category: "Fixed",
        items: [
            "Service record date calculation timezone issue",
            "Dashboard profile count now shows teachers only",
            "Employee ID and Position now correctly dispayed in Teacher Profiles directory"
        ],
    },
];

const categoryColors: Record<string, string> = {
    New:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Improved: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Fixed:    "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function PatchNoteModal() {
    const [open, setOpen] = useState(() => {
        if (typeof window === "undefined") return false;
        return !localStorage.getItem(STORAGE_KEY);
    });

    function handleDismiss() {
        localStorage.setItem(STORAGE_KEY, "true");
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) handleDismiss(); }}>
            <DialogContent className="max-w-md w-[90vw] p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                    <DialogHeader className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2">
                                <Sparkles className="h-4 w-4 text-violet-400" />
                            </div>
                            <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/30 text-[11px]">
                                {CURRENT_PATCH}
                            </Badge>
                        </div>
                        <DialogTitle className="text-base">
                            What&apos;s new in EduTrack
                        </DialogTitle>
                        <DialogDescription className="text-[13px]">
                            Here&apos;s what was updated in this release.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {PATCH_NOTES.map((section) => (
                        <div key={section.category}>
                            <Badge
                                className={`mb-2 text-[11px] ${categoryColors[section.category]}`}
                            >
                                {section.category}
                            </Badge>
                            <ul className="space-y-1.5">
                                {section.items.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2 text-[13px] text-foreground"
                                    >
                                        <span className="text-muted-foreground mt-0.5 shrink-0">
                                            •
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/60 flex justify-end">
                    <Button onClick={handleDismiss} className="gap-2">
                        Got it
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}