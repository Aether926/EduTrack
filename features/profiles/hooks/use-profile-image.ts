import { set } from "date-fns";
import React, { use, useState } from "react";

export function useProfileImage() {
    const [preview, setPreview] = useState<string | null>(null);

    const previewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
    };

    return { preview, setPreview, previewImage };
}