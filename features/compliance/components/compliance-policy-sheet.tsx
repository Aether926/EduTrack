"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

import { upsertCompliancePolicy } from "@/features/compliance/actions/admin-compliance-actions";
import type {
    TrainingCompliancePolicy,
} from "@/features/compliance/types/compliance";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5 block">
            {children}
        </label>
    );
}

export function CompliancePolicySheet(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    policies: TrainingCompliancePolicy[];
    schoolYear: string;
}) {
    const { open, onOpenChange, policies, schoolYear } = props;
    const router = useRouter();

    const [editingPolicy, setEditingPolicy] =
        useState<TrainingCompliancePolicy | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [policyForm, setPolicyForm] = useState({
        school_year: schoolYear,
        required_hours: "40",
        at_risk_threshold_hours: "10",
        period_start: "",
        period_end: "",
    });

    const handleClose = () => {
        onOpenChange(false);
        setEditingPolicy(null);
    };

    const handleSavePolicy = async () => {
        if (!policyForm.period_start || !policyForm.period_end) {
            toast.info("Please fill in all required fields.");
            return;
        }
        setSubmitting(true);
        try {
            await upsertCompliancePolicy({
                school_year: policyForm.school_year,
                required_hours: Number(policyForm.required_hours),
                at_risk_threshold_hours: Number(policyForm.at_risk_threshold_hours),
                period_start: policyForm.period_start,
                period_end: policyForm.period_end,
                is_edit: !!editingPolicy,
            });
            toast.success("Policy saved.");
            handleClose();
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:max-w-md p-0 gap-0 flex flex-col">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <SheetHeader className="relative">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <Settings className="h-4 w-4 text-blue-400" />
                            </div>
                            <SheetTitle className="text-sm font-medium text-muted-foreground">
                                {editingPolicy
                                    ? "Edit Compliance Policy"
                                    : "Manage Compliance Policy"}
                            </SheetTitle>
                        </div>
                    </SheetHeader>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Existing policies */}
                    {policies.length > 0 && !editingPolicy ? (
                        <div className="space-y-2">
                            <FieldLabel>Existing Policies</FieldLabel>
                            {policies.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/10"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {p.school_year}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                            {p.required_hours}h required ·{" "}
                                            {p.at_risk_threshold_hours}h threshold
                                        </p>
                                        <p className="text-[11px] text-muted-foreground font-mono">
                                            {p.period_start} → {p.period_end}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            setEditingPolicy(p);
                                            setPolicyForm({
                                                school_year: p.school_year,
                                                required_hours: String(p.required_hours),
                                                at_risk_threshold_hours: String(p.at_risk_threshold_hours),
                                                period_start: p.period_start,
                                                period_end: p.period_end,
                                            });
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            ))}
                            <div className="border-t border-border/60 pt-4">
                                <FieldLabel>Add New Policy</FieldLabel>
                            </div>
                        </div>
                    ) : null}

                    {/* Form */}
                    <div className="space-y-1">
                        <FieldLabel>School Year</FieldLabel>
                        <Input
                            value={policyForm.school_year}
                            onChange={(e) =>
                                setPolicyForm((f) => ({ ...f, school_year: e.target.value }))
                            }
                            placeholder="e.g. SY 2025-2026"
                            disabled={!!editingPolicy}
                            className="text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <FieldLabel>Required Hours</FieldLabel>
                            <Input
                                type="number"
                                value={policyForm.required_hours}
                                onChange={(e) =>
                                    setPolicyForm((f) => ({ ...f, required_hours: e.target.value }))
                                }
                                disabled={!!editingPolicy}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <FieldLabel>At-Risk Threshold (hrs)</FieldLabel>
                            <Input
                                type="number"
                                value={policyForm.at_risk_threshold_hours}
                                onChange={(e) =>
                                    setPolicyForm((f) => ({ ...f, at_risk_threshold_hours: e.target.value }))
                                }
                                className="text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <FieldLabel>Period Start</FieldLabel>
                            <Input
                                type="date"
                                value={policyForm.period_start}
                                onChange={(e) =>
                                    setPolicyForm((f) => ({ ...f, period_start: e.target.value }))
                                }
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <FieldLabel>Period End</FieldLabel>
                            <Input
                                type="date"
                                value={policyForm.period_end}
                                onChange={(e) =>
                                    setPolicyForm((f) => ({ ...f, period_end: e.target.value }))
                                }
                                min={policyForm.period_start || undefined}
                                className="text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-br from-card to-background flex justify-end gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSavePolicy}
                        disabled={submitting}
                        className="gap-1.5"
                    >
                        {submitting && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {submitting
                            ? "Saving..."
                            : editingPolicy
                              ? "Update Policy"
                              : "Save Policy"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}