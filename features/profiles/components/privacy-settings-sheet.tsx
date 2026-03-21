"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import { savePrivacySettings, type PrivacySettings } from "@/features/profiles/actions/privacy-actions";

const PRIVACY_SECTIONS: { key: keyof PrivacySettings; label: string; description: string }[] = [
    { key: "personalInfo",        label: "Personal Information",  description: "Date of birth, age, gender, civil status, religion" },
    { key: "contactInfo",         label: "Contact Information",   description: "Contact number, email, telephone"                   },
    { key: "familyBackground",    label: "Family Background",     description: "Spouse, children, parents"                          },
    { key: "governmentIds",       label: "Government IDs",        description: "GSIS, TIN, SSS, PhilHealth, Pag-IBIG"               },
    { key: "emergencyContact",    label: "Emergency Contact",     description: "Emergency contact name and details"                 },
    { key: "educationCredentials",label: "Education Credentials", description: "Bachelor's degree, subject specialization, post graduate" },
    { key: "educationBackground", label: "Education History",  description: "Elementary, secondary, college, graduate"           },
    { key: "employmentInfo",      label: "Employment Information",description: "Position, appointment dates, plantilla"             },
    { key: "trainings",           label: "Trainings & Seminars",  description: "Professional development records"                   },
];

interface PrivacySettingsSheetProps {
    open:            boolean;
    onOpenChange:    (open: boolean) => void;
    initialSettings: PrivacySettings;
}

export default function PrivacySettingsSheet({
    open,
    onOpenChange,
    initialSettings,
}: PrivacySettingsSheetProps) {
    const [settings, setSettings] = useState<PrivacySettings>(initialSettings);
    const [saving, setSaving]     = useState(false);

    function toggle(key: keyof PrivacySettings) {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function makeAllPublic() {
        const all = {} as PrivacySettings;
        PRIVACY_SECTIONS.forEach(({ key }) => (all[key] = true));
        setSettings(all);
    }

    function makeAllPrivate() {
        const all = {} as PrivacySettings;
        PRIVACY_SECTIONS.forEach(({ key }) => (all[key] = false));
        setSettings(all);
    }

    async function handleSave() {
        setSaving(true);
        try {
            const result = await savePrivacySettings(settings);
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            toast.success("Privacy settings saved.");
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-hidden p-0 flex flex-col gap-0">
                {/* Header */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                            <Shield className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <SheetTitle className="text-sm">Privacy Settings</SheetTitle>
                            <SheetDescription className="text-[12px] mt-0.5">
                                Control what other teachers can see on your profile.
                            </SheetDescription>
                        </div>
                    </div>

                    {/* Quick toggles */}
                    <div className="flex gap-2 mt-3">
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1.5 text-xs"
                            onClick={makeAllPublic}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Make All Public
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1.5 text-xs"
                            onClick={makeAllPrivate}
                        >
                            <EyeOff className="h-3.5 w-3.5" />
                            Make All Private
                        </Button>
                    </div>
                </SheetHeader>

                {/* Section list */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                        Visible to other teachers
                    </p>
                    {PRIVACY_SECTIONS.map(({ key, label, description }) => (
                        <div
                            key={key}
                            className="flex items-center justify-between gap-3 py-3 border-b border-border/40 last:border-0"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    {settings[key]
                                        ? <Eye className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                        : <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    }
                                    <p className="text-sm font-medium">{label}</p>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 ml-5">
                                    {description}
                                </p>
                            </div>
                            <Switch
                                checked={settings[key]}
                                onCheckedChange={() => toggle(key)}
                            />
                        </div>
                    ))}

                    {/* Admin note */}
                    <div className="mt-4 rounded-lg border border-border/40 bg-muted/10 px-4 py-3">
                        <p className="text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground">Note:</span> Admins and Superadmins always see your full profile regardless of these settings.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/60 shrink-0">
                    <Button
                        className="w-full gap-2"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                            : "Save Settings"
                        }
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}