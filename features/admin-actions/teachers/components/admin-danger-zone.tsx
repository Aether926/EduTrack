/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { adminInitiateDeletion } from "@/features/settingss/actions/admin-deletion-actions";
import { supabase } from "@/lib/supabaseClient";

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
}: {
  teacherId: string;
  teacherName: string;
}) {
  const [modal, setModal]             = useState(false);
  const [step, setStep]               = useState<"reason" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason]     = useState("");
  const [adminPassword, setAdminPassword]   = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [loading, setLoading]               = useState(false);

  const isCustom    = selectedReason === "Custom reason";
  const finalReason = isCustom ? customReason.trim() : selectedReason;

  function handleOpen() {
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
    if (!finalReason) return toast.error("Please select or provide a reason.");
    setStep("confirm");
  }

  async function handleConfirm() {
    if (!adminPassword) return toast.error("Please enter your password to confirm.");

    setLoading(true);
    try {
      // Verify admin password first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return toast.error("Not authenticated.");

      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: adminPassword,
      });

      if (verifyErr) {
        toast.error("Incorrect password. Action cancelled.");
        setLoading(false);
        return;
      }

      // Initiate deletion
      const result = await adminInitiateDeletion(teacherId, finalReason);
      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      toast.success(`Deletion initiated for ${teacherName}. They have been notified.`);
      handleClose();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-base text-red-600 dark:text-red-400">
              Danger Zone
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete Teacher Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Initiates account deletion for{" "}
                <strong>{teacherName}</strong>. They will be notified and
                given a grace period before permanent deletion.
                This action requires your password to confirm.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-700 border-red-300 hover:bg-red-50 shrink-0"
              onClick={handleOpen}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Initiate Deletion
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modal} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="max-w-md">

          {/* Step 1 — Select reason */}
          {step === "reason" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Initiate Account Deletion
                </DialogTitle>
                <DialogDescription>
                  Select a reason for deleting{" "}
                  <strong>{teacherName}</strong>'s account.
                  They will be notified and have a grace period to respond.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                {ADMIN_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      selectedReason === r
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {selectedReason === r && (
                      <CheckCircle2 className="h-3.5 w-3.5 inline mr-2 text-primary" />
                    )}
                    {r}
                  </button>
                ))}

                {isCustom && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom reason..."
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none min-h-[80px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={handleNextStep}
                  disabled={!finalReason}
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
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Confirm Your Identity
                </DialogTitle>
                <DialogDescription>
                  Enter your admin password to confirm this action.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-800 dark:text-red-400 space-y-1">
                  <p className="font-semibold">⚠ Final Warning</p>
                  <p>
                    You are initiating deletion of{" "}
                    <strong>{teacherName}</strong>'s account.
                  </p>
                  <p className="text-xs mt-1">
                    Reason: <span className="font-medium">{finalReason}</span>
                  </p>
                  <p className="text-xs">
                    The teacher will be notified and their account will be
                    scheduled for permanent deletion after the grace period.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-pw">Your Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-pw"
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter your admin password"
                      className="pr-10"
                      onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStep("reason")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirm}
                  disabled={loading || !adminPassword}
                >
                  {loading
                    ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    : <Trash2 className="h-4 w-4 mr-2" />
                  }
                  Confirm Deletion
                </Button>
              </DialogFooter>
            </>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}