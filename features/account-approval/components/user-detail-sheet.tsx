"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PendingUser } from "../types";
import { fullName, fmtDate } from "../lib/utils";
import InitialAvatar from "@/components/avatar-ui-color/avatar-color";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    Mail,
    Phone,
    Briefcase,
    Hash,
    CalendarDays,
    MapPin,
} from "lucide-react";
import { useState } from "react";

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
            <div className="rounded-md border border-border/60 bg-muted/30 p-1.5 shrink-0 mt-0.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                </p>
                <p className="text-sm text-foreground mt-0.5 break-words">
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

function SectionLabel({ label }: { label: string }) {
    return (
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2 pb-1">
            {label}
        </p>
    );
}

interface UserDetailSheetProps {
    user: PendingUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (id: string) => void | Promise<void>;
    onReject: (id: string) => void | Promise<void>;
    variant: "pending" | "rejected";
}

export default function UserDetailSheet({
    user,
    open,
    onOpenChange,
    onApprove,
    onReject,
    variant,
}: UserDetailSheetProps) {
    const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

    if (!user) return null;

    const name = fullName(user).trim() || "(no name)";

    async function handleApprove() {
        if (!user) return;
        setLoading("approve");
        try {
            await onApprove(user.id);
            onOpenChange(false);
        } finally {
            setLoading(null);
        }
    }

    async function handleReject() {
        if (!user) return;
        setLoading("reject");
        try {
            await onReject(user.id);
            onOpenChange(false);
        } finally {
            setLoading(null);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col gap-0 p-0">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <SheetHeader className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <InitialAvatar name={name} className="h-10 w-10" />
                            <div className="min-w-0">
                                <SheetTitle className="text-base leading-tight">
                                    {name}
                                </SheetTitle>
                                <SheetDescription className="text-[12px] mt-0.5 truncate">
                                    {user.email}
                                </SheetDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                                className={
                                    user.status === "PENDING"
                                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                }
                            >
                                {user.status}
                            </Badge>
                            <Badge variant="outline" className="text-[11px]">
                                {user.role}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground ml-auto">
                                Registered {fmtDate(user.createdAt)}
                            </span>
                        </div>
                    </SheetHeader>
                </div>

                {/* Body */}
                <div className="flex-1 px-6 py-4 overflow-y-auto">
                    <SectionLabel label="Personal Information" />
                    <DetailRow icon={Mail} label="Email" value={user.email} />
                    <DetailRow
                        icon={Phone}
                        label="Contact Number"
                        value={user.contactNumber}
                    />

                    <SectionLabel label="Employment Information" />
                    <DetailRow
                        icon={Hash}
                        label="Employee ID"
                        value={user.employeeId}
                    />
                    <DetailRow
                        icon={Briefcase}
                        label="Position"
                        value={user.position}
                    />
                    <DetailRow
                        icon={CalendarDays}
                        label="Date of Original Appointment"
                        value={
                            user.dateOfOriginalAppointment
                                ? new Date(user.dateOfOriginalAppointment + "T00:00:00")
                                      .toLocaleDateString("en-PH", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                : null
                        }
                    />
                    <DetailRow
                        icon={MapPin}
                        label="Date of Original Deployment"
                        value={
                            user.dateOfOriginalDeployment
                                ? new Date(user.dateOfOriginalDeployment + "T00:00:00")
                                      .toLocaleDateString("en-PH", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                : null
                        }
                    />
                </div>

                {/* Footer actions */}
                {variant === "pending" && (
                    <div className="px-6 py-4 border-t border-border/60 flex gap-2 shrink-0">
                        <Button
                            className="flex-1 gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                            onClick={handleApprove}
                            disabled={!!loading}
                        >
                            {loading === "approve" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Approve
                        </Button>
                        <Button
                            className="flex-1 gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20"
                            onClick={handleReject}
                            disabled={!!loading}
                        >
                            {loading === "reject" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5" />
                            )}
                            Reject
                        </Button>
                    </div>
                )}

                {variant === "rejected" && (
                    <div className="px-6 py-4 border-t border-border/60 shrink-0">
                        <Button
                            className="w-full gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                            onClick={handleApprove}
                            disabled={!!loading}
                        >
                            {loading === "approve" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Approve anyway
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}