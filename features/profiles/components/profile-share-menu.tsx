"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Download, Loader2, QrCode, Share2, Shield } from "lucide-react";
import PrivacySettingsSheet from "@/features/profiles/components/privacy-settings-sheet";
import type { PrivacySettings } from "@/features/profiles/actions/privacy-actions";

export default function ProfileShareMenu({
    onOpenQr,
    onCopyLink,
    onDownloadPdf,
    pdfGenerating,
    privacySettings,
}: {
    onOpenQr:        () => void;
    onCopyLink:      () => void;
    onDownloadPdf:   () => void;
    pdfGenerating?:  boolean;
    privacySettings?: PrivacySettings | null;
}) {
    const [privacyOpen, setPrivacyOpen] = useState(false);

    const defaultSettings: PrivacySettings = {
        personalInfo:        false,
        contactInfo:         false,
        address:             false,
        familyBackground:    false,
        governmentIds:       false,
        emergencyContact:    false,
        educationCredentials:false,
        educationBackground: true,
        employmentInfo:      true,
        trainings:           true,
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Share2 size={18} />
                        Share
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onOpenQr}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled onClick={onCopyLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy link
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDS (Partial)
                        <span className="ml-auto text-[10px] text-muted-foreground">Under Development</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setPrivacyOpen(true)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Privacy Settings
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <PrivacySettingsSheet
                open={privacyOpen}
                onOpenChange={setPrivacyOpen}
                initialSettings={privacySettings ?? defaultSettings}
            />
        </>
    );
}