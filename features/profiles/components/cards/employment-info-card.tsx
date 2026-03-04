import React, { useEffect, useState } from "react";
import { Briefcase, FileText, Calendar, Pencil, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RequestHRChangeModal } from "@/features/profiles/components/modals/request-employment-info";
import { useEmploymentHR } from "@/features/profiles/hooks/use-employment-info";
import type { ProfileState } from "@/features/profiles/types/profile";

const POSITIONS = [
    "Teacher I",
    "Teacher II",
    "Teacher III",
    "Master Teacher I",
    "Master Teacher II",
    "Master Teacher III",
    "Principal",
    "Administrative Staff",
];

const STATUS_BADGE: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
};

function ReadOnlyField(props: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
    const { label, value, icon: Icon } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                {Icon ? <Icon size={14} className="text-blue-600" /> : null}
                {label}
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium break-words">
                {value || "—"}
            </div>
        </div>
    );
}

function ReadOnlyDate(props: { label: string; value: Date | undefined }) {
    const { label, value } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={14} className="text-blue-600" />
                {label}
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                {value ? value.toLocaleDateString() : "—"}
            </div>
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
    isOwnProfile?: boolean; // add this
}) {
    const {
        data,
        isEditing,
        onInputChange,
        onDateChange,
        viewerRole = "TEACHER",
    } = props;
    const isAdmin = viewerRole === "ADMIN";
    const isTeacher = viewerRole === "TEACHER";
    const isOwnProfile = props.from === "profile"; // add this

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

    // ── Admin edit mode ──────────────────────────────────────────────────────
    if (isAdmin && isEditing) {
        return (
            <Card className="flex flex-col border-0 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Briefcase className="text-blue-600" size={20} />
                        <CardTitle>Employment Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                <FileText size={14} className="text-blue-600" />
                                Employee ID{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={data.employeeId}
                                onChange={(e) =>
                                    onInputChange("employeeId", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                <Briefcase
                                    size={14}
                                    className="text-blue-600"
                                />
                                Position/Designation
                            </label>
                            <Select
                                value={data.position}
                                onValueChange={(v) =>
                                    onInputChange("position", v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {POSITIONS.map((p) => (
                                        <SelectItem key={p} value={p}>
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                            <FileText size={14} className="text-blue-600" />
                            Plantilla No.
                        </label>
                        <Input
                            value={data.plantillaNo}
                            onChange={(e) =>
                                onInputChange("plantillaNo", e.target.value)
                            }
                            placeholder="(optional)"
                        />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800" />

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-blue-600" />
                            Appointment History
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Date of Original Appointment
                                </label>
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
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Date of Latest Appointment
                                </label>
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
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ── Teacher / Guest read-only view ───────────────────────────────────────
    return (
        <>
            <Card className="flex flex-col border-0 shadow-lg">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Briefcase
                                className="text-blue-600 shrink-0"
                                size={20}
                            />
                            <CardTitle>Employment Information</CardTitle>
                        </div>
                        {isOwnProfile && props.from === "profile" && (
                            <div className="shrink-0">
                                {hasPendingRequest ? (
                                    <span className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
                                        <Clock size={12} />
                                        Request Pending
                                    </span>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 whitespace-nowrap"
                                        onClick={() => setModalOpen(true)}
                                        disabled={loadingLastRequest}
                                    >
                                        <Pencil size={14} />
                                        Request Change
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Last request status badge */}
                    {isOwnProfile &&
                        props.from === "profile" &&
                        lastRequest && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">
                                    Last request:
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[lastRequest.status]}`}
                                >
                                    {lastRequest.status}
                                </span>
                                {lastRequest.review_note && (
                                    <span className="text-gray-400 text-xs truncate">
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
                            label="Position/Designation"
                            value={data.position}
                            icon={Briefcase}
                        />
                    </div>

                    <ReadOnlyField
                        label="Plantilla No."
                        value={data.plantillaNo}
                        icon={FileText}
                    />

                    <div className="border-t border-gray-200 dark:border-gray-800" />

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-blue-600" />
                            Current Appointment
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <ReadOnlyDate
                                label="Date of Original Appointment"
                                value={data.dateOfOriginalAppointment}
                            />
                            <ReadOnlyDate
                                label="Date of Latest Appointment"
                                value={data.dateOfLatestAppointment}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <RequestHRChangeModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                currentData={data}
                submitting={submitting}
                onSubmit={submitRequest}
            />
        </>
    );
}
