"use client";

import React from "react";
import { PhoneCall, User, MapPin, Heart, Edit2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactInput } from "@/components/formatter/contact-format";
import { NameInput } from "@/components/formatter/name-format";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfileState } from "@/features/profiles/types/profile";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPhone(raw: string): string | null {
    const d = raw.replace(/\D/g, "");
    const n = d.startsWith("63") && d.length === 12 ? "0" + d.slice(2) : d;
    return /^09\d{9}$/.test(n)
        ? `${n.slice(0, 4)}-${n.slice(4, 7)}-${n.slice(7)}`
        : null;
}

// ── Display value ──────────────────────────────────────────────────────────────

function DisplayValue({
    value,
    phone,
}: {
    value?: string | null;
    phone?: boolean;
}) {
    const display = phone && value ? (fmtPhone(value) ?? value) : value;
    return (
        <div className="px-3 py-2 rounded-md bg-white/5 border border-white/8 text-sm font-medium text-foreground">
            {display ? (
                <span className={phone ? "font-mono" : undefined}>
                    {display}
                </span>
            ) : (
                <span className="text-muted-foreground">—</span>
            )}
        </div>
    );
}

// ── Field ──────────────────────────────────────────────────────────────────────

function Field(props: {
    label: string;
    value: string;
    field: keyof ProfileState;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    type?: string;
    inputVariant?: "name" | "contact" | "default";
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    placeholder?: string;
}) {
    const {
        label,
        value,
        field,
        icon: Icon,
        type = "text",
        inputVariant = "default",
        isEditing,
        onInputChange,
        placeholder,
    } = props;

    const inputCls =
        "bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20";

    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                {Icon && <Icon size={12} className="text-blue-400 shrink-0" />}
                {label}
            </label>
            {isEditing ? (
                inputVariant === "contact" ? (
                    <ContactInput
                        value={value}
                        onChange={(v: string) => onInputChange(field, v)}
                        placeholder={placeholder}
                        className={inputCls}
                    />
                ) : inputVariant === "name" ? (
                    <NameInput
                        value={value}
                        onChange={(v: string) => onInputChange(field, v)}
                        placeholder={placeholder}
                        className={inputCls}
                    />
                ) : (
                    <Input
                        type={type}
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        placeholder={placeholder}
                        className={inputCls}
                    />
                )
            ) : (
                <DisplayValue
                    value={value}
                    phone={inputVariant === "contact"}
                />
            )}
        </div>
    );
}

// ── Shared form body ───────────────────────────────────────────────────────────

function EmergencyContactForm({
    data,
    isEditing,
    onInputChange,
}: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    return (
        <div className="space-y-4">
            <Field
                label="Full Name"
                value={data.emergencyName}
                field="emergencyName"
                icon={User}
                inputVariant="name"
                isEditing={isEditing}
                onInputChange={onInputChange}
                placeholder="e.g. John Doe"
            />
            <Field
                label="Relationship"
                value={data.emergencyRelationship}
                field="emergencyRelationship"
                icon={Heart}
                isEditing={isEditing}
                onInputChange={onInputChange}
                placeholder="e.g. Spouse, Parent, Sibling"
            />
            <Field
                label="Address"
                value={data.emergencyAddress}
                field="emergencyAddress"
                icon={MapPin}
                isEditing={isEditing}
                onInputChange={onInputChange}
                placeholder="e.g. Ormoc City, Leyte"
            />
            <Field
                label="Telephone / Mobile No."
                value={data.emergencyTelephoneNo}
                field="emergencyTelephoneNo"
                icon={PhoneCall}
                inputVariant="contact"
                isEditing={isEditing}
                onInputChange={onInputChange}
                placeholder="e.g. 09XX-XXX-XXXX"
            />
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function EmergencyContactCard({
    data,
    isEditing,
    onInputChange,
    onEdit,
    onSave,
    onCancel,
    isOwnProfile = false,
    isSaving = false,
}: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    onEdit?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    isOwnProfile?: boolean;
    isSaving?: boolean;
}) {
    const isMobile = useIsMobile();

    return (
        <>
            {/* ── Read-only Card ── */}
            <div className="border border-border/60 shadow-lg w-full overflow-hidden rounded-xl bg-card">
                <div className="relative px-6 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <PhoneCall className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <span className="text-base font-semibold text-foreground">
                                    Emergency Contact
                                </span>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Person to contact in case of emergency
                                </p>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEdit}
                                className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
                <div className="px-6 py-5 w-full">
                    <EmergencyContactForm
                        data={data}
                        isEditing={false}
                        onInputChange={onInputChange}
                    />
                </div>
            </div>

            {/* ── Edit Sheet ── */}
            <Sheet
                open={isEditing}
                onOpenChange={(open) => {
                    if (!open) onCancel?.();
                }}
            >
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={[
                        "flex flex-col gap-0 p-0 overflow-hidden border-border/60",
                        isMobile
                            ? "h-[92vh] rounded-t-2xl"
                            : "w-[500px] sm:w-[540px]",
                    ].join(" ")}
                >
                    <SheetHeader className="relative px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                        <div className="relative flex items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5">
                                <PhoneCall className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <SheetTitle className="text-sm font-medium text-muted-foreground">
                                    Edit Emergency Contact
                                </SheetTitle>
                                <p className="text-[11px] text-muted-foreground/60">
                                    Person to contact in case of emergency
                                </p>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <EmergencyContactForm
                            data={data}
                            isEditing={true}
                            onInputChange={onInputChange}
                        />
                    </div>
                    <SheetFooter className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-row gap-2 shrink-0">
                        <Button
                            onClick={onSave}
                            disabled={isSaving}
                            className="gap-2 flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            {isSaving ? (
                                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={15} />
                            )}
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="gap-2 flex-1 border-white/10 hover:bg-white/5"
                        >
                            <X size={15} />
                            Cancel
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
