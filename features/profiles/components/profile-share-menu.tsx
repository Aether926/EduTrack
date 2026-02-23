"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Download, Loader2, QrCode, Share2 } from "lucide-react";

export default function ProfileShareMenu({
  onOpenQr,
  onCopyLink,
  onDownloadPdf,
  pdfGenerating,
}: {
  onOpenQr: () => void;
  onCopyLink: () => void;
  onDownloadPdf: () => void;
  pdfGenerating?: boolean;
}) {
  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}