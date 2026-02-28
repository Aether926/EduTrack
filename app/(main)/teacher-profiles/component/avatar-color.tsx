"use client";

import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Violet: A B C D | Blue: E F G H | Teal: I J K L | Green: M N O P
// Orange: Q R S T | Red:  U V W   | Pink: X Y Z
const COLOR_MAP: {
    letters: string[];
    bg: string;
    text: string;
    ring: string;
}[] = [
    {
        letters: ["A", "B", "C", "D"],
        bg: "bg-violet-500/20",
        text: "text-violet-300",
        ring: "ring-violet-500/30",
    },
    {
        letters: ["E", "F", "G", "H"],
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        ring: "ring-blue-500/30",
    },
    {
        letters: ["I", "J", "K", "L"],
        bg: "bg-teal-500/20",
        text: "text-teal-300",
        ring: "ring-teal-500/30",
    },
    {
        letters: ["M", "N", "O", "P"],
        bg: "bg-emerald-500/20",
        text: "text-emerald-300",
        ring: "ring-emerald-500/30",
    },
    {
        letters: ["Q", "R", "S", "T"],
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        ring: "ring-orange-500/30",
    },
    {
        letters: ["U", "V", "W"],
        bg: "bg-red-500/20",
        text: "text-red-300",
        ring: "ring-red-500/30",
    },
    {
        letters: ["X", "Y", "Z"],
        bg: "bg-pink-500/20",
        text: "text-pink-300",
        ring: "ring-pink-500/30",
    },
];

const LETTER_COLORS: Record<
    string,
    { bg: string; text: string; ring: string }
> = Object.fromEntries(
    COLOR_MAP.flatMap(({ letters, bg, text, ring }) =>
        letters.map((l) => [l, { bg, text, ring }]),
    ),
);

const FALLBACK_COLOR = {
    bg: "bg-muted",
    text: "text-muted-foreground",
    ring: "ring-border",
};

function getAvatarColor(name: string) {
    const first = name.trim()[0]?.toUpperCase() ?? "";
    return LETTER_COLORS[first] ?? FALLBACK_COLOR;
}

interface InitialAvatarProps {
    name: string;
    src?: string | null;
    /** Extra classes applied to the Avatar root (e.g. size, group-hover ring) */
    className?: string;
}

export default function InitialAvatar({
    name,
    src,
    className,
}: InitialAvatarProps) {
    const color = getAvatarColor(name);

    const initials =
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase() || null;

    return (
        <Avatar
            className={`ring-1 ${color.ring} group-hover:ring-2 transition-all ${className ?? ""}`}
        >
            <AvatarImage src={src || undefined} />
            <AvatarFallback
                className={`text-[11px] font-semibold ${color.bg} ${color.text}`}
            >
                {initials ?? <UserRound className="h-4 w-4" />}
            </AvatarFallback>
        </Avatar>
    );
}
