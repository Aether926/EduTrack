"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadProfileImage, deleteProfileImage } from "@/features/profiles/actions/profile-image-action";

export function useProfileImage(initialImage?: string | null) {
    const [preview, setPreview]         = useState<string | null>(initialImage ?? null);
    const [cropSrc, setCropSrc]         = useState<string | null>(null);
    const [cropOpen, setCropOpen]       = useState(false);
    const [uploading, setUploading]     = useState(false);
    const fileInputRef                  = useRef<HTMLInputElement>(null);

    // Triggered when user selects a file
    function previewImage(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type client-side
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only image files are allowed (JPEG, PNG, WebP, GIF)");
            return;
        }

        // Validate size client-side
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be under 5MB");
            return;
        }

        // Open crop modal
        const objectUrl = URL.createObjectURL(file);
        setCropSrc(objectUrl);
        setCropOpen(true);

        // Reset input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // Called after crop is confirmed
    async function handleCropComplete(blob: Blob) {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", blob, "avatar.jpg");

            const result = await uploadProfileImage(formData);

            if (!result.ok) {
                toast.error(result.error);
                return;
            }

            // Add cache buster to force image refresh
            setPreview(`${result.url}?t=${Date.now()}`);
            toast.success("Profile picture updated.");
        } catch {
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    async function handleDeleteImage() {
        setUploading(true);
        try {
            const result = await deleteProfileImage();
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            setPreview(null);
            toast.success("Profile picture removed.");
        } catch {
            toast.error("Failed to remove image. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    return {
        preview,
        setPreview,
        previewImage,
        cropSrc,
        cropOpen,
        setCropOpen,
        uploading,
        fileInputRef,
        handleCropComplete,
        handleDeleteImage,
    };
}