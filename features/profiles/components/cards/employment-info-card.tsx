import React, { useEffect, useState } from "react";
import { Briefcase, FileText, Calendar, Pencil, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { RequestHRChangeModal } from "@/features/profiles/components/modals/request-employment-info";
import { useEmploymentHR } from "@/features/profiles/hooks/use-employment-info";
import type { ProfileState } from "@/features/profiles/types/profile";
import { PositionSelect } from "@/components/formatter/position-select";
import { EmployeeIdInput } from "@/components/formatter/employee-id-format";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function DisplayValue({ value }: { value?: string | null }) {
    return (
        <div className="px-3 py-2 rounded-md bg-white/5 border border-white/8 text-sm font-medium text-foreground break-words">
            {value || <span className="text-muted-foreground">—</span>}
        </div>
    );
}

function FieldLabel({
    icon: Icon,
    children,
}: {
    icon?: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            {Icon && <Icon size={12} className="text-blue-400 shrink-0" />}
            {children}
        </label>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest shrink-0">
                {label}
            </span>
            <div className="h-px flex-1 bg-border/50" />
        </div>
    );
}

function ReadOnlyField({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
    return (
        <div className="space-y-1.5">
            <FieldLabel icon={icon as React.ElementType | undefined}>
                {label}
            </FieldLabel>
            <DisplayValue value={value} />
        </div>
    );
}

function ReadOnlyDate({
    label,
    value,
}: {
    label: string;
    value: Date | string | undefined;
}) {
    const formatted = value
        ? typeof value === "string"
            ? new Date(
                  value.includes("T") ? value : value + "T00:00:00",
              ).toLocaleDateString()
            : value.toLocaleDateString()
        : undefined;

    return (
        <div className="space-y-1.5">
            <FieldLabel icon={Calendar as React.ElementType}>
                {label}
            </FieldLabel>
            <DisplayValue value={formatted} />
        </div>
    );
}

function CardShell({
    icon: Icon,
    title,
    headerRight,
    children,
}: {
    icon: React.ElementType;
    title: string;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="border border-border/60 shadow-lg w-full overflow-hidden rounded-xl bg-card">
            <div className="relative px-6 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                            <Icon className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-base font-semibold text-foreground">
                            {title}
                        </span>
                    </div>
                    {headerRight}
                </div>
            </div>
            <div className="px-6 py-5 space-y-4">{children}</div>
        </div>
    );
}

export default function EmploymentInfoCard(props: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onDateChange: (field: keyof ProfileState, date: Date | undefined) => void;
    viewerRole?: "ADMIN" | "TEACHER" | "GUEST";
    from?: "profile" | "qr" | "teacher";
    isOwnProfile?: boolean;
    onRefresh?: () => void;
}) {
    const {
        data,
        isEditing,
        onInputChange,
        onDateChange,
        viewerRole = "TEACHER",
        onRefresh,
    } = props;
    const isAdmin = viewerRole === "ADMIN";
    const isOwnProfile = props.isOwnProfile ?? props.from === "profile";

    const [modalOpen, setModalOpen] = useState(false);

    const {
        submitting,
        lastRequest,
        loadingLastRequest,
        hasPendingRequest,
        fetchLastRequest,
        submitRequest,
    } = useEmploymentHR(data.id ?? "");

    useEffect(() => {
        if (isOwnProfile && data.id) void fetchLastRequest();
    }, [isOwnProfile, data.id, fetchLastRequest]);

    const handleSubmit: typeof submitRequest = async (...args) => {
        const result = await submitRequest(...args);
        await fetchLastRequest();
        onRefresh?.();
        return result;
    };

    if (isAdmin && isEditing) {
        return (
            <CardShell icon={Briefcase} title="Employment Information">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <FieldLabel icon={FileText as React.ElementType}>
                            Employee ID{" "}
                            <span className="text-rose-400 ml-0.5">*</span>
                        </FieldLabel>
                        <EmployeeIdInput
                            value={data.employeeId}
                            onChange={(v) => onInputChange("employeeId", v)}
                            className="bg-white/5 border-white/10 focus:border-blue-500/50"
                            placeholder="7-digit employee ID"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel icon={Briefcase as React.ElementType}>
                            Position / Designation
                        </FieldLabel>
                        <PositionSelect
                            value={data.position}
                            onChange={(v) => onInputChange("position", v)}
                            triggerClassName="w-full bg-white/5 border-white/10 hover:bg-white/8 text-[13.5px]"
                            inputClassName="bg-white/5 border-white/10 text-foreground text-[13.5px] focus:border-blue-500/50"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <FieldLabel icon={FileText as React.ElementType}>
                        Plantilla No.
                    </FieldLabel>
                    <Input
                        value={data.plantillaNo}
                        onChange={(e) =>
                            onInputChange("plantillaNo", e.target.value)
                        }
                        placeholder="(optional)"
                        className="bg-white/5 border-white/10 focus:border-blue-500/50"
                    />
                </div>

                <SectionDivider label="Appointment History" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <FieldLabel icon={Calendar as React.ElementType}>
                            Date of Original Appointment
                        </FieldLabel>
                        <Input
                            type="date"
                            value={
                                data.dateOfOriginalAppointment
                                    ? data.dateOfOriginalAppointment
                                          .toISOString()
                                          .split("T")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                onDateChange(
                                    "dateOfOriginalAppointment",
                                    e.target.value
                                        ? new Date(e.target.value)
                                        : undefined,
                                )
                            }
                            className="bg-white/5 border-white/10 focus:border-blue-500/50"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel icon={Calendar as React.ElementType}>
                            Date of Latest Appointment
                        </FieldLabel>
                        <Input
                            type="date"
                            value={
                                data.dateOfLatestAppointment
                                    ? data.dateOfLatestAppointment
                                          .toISOString()
                                          .split("T")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                onDateChange(
                                    "dateOfLatestAppointment",
                                    e.target.value
                                        ? new Date(e.target.value)
                                        : undefined,
                                )
                            }
                            className="bg-white/5 border-white/10 focus:border-blue-500/50"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel icon={Calendar as React.ElementType}>
                            Date of Original Deployment
                        </FieldLabel>
                        <Input
                            type="date"
                            value={
                                data.dateOfOriginalDeployment
                                    ? data.dateOfOriginalDeployment
                                          .toISOString()
                                          .split("T")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                onDateChange(
                                    "dateOfOriginalDeployment",
                                    e.target.value
                                        ? new Date(e.target.value)
                                        : undefined,
                                )
                            }
                            className="bg-white/5 border-white/10 focus:border-blue-500/50"
                        />
                    </div>
                </div>
            </CardShell>
        );
    }

    // ── Teacher / Guest read-only view ───────────────────────────────────────
    const requestButton = isOwnProfile ? (
        hasPendingRequest ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
                <Clock size={12} />
                Request Pending
            </span>
        ) : (
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap border-white/10 hover:bg-white/5 text-xs"
                onClick={() => setModalOpen(true)}
                disabled={loadingLastRequest}
            >
                <Pencil size={14} />
                Request Change
            </Button>
        )
    ) : undefined;

    return (
        <>
            <CardShell
                icon={Briefcase}
                title="Employment Information"
                headerRight={requestButton}
            >
                {/* Last request status */}
                {isOwnProfile && lastRequest && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                            Last request:
                        </span>
                        <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_COLORS[lastRequest.status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}
                        >
                            {lastRequest.status}
                        </span>
                        {lastRequest.review_note && (
                            <span className="text-muted-foreground text-xs truncate">
                                — {lastRequest.review_note}
                            </span>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ReadOnlyField
                        label="Employee ID"
                        value={data.employeeId}
                        icon={FileText}
                    />
                    <ReadOnlyField
                        label="Position / Designation"
                        value={data.position}
                        icon={Briefcase}
                    />
                </div>
                <ReadOnlyField
                    label="Plantilla No."
                    value={data.plantillaNo}
                    icon={FileText}
                />

                <SectionDivider label="Current Appointment" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ReadOnlyDate
                        label="Date of Original Appointment"
                        value={data.dateOfOriginalAppointment}
                    />
                    <ReadOnlyDate
                        label="Date of Latest Appointment"
                        value={data.dateOfLatestAppointment}
                    />
                    <ReadOnlyDate
                        label="Date of Original Deployment"
                        value={data.dateOfOriginalDeployment}
                    />
                </div>
            </CardShell>

            <RequestHRChangeModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                currentData={data}
                submitting={submitting}
                onSubmit={handleSubmit}
            />
        </>
    );
}
