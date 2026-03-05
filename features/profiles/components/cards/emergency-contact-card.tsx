"use client";

import React from "react";
import { PhoneCall, User, MapPin, Heart, Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfileState } from "@/features/profiles/types/profile";

// ── Field ──────────────────────────────────────────────────────────────────────

function Field(props: {
    label: string; value: string; field: keyof ProfileState;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    type?: string; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    placeholder?: string;
}) {
    const { label, value, field, icon: Icon, type = "text", isEditing, onInputChange, placeholder } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                {Icon ? <Icon size={14} className="text-blue-600" /> : null}
                {label}
            </label>
            {isEditing ? (
                <Input type={type} value={value} onChange={(e) => onInputChange(field, e.target.value)} placeholder={placeholder} />
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">{value || "—"}</div>
            )}
        </div>
    );
}

// ── Shared form body ───────────────────────────────────────────────────────────

function EmergencyContactForm({ data, isEditing, onInputChange }: {
    data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    return (
        <div className="space-y-4">
            <Field label="Full Name" value={data.emergencyName} field="emergencyName" icon={User} isEditing={isEditing} onInputChange={onInputChange} placeholder="e.g. john Doe" />
            <Field label="Relationship" value={data.emergencyRelationship} field="emergencyRelationship" icon={Heart} isEditing={isEditing} onInputChange={onInputChange} placeholder="e.g. Spouse, Parent, Sibling" />
            <Field label="Address" value={data.emergencyAddress} field="emergencyAddress" icon={MapPin} isEditing={isEditing} onInputChange={onInputChange} placeholder="e.g. Ormoc City, Leyte" />
            <Field label="Telephone / Mobile No." value={data.emergencyTelephoneNo} field="emergencyTelephoneNo" icon={PhoneCall} type="tel" isEditing={isEditing} onInputChange={onInputChange} placeholder="e.g. 09XX-XXX-XXXX" />
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function EmergencyContactCard({
    data, isEditing, onInputChange,
    onEdit, onSave, onCancel,
    isOwnProfile = false,
    isSaving = false,
}: {
    data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onEdit?: () => void; onSave?: () => void; onCancel?: () => void;
    isOwnProfile?: boolean; isSaving?: boolean;
}) {
    const isMobile = useIsMobile();

    return (
        <>
            {/* ── Card — always read-only ── */}
            <Card className="border-0 shadow-lg w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PhoneCall className="text-blue-600" size={20} />
                            <CardTitle>Emergency Contact</CardTitle>
                        </div>
                        {isOwnProfile && (
                            <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5 text-muted-foreground hover:text-foreground">
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="text-xs">Edit</span>
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">
                        Person to contact in case of emergency
                    </p>
                </CardHeader>
                <CardContent className="space-y-4 w-full">
                    <EmergencyContactForm data={data} isEditing={false} onInputChange={onInputChange} />
                </CardContent>
            </Card>

            {/* ── Edit Sheet ── */}
            <Sheet open={isEditing} onOpenChange={(open) => { if (!open) onCancel?.(); }}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={[
                        "flex flex-col gap-0 p-0 overflow-hidden",
                        isMobile ? "h-[92vh] rounded-t-2xl" : "w-[500px] sm:w-[540px]",
                    ].join(" ")}
                >
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <PhoneCall className="text-blue-600" size={18} />
                            <SheetTitle>Edit Emergency Contact</SheetTitle>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Person to contact in case of emergency
                        </p>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <EmergencyContactForm data={data} isEditing={true} onInputChange={onInputChange} />
                    </div>

                    <SheetFooter className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-row gap-2 shrink-0">
                        <Button onClick={onSave} disabled={isSaving} className="gap-2 flex-1">
                            {isSaving
                                ? <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                : <Save size={16} />}
                            Save
                        </Button>
                        <Button variant="secondary" onClick={onCancel} disabled={isSaving} className="gap-2 flex-1">
                            <X size={16} />Cancel
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}