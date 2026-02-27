"use client";

import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Blue: A B C | Sky: D E F | Cyan: G H I | Emerald: J K L
// Violet: M N O P | Amber: Q R S | Rose: T U V | Orange: O W X | Yellow: Y Z
const COLOR_MAP: {
    letters: string[];
    bg: string;
    text: string;
    ring: string;
}[] = [
    {
        letters: ["A", "B", "C"],
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        ring: "ring-blue-500/30",
    },
    {
        letters: ["D", "E", "F"],
        bg: "bg-sky-500/20",
        text: "text-sky-300",
        ring: "ring-sky-500/30",
    },
    {
        letters: ["G", "H", "I"],
        bg: "bg-cyan-500/20",
        text: "text-cyan-300",
        ring: "ring-cyan-500/30",
    },
    {
        letters: ["J", "K", "L"],
        bg: "bg-emerald-500/20",
        text: "text-emerald-300",
        ring: "ring-emerald-500/30",
    },
    {
        letters: ["M", "N", "P"],
        bg: "bg-violet-500/20",
        text: "text-violet-300",
        ring: "ring-violet-500/30",
    },
    {
        letters: ["Q", "R", "S"],
        bg: "bg-amber-500/20",
        text: "text-amber-300",
        ring: "ring-amber-500/30",
    },
    {
        letters: ["T", "U", "V"],
        bg: "bg-rose-500/20",
        text: "text-rose-300",
        ring: "ring-rose-500/30",
    },
    {
        letters: ["O", "W", "X"],
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        ring: "ring-orange-500/30",
    },
    {
        letters: ["Y", "Z"],
        bg: "bg-yellow-500/20",
        text: "text-yellow-300",
        ring: "ring-yellow-500/30",
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
