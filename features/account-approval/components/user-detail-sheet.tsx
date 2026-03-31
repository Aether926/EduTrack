"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import type { PendingUser } from "@/features/account-approval/types";
import { fmtDate, fullName } from "@/features/account-approval/lib/utils";
import UserAvatar from "@/components/ui-elements/user-avatar";
import { StatusBadge, RoleBadge } from "@/components/ui-elements/badges";
import {
    ApproveButton,
    ApproveAnywayButton,
    RejectButton,
} from "@/components/action-button";
import {
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
                            <UserAvatar
                                name={name}
                                src={user.profileImage}
                                className="h-10 w-10"
                            />
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
                            <StatusBadge status={user.status} />
                            <RoleBadge role={user.role} />
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
                                ? new Date(
                                      user.dateOfOriginalAppointment +
                                          "T00:00:00",
                                  ).toLocaleDateString("en-PH", {
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
                                ? new Date(
                                      user.dateOfOriginalDeployment +
                                          "T00:00:00",
                                  ).toLocaleDateString("en-PH", {
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
                        <ApproveButton
                            loading={loading === "approve"}
                            disabled={!!loading}
                            onClick={handleApprove}
                            size="default"
                        />
                        <RejectButton
                            loading={loading === "reject"}
                            disabled={!!loading}
                            onClick={handleReject}
                            size="default"
                        />
                    </div>
                )}

                {variant === "rejected" && (
                    <div className="px-6 py-4 border-t border-border/60 shrink-0">
                        <ApproveAnywayButton
                            loading={loading === "approve"}
                            disabled={!!loading}
                            onClick={handleApprove}
                            size="default"
                        />
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
