"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    fullName: string;
    qrToken: string | null;
    qrUrl: string;
    loading: boolean;
    cooldownUntil: number | null; // pass cooldownUntil instead of cooldownLeftMs
    onGenerate: () => void;
    onDownload: () => void;
    qrCanvasWrapperRef: React.RefObject<HTMLDivElement | null>;
};

const COOLDOWN_MS = 60_000;

export default function ProfileQrModal({
    open,
    onOpenChange,
    fullName,
    qrToken,
    qrUrl,
    loading,
    cooldownUntil,
    onGenerate,
    onDownload,
    qrCanvasWrapperRef,
}: Props) {
    const isMobile = useIsMobile();
    const [now, setNow] = useState(() => Date.now());


    // Tick every second to update countdown
    useEffect(() => {
        if (!cooldownUntil) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [cooldownUntil]);

    const cooldownLeftMs = Math.max(0, (cooldownUntil ?? 0) - now);
    const isCooldown = cooldownLeftMs > 0;
    const cooldownSec = Math.ceil(cooldownLeftMs / 1000);
    const cooldownProgress = cooldownUntil
        ? ((cooldownUntil - now) / COOLDOWN_MS) * 100
        : 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={cn(
                    "flex flex-col gap-0 p-0",
                    isMobile ? "h-[90vh] rounded-t-2xl" : "w-[400px] sm:w-[440px]",
                )}
            >
                {/* Header */}
                <SheetHeader className="px-5 py-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2 shrink-0">
                            <QrCode className="h-4 w-4 text-violet-400" />
                        </div>
                        <div>
                            <SheetTitle className="text-base">Profile QR Code</SheetTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Links to your public profile
                            </p>
                        </div>
                    </div>
                </SheetHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center gap-6">

                    {/* QR display */}
                    {qrToken ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div
                                ref={qrCanvasWrapperRef}
                                className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm"
                            >
                                <QRCodeCanvas value={qrUrl || " "} size={220} includeMargin />
                            </div>

                            {/* Owner name */}
                            <div className="text-center">
                                <p className="text-sm font-semibold">{fullName || "—"}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 break-all max-w-[280px]">{qrUrl}</p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={onDownload}
                                >
                                    <Download className="h-4 w-4" />
                                    Download PNG
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-8">
                                <QrCode className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            </div>
                            <p className="text-sm text-muted-foreground">No QR generated yet.</p>
                        </div>
                    )}

                    {/* Cooldown progress */}
                    {isCooldown && (
                        <div className="w-full space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Cooldown</span>
                                <span className="font-mono">{cooldownSec}s</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-violet-500/60 transition-all duration-1000"
                                    style={{ width: `${Math.max(0, cooldownProgress)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer — generate button */}
                <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-3">
                    <Button
                        onClick={onGenerate}
                        disabled={loading || isCooldown}
                        className="w-full gap-2"
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        {loading ? "Generating..." : isCooldown ? `Wait ${cooldownSec}s` : qrToken ? "Regenerate QR" : "Generate QR"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}