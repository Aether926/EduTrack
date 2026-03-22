"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Copy,
    Download,
    QrCode,
    Share2,
    Shield,
    Settings2,
    ChevronDown,
    ChevronUp,
    Check,
} from "lucide-react";
import PrivacySettingsSheet from "@/features/profiles/components/privacy-settings-sheet";
import type { PrivacySettings } from "@/features/profiles/actions/privacy-actions";

export default function ProfileShareMenu({
    onOpenQr,
    onCopyLink,
    onDownloadPdf,
    pdfGenerating,
    privacySettings,
    hasQr = false,
    qrUrl = "",
}: {
    onOpenQr: () => void;
    onCopyLink: () => void;
    onDownloadPdf: () => void;
    pdfGenerating?: boolean;
    privacySettings?: PrivacySettings | null;
    hasQr?: boolean;
    qrUrl?: string;
}) {
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [shareExpanded, setShareExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    function handleCopyLink() {
        if (!qrUrl) return;
        navigator.clipboard.writeText(qrUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
        onCopyLink();
    }

    const defaultSettings: PrivacySettings = {
        contactInfo: false,
        emergencyContact: false,
        educationCredentials: false,
        educationBackground: false,
    };

    return (
        <>
            <DropdownMenu
                onOpenChange={(open) => {
                    if (!open) setShareExpanded(false);
                }}
            >
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Settings2 size={16} />
                        Options
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                    {/* Share toggle */}
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setShareExpanded((v) => !v);
                        }}
                        className="flex items-center gap-2"
                    >
                        <Share2 className="h-4 w-4 shrink-0" />
                        <span className="flex-1">Share</span>
                        {shareExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </DropdownMenuItem>

                    {/* Inline share sub-items */}
                    {shareExpanded && (
                        <>
                            <DropdownMenuItem
                                onClick={onOpenQr}
                                className="pl-8 flex items-center gap-2"
                            >
                                <QrCode className="h-4 w-4 shrink-0" />
                                <span>Generate QR</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={handleCopyLink}
                                disabled={!hasQr}
                                className="pl-8 flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                                        <span className="text-emerald-400">
                                            Copied!
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 shrink-0" />
                                        <span>Copy Link</span>
                                    </>
                                )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                disabled
                                className="pl-8 flex items-center gap-2"
                            >
                                <Download className="h-4 w-4 shrink-0" />
                                <span>Download PDS</span>
                                <span className="ml-auto text-[10px] text-muted-foreground">
                                    Soon
                                </span>
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setPrivacyOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Shield className="h-4 w-4 shrink-0" />
                        <span>Privacy Settings</span>
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
