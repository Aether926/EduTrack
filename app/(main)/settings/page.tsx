/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Lock, Eye, EyeOff, Loader2, CheckCircle2,
  Clock, Trash2, AlertTriangle, ShieldCheck, XCircle,
  LogOut, Monitor, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  changePassword,
  getSessionInfo,
  requestAccountDeletion,
  cancelDeletionRequest,
  getMyDeletionRequest,
} from "@/features/settingss/actions/settings-actions";

function PasswordInput({
  id, value, onChange, placeholder, autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    dateStyle: "medium", timeStyle: "short",
  });
}

function useCountdown(scheduledAt: string | null) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!scheduledAt) return;
    const update = () => {
      const diff = new Date(scheduledAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Grace period expired — pending admin review"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s remaining`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [scheduledAt]);

  return remaining;
}

// ── Change Password Section ───────────────────────────────────────────────────
function ChangePasswordSection() {
  const [current, setCurrent]         = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirm, setConfirm]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [sessionModal, setSessionModal] = useState(false);
  const [signingOut, setSigningOut]   = useState(false);
  const router = useRouter();

  function getIssues(pw: string) {
    const issues: string[] = [];
    if (pw.length < 8)                       issues.push("at least 8 characters");
    if (!/[A-Z]/.test(pw))                  issues.push("1 uppercase letter");
    if ((pw.match(/\d/g) ?? []).length < 3) issues.push("3 numbers");
    return issues;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current)          return toast.error("Enter your current password.");
    const issues = getIssues(newPw);
    if (issues.length)     return toast.error(`Password too weak. Needs: ${issues.join(", ")}.`);
    if (newPw !== confirm) return toast.error("Passwords don't match.");

    setLoading(true);
    try {
      const result = await changePassword(current, newPw);
      if (!result.ok) { toast.error(result.error); return; }
      setCurrent(""); setNewPw(""); setConfirm("");
      setSessionModal(true);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOutEverywhere() {
    setSigningOut(true);
    await supabase.auth.signOut({ scope: "global" });
    router.push("/signin");
  }

  async function handleSignOutOthers() {
    setSigningOut(true);
    await supabase.auth.signOut({ scope: "others" });
    toast.success("Password updated. All other devices have been signed out.");
    setSessionModal(false);
    setSigningOut(false);
  }

  function handleStayLoggedIn() {
    toast.success("Password updated successfully.");
    setSessionModal(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Change Password</CardTitle>
          </div>
          <CardDescription>
            Must be at least 8 characters with 1 uppercase letter and 3 numbers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current Password</Label>
              <PasswordInput
                id="current" value={current} onChange={setCurrent}
                placeholder="Enter current password" autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newpw">New Password</Label>
              <PasswordInput
                id="newpw" value={newPw} onChange={setNewPw}
                placeholder="Enter new password" autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <PasswordInput
                id="confirm" value={confirm} onChange={setConfirm}
                placeholder="Confirm new password" autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
                : "Update Password"
              }
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Post-change session modal */}
      <Dialog open={sessionModal} onOpenChange={(o) => { if (!o && !signingOut) handleStayLoggedIn(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Password Updated
            </DialogTitle>
            <DialogDescription>
              Your password has been changed successfully. What would you like to do with your other sessions?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5">
            {/* Sign out everywhere */}
            <button
              onClick={handleSignOutEverywhere}
              disabled={signingOut}
              className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
            >
              <LogOut className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Sign out everywhere</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sign out of all devices including this one. You'll need to sign in again.
                </p>
              </div>
            </button>

            {/* Sign out others */}
            <button
              onClick={handleSignOutOthers}
              disabled={signingOut}
              className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Monitor className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Sign out other devices</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Stay logged in here but sign out all other devices.
                </p>
              </div>
            </button>

            {/* Stay logged in */}
            <button
              onClick={handleStayLoggedIn}
              disabled={signingOut}
              className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Shield className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Stay logged in everywhere</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Keep all active sessions. Only do this if all devices are yours.
                </p>
              </div>
            </button>
          </div>

          {signingOut && (
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing out...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Session Info Section ──────────────────────────────────────────────────────
function SessionInfoSection() {
  const [info, setInfo] = useState<{
    email: string;
    lastSignIn: string | null;
    createdAt: string | null;
  } | null>(null);

  useEffect(() => {
    getSessionInfo().then((r) => { if (r.ok && r.data) setInfo(r.data); });
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Account Activity</CardTitle>
        </div>
        <CardDescription>Your current session and account information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{info?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Last sign in</span>
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {formatDate(info?.lastSignIn ?? null)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Account created</span>
            <span className="text-sm font-medium">{formatDate(info?.createdAt ?? null)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Danger Zone Section ───────────────────────────────────────────────────────
function DangerZoneSection() {
  const [requestModal, setRequestModal] = useState(false);
  const [cancelModal, setCancelModal]   = useState(false);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [reason, setReason]             = useState("");
  const [loading, setLoading]           = useState(false);
  const [pendingRequest, setPendingRequest] = useState<{
    id: string;
    status: string;
    reason: string | null;
    initiated_by: string;
    scheduled_at: string | null;
    admin_note: string | null;
  } | null>(null);

  const countdown = useCountdown(pendingRequest?.scheduled_at ?? null);

  useEffect(() => {
    getMyDeletionRequest().then((r) => {
      if (r.ok) setPendingRequest(r.data ?? null);
    });
  }, []);

  const handleRequest = async () => {
    if (!email.trim() || !password || !reason.trim())
      return toast.error("Please fill in all fields.");
    setLoading(true);
    try {
      const result = await requestAccountDeletion(email, password, reason);
      if (!result.ok) return toast.error(result.error);
      toast.success("Deletion request submitted. You have a grace period to cancel.");
      setRequestModal(false);
      setEmail(""); setPassword(""); setReason("");
      // Refresh pending request
      const r = await getMyDeletionRequest();
      if (r.ok) setPendingRequest(r.data ?? null);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!pendingRequest) return;
    setLoading(true);
    try {
      const result = await cancelDeletionRequest(pendingRequest.id);
      if (!result.ok) return toast.error(result.error);
      toast.success("Deletion request cancelled.");
      setPendingRequest(null);
      setCancelModal(false);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <CardTitle className="text-base text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        </div>
        <CardDescription>
          Irreversible actions. Please read carefully before proceeding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingRequest ? (
          /* Pending deletion warning */
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Account deletion pending
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                  {pendingRequest.initiated_by === "ADMIN"
                    ? "An administrator has initiated deletion of your account."
                    : "You have requested deletion of your account."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-500">
              <Clock className="h-3.5 w-3.5" />
              {countdown}
            </div>

            {pendingRequest.admin_note && (
              <p className="text-xs text-muted-foreground border-t pt-2">
                Admin note: {pendingRequest.admin_note}
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-700 border-red-300 hover:bg-red-50"
              onClick={() => setCancelModal(true)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Deletion Request
            </Button>
          </div>
        ) : (
          /* Request deletion button */
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Request permanent deletion of your account. Requires admin approval after a grace period.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-700 border-red-300 hover:bg-red-50 shrink-0"
              onClick={() => setRequestModal(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Request Deletion
            </Button>
          </div>
        )}
      </CardContent>

      {/* Request deletion modal */}
      <Dialog open={requestModal} onOpenChange={(o) => { if (!o) setRequestModal(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Request Account Deletion
            </DialogTitle>
            <DialogDescription>
              Verify your identity before submitting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-800 dark:text-red-400">
              <p className="font-semibold mb-1">⚠ Before you proceed</p>
              <p>Your account and all associated data will be permanently deleted after admin review. You have a grace period to cancel this request.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Confirm your email"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <PasswordInput
                id="del-pw" value={password} onChange={setPassword}
                placeholder="Confirm your password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason for deletion</Label>
              <Textarea
                value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Why do you want to delete your account?"
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRequest} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation modal */}
      <Dialog open={cancelModal} onOpenChange={(o) => { if (!o) setCancelModal(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Deletion Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your account deletion request? Your account will remain active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModal(false)}>Keep Request</Button>
            <Button onClick={handleCancel} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Yes, Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Account</Badge>
            <Badge variant="outline">Settings</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account security and preferences.
          </p>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-6">
          <SessionInfoSection />
          <ChangePasswordSection />
          <DangerZoneSection />
        </div>
      </div>
    </main>
  );
}