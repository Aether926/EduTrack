"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldX } from "lucide-react";
import type { SuperadminUser } from "../types";

const SUSPENSION_REASONS = [
    "Violation of school policy",
    "Account under review",
    "Unauthorized access attempt",
    "Temporary deactivation",
    "Other",
];

interface SuspendReasonDialogProps {
    user: SuperadminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (id: string, reason: string) => Promise<void>;
}

export default function SuspendReasonDialog({
    user,
    open,
    onOpenChange,
    onConfirm,
}: SuspendReasonDialogProps) {
    const [reason, setReason]       = useState("");
    const [custom, setCustom]       = useState("");
    const [loading, setLoading]     = useState(false);

    if (!user) return null;

    const finalReason = reason === "Other" ? custom.trim() : reason;
    const canSubmit   = reason !== "" && (reason !== "Other" || custom.trim() !== "");

    async function handleConfirm() {
        if (!canSubmit) return;
        setLoading(true);
        try {
            await onConfirm(user!.id, finalReason);
            onOpenChange(false);
            setReason("");
            setCustom("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!loading) {
                    onOpenChange(o);
                    if (!o) { setReason(""); setCustom(""); }
                }
            }}
        >
            <DialogContent className="max-w-sm w-[90vw] p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                    <DialogHeader className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2">
                                <ShieldX className="h-4 w-4 text-amber-400" />
                            </div>
                            <DialogTitle className="text-sm font-medium text-muted-foreground">
                                Suspend Account
                            </DialogTitle>
                        </div>
                        <p className="text-base font-semibold leading-snug">
                            Suspend {user.firstName || user.email}?
                        </p>
                        <DialogDescription className="mt-1">
                            Select a reason for the suspension. This will be shown to the user.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-3">
                    <Select
                        value={reason}
                        onValueChange={(v) => {
                            setReason(v);
                            if (v !== "Other") setCustom("");
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a reason..." />
                        </SelectTrigger>
                        <SelectContent>
                            {SUSPENSION_REASONS.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {reason === "Other" && (
                        <Input
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                            placeholder="Enter custom reason..."
                            autoFocus
                        />
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-border/60 flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-400 text-white"
                        onClick={handleConfirm}
                        disabled={!canSubmit || loading}
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Suspend
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}