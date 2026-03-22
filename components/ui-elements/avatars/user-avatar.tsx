"use client";

import InitialAvatar from "@/components/ui-elements/avatars/avatar-color";

/**
 * Returns first letter of first name + first letter of last name.
 */
function getFirstLastInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    // Return "X Y" so InitialAvatar splits on space and takes both letters
    return `${parts[0][0].toUpperCase()} ${parts[parts.length - 1][0].toUpperCase()}`;
}

interface UserAvatarProps {
    name: string;
    src?: string | null;
    className?: string;
}

export default function UserAvatar({ name, src, className }: UserAvatarProps) {
    // Color is based on full name's first letter (preserved via getFirstLastInitials)
    // InitialAvatar splits "D I" → ["D", "I"] → shows "DI"
    const initials = getFirstLastInitials(name);

    return <InitialAvatar name={initials} src={src} className={className} />;
}
