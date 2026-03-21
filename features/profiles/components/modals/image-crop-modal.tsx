"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Crop as CropIcon } from "lucide-react";

interface ImageCropModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => Promise<void>;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageCropModal({
    open,
    onOpenChange,
    imageSrc,
    onCropComplete,
}: ImageCropModalProps) {
    const [crop, setCrop]         = useState<Crop>();
    const [saving, setSaving]     = useState(false);
    const imgRef                  = useRef<HTMLImageElement>(null);

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }, []);

    async function handleSave() {
        if (!imgRef.current || !crop) return;
        setSaving(true);

        try {
            const canvas  = document.createElement("canvas");
            const scaleX  = imgRef.current.naturalWidth  / imgRef.current.width;
            const scaleY  = imgRef.current.naturalHeight / imgRef.current.height;
            const size    = 400; // output 400x400px
            canvas.width  = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(
                imgRef.current,
                (crop.x  ?? 0) * scaleX,
                (crop.y  ?? 0) * scaleY,
                (crop.width  ?? 0) * scaleX,
                (crop.height ?? 0) * scaleY,
                0, 0, size, size,
            );

            canvas.toBlob(async (blob) => {
                if (!blob) return;
                await onCropComplete(blob);
                setSaving(false);
                onOpenChange(false);
            }, "image/jpeg", 0.92);
        } catch {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!saving) onOpenChange(o); }}>
            <DialogContent className="max-w-lg w-[90vw] p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                    <DialogHeader className="relative">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <CropIcon className="h-4 w-4 text-blue-400" />
                            </div>
                            <DialogTitle className="text-sm font-medium">
                                Crop Profile Picture
                            </DialogTitle>
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-1">
                            Drag to adjust the crop area. Image will be saved as 1:1 square.
                        </p>
                    </DialogHeader>
                </div>

                {/* Crop area */}
                <div className="flex items-center justify-center bg-black/50 p-4 max-h-[400px] overflow-auto">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={1}
                        circularCrop
                        keepSelection
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            onLoad={onImageLoad}
                            className="max-h-[360px] max-w-full object-contain"
                        />
                    </ReactCrop>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-border/60 flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-1.5"
                    >
                        {saving
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
                            : "Save Photo"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}