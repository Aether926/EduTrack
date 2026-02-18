"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Copy, QrCode, Share2 } from "lucide-react";

export default function ProfileShareMenu({
  onOpenQr,
  onCopyLink,
}: {
  onOpenQr: () => void;
  onCopyLink: () => void;
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
