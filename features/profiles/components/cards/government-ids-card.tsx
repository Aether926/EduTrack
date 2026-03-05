"use client";

import React from "react";
import { Shield, Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfileState } from "@/features/profiles/types/profile";

// ── ID row pair ────────────────────────────────────────────────────────────────

function IDRow({ fields, data, isEditing, onInputChange }: {
    fields: { label: string; key: keyof ProfileState }[];
    data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
                {fields.map((f) => (
                    <label key={f.key} className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Shield size={13} className="text-blue-600 shrink-0" />{f.label}
                    </label>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
                {fields.map((f) => (
                    isEditing ? (
                        <Input key={f.key} value={(data[f.key] as string) ?? ""} onChange={(e) => onInputChange(f.key, e.target.value)} placeholder="(optional)" />
                    ) : (
                        <div key={f.key} className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                            {(data[f.key] as string) || "—"}
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

// ── Shared form body ───────────────────────────────────────────────────────────

const ID_ROWS: { label: string; key: keyof ProfileState }[][] = [
    [{ label: "PAG-IBIG No.", key: "pagibigNo" }, { label: "PhilHealth No.", key: "philHealthNo" }],
    [{ label: "GSIS No.", key: "gsisNo" }, { label: "TIN No.", key: "tinNo" }],
    [{ label: "SSS No.", key: "sssNo" }, { label: "UMID No.", key: "umidNo" }],
    [{ label: "PhilSys No. (PSN)", key: "philSysNo" }, { label: "Agency Employee No.", key: "agencyEmployeeNo" }],
];

function GovernmentIDsForm({ data, isEditing, onInputChange }: {
    data: ProfileState; isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    return (
        <div className="space-y-4">
            {ID_ROWS.map((row, i) => (
                <IDRow key={i} fields={row} data={data} isEditing={isEditing} onInputChange={onInputChange} />
            ))}
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function GovernmentIDsCard({
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
            <Card className="flex-col border-0 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="text-blue-600" size={20} />
                            <CardTitle>Government IDs & Numbers</CardTitle>
                        </div>
                        {isOwnProfile && (
                            <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5 text-muted-foreground hover:text-foreground">
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="text-xs">Edit</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <GovernmentIDsForm data={data} isEditing={false} onInputChange={onInputChange} />
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
                            <Shield className="text-blue-600" size={18} />
                            <SheetTitle>Edit Government IDs & Numbers</SheetTitle>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <GovernmentIDsForm data={data} isEditing={true} onInputChange={onInputChange} />
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