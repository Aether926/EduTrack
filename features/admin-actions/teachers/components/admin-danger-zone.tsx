/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertTriangle,
    Trash2,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle2,
    ShieldAlert,
    Clock,
} from "lucide-react";
import { toast } from "sonner";
import { adminInitiateDeletion } from "@/features/settingss/actions/admin-deletion-actions";
import { supabase } from "@/lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";

const ADMIN_REASONS = [
    "Resigned / Left the school",
    "Duplicate account",
    "Inactive account",
    "Violation of policy",
    "Custom reason",
];

export function AdminDangerZone({
    teacherId,
    teacherName,
    isDeactivating = false,
    deactivationScheduledAt,
    deactivationReason,
}: {
    teacherId: string;
    teacherName: string;
    isDeactivating?: boolean;
    deactivationScheduledAt?: string | null;
    deactivationReason?: string | null;
}) {
    const [modal, setModal] = useState(false);
    const [step, setStep] = useState<"reason" | "confirm">("reason");
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const isCustom = selectedReason === "Custom reason";
    const finalReason = isCustom ? customReason.trim() : selectedReason;

    function handleOpen() {
        if (isDeactivating) return;
        setStep("reason");
        setSelectedReason("");
        setCustomReason("");
        setAdminPassword("");
        setModal(true);
    }

    function handleClose() {
        setModal(false);
        setStep("reason");
        setSelectedReason("");
        setCustomReason("");
        setAdminPassword("");
    }

    function handleNextStep() {
        if (!finalReason)
            return toast.error("Please select or provide a reason.");
        setStep("confirm");
    }

    async function handleConfirm() {
        if (!adminPassword)
            return toast.error("Please enter your password to confirm.");
        setLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user?.email) return toast.error("Not authenticated.");

            const { error: verifyErr } = await supabase.auth.signInWithPassword(
                {
                    email: user.email,
                    password: adminPassword,
                },
            );

            if (verifyErr) {
                toast.error("Incorrect password. Action cancelled.");
                setLoading(false);
                return;
            }

            const result = await adminInitiateDeletion(teacherId, finalReason);
            if (!result.ok) {
                toast.error(result.error);
                setLoading(false);
                return;
            }

            toast.success(
                `Deactivation initiated for ${teacherName}. They have been notified.`,
            );
            handleClose();
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Danger Zone Card */}
            <div className="border border-rose-500/20 shadow-lg w-full overflow-hidden rounded-xl bg-card">
                <div className="relative px-6 py-4 border-b border-rose-500/20 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-red-500/5 pointer-events-none" />
                    <div className="relative flex items-center gap-2.5">
                        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2">
                            <ShieldAlert className="h-4 w-4 text-rose-400" />
                        </div>
                        <span className="text-base font-semibold text-rose-400">
                            Danger Zone
                        </span>
                    </div>
                </div>

                <div className="px-6 py-5">
                    {isDeactivating ? (
                        /* ── Already deactivating state ── */
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 shrink-0 mt-0.5">
                                <Clock className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-amber-400">
                                    Deactivation in progress
                                </p>
                                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                                    <span className="text-foreground font-medium">
                                        {teacherName}
                                    </span>
                                    's account is currently scheduled for
                                    deactivation and is within the grace period.
                                    No further action is needed.
                                </p>
                                {deactivationReason && (
                                    <p className="text-[11px] text-muted-foreground mt-1.5">
                                        Reason:{" "}
                                        <span className="text-foreground font-medium">
                                            {deactivationReason}
                                        </span>
                                    </p>
                                )}
                                {deactivationScheduledAt && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Initiated{" "}
                                        <span className="text-foreground font-medium">
                                            {formatDistanceToNow(
                                                new Date(
                                                    deactivationScheduledAt,
                                                ),
                                                { addSuffix: true },
                                            )}
                                        </span>
                                    </p>
                                )}
                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/8 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                                    <Clock className="h-3 w-3" />
                                    Awaiting grace period
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Normal state ── */
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Deactivate Teacher Account
                                </p>
                                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                                    Initiates account deactivation for{" "}
                                    <span className="text-foreground font-medium">
                                        {teacherName}
                                    </span>
                                    . This user will be notified, deactivated,
                                    and moved to the archive. This action
                                    requires your password to confirm.
                                </p>
                            </div>
                            <button
                                onClick={handleOpen}
                                disabled={isDeactivating}
                                className={`shrink-0 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition
                                        ${
                                            isDeactivating
                                                ? "border-muted/20 bg-muted/10 text-muted-foreground cursor-not-allowed opacity-50"
                                                : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer"
                                        }`}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Deactivate account
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal — only renders when not already deactivating */}
            {!isDeactivating && (
                <Dialog
                    open={modal}
                    onOpenChange={(o) => {
                        if (!o) handleClose();
                    }}
                >
                    <DialogContent className="max-w-md bg-card border-border/60">
                        {/* Step 1 — Select reason */}
                        {step === "reason" && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-rose-400">
                                        <AlertTriangle className="h-5 w-5" />
                                        Initiate Account Deactivation
                                    </DialogTitle>
                                    <DialogDescription>
                                        Select a reason for deactivating{" "}
                                        <strong>{teacherName}</strong>'s
                                        account. They will be notified and have
                                        a grace period to respond.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-1.5">
                                    {ADMIN_REASONS.map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setSelectedReason(r)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                                                selectedReason === r
                                                    ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                                                    : "border-white/8 bg-white/3 text-muted-foreground hover:bg-white/6 hover:text-foreground"
                                            }`}
                                        >
                                            {selectedReason === r && (
                                                <CheckCircle2 className="h-3.5 w-3.5 inline mr-2 text-rose-400" />
                                            )}
                                            {r}
                                        </button>
                                    ))}

                                    {isCustom && (
                                        <textarea
                                            value={customReason}
                                            onChange={(e) =>
                                                setCustomReason(e.target.value)
                                            }
                                            placeholder="Enter custom reason..."
                                            className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 resize-none min-h-[80px] outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 text-foreground placeholder:text-muted-foreground"
                                        />
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={handleClose}
                                        className="border-white/10 hover:bg-white/5"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleNextStep}
                                        disabled={!finalReason}
                                        className="bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 hover:text-rose-300"
                                        variant="outline"
                                    >
                                        Continue
                                    </Button>
                                </DialogFooter>
                            </>
                        )}

                        {/* Step 2 — Password confirmation */}
                        {step === "confirm" && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-rose-400">
                                        <AlertTriangle className="h-5 w-5" />
                                        Confirm Your Identity
                                    </DialogTitle>
                                    <DialogDescription>
                                        Enter your admin password to confirm
                                        this action.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="rounded-lg border border-rose-500/20 bg-rose-500/8 p-4 space-y-1.5">
                                        <p className="text-[12px] font-semibold text-rose-400 flex items-center gap-1.5">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Final Warning
                                        </p>
                                        <p className="text-[12px] text-muted-foreground">
                                            You are archiving{" "}
                                            <span className="font-medium text-foreground">
                                                {teacherName}
                                            </span>
                                            's account.
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Reason:{" "}
                                            <span className="font-medium text-foreground">
                                                {finalReason}
                                            </span>
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            The teacher will be notified and
                                            their account will be deactivated
                                            after the grace period.
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="admin-pw"
                                            className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold"
                                        >
                                            Your Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="admin-pw"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={adminPassword}
                                                onChange={(e) =>
                                                    setAdminPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter your admin password"
                                                className="pr-10 bg-white/5 border-white/10 focus:border-rose-500/40"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        handleConfirm();
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((v) => !v)
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep("reason")}
                                        disabled={loading}
                                        className="border-white/10 hover:bg-white/5"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={loading || !adminPassword}
                                        className="bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 hover:text-rose-300"
                                        variant="outline"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-2" />
                                        )}
                                        Confirm Deactivation
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
