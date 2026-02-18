"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  fullName: string;

  qrToken: string | null;
  qrUrl: string;

  loading: boolean;
  isCooldown: boolean;
  cooldownLeftMs: number;

  onGenerate: () => void;
  onCopy: () => void;
  onDownload: () => void;

  qrCanvasWrapperRef: React.RefObject<HTMLDivElement | null>;
};

function sec(ms: number) {
  return Math.ceil(ms / 1000);
}

export default function ProfileQrModal({
  open,
  onOpenChange,
  fullName,
  qrToken,
  qrUrl,
  loading,
  isCooldown,
  cooldownLeftMs,
  onGenerate,
  onCopy,
  onDownload,
  qrCanvasWrapperRef,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile QR</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm opacity-70">Generate a QR that links to your public profile.</div>

          <div className="flex gap-2">
            <Button onClick={onGenerate} disabled={loading || isCooldown}>
              {loading ? "generating..." : isCooldown ? `Loading ${sec(cooldownLeftMs)}s` : "Generate"}
            </Button>
          </div>

          {qrToken ? (
            <>
              <div className="rounded-lg border p-4 flex items-center justify-center" ref={qrCanvasWrapperRef}>
                <QRCodeCanvas value={qrUrl || " "} size={220} includeMargin />
              </div>

              <div className="text-xs break-all opacity-70">{qrUrl}</div>

              <Button variant="secondary" onClick={onDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR (PNG)
              </Button>

              <div className="text-xs opacity-70">Owner: {fullName || "—"}</div>
            </>
          ) : (
            <div className="text-sm opacity-70">No QR generated yet.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
