"use client";

import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LETTER_COLORS: Record<
    string,
    { bg: string; text: string; ring: string }
> = {
    // Blue — A B C
    A: {
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        ring: "ring-blue-500/30",
    },
    B: {
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        ring: "ring-blue-500/30",
    },
    C: {
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        ring: "ring-blue-500/30",
    },
    // Sky — D E F
    D: { bg: "bg-sky-500/20", text: "text-sky-300", ring: "ring-sky-500/30" },
    E: { bg: "bg-sky-500/20", text: "text-sky-300", ring: "ring-sky-500/30" },
    F: { bg: "bg-sky-500/20", text: "text-sky-300", ring: "ring-sky-500/30" },
    // Cyan — G H I
    G: {
        bg: "bg-cyan-500/20",
        text: "text-cyan-300",
        ring: "ring-cyan-500/30",
    },
    H: {
        bg: "bg-cyan-500/20",
        text: "text-cyan-300",
        ring: "ring-cyan-500/30",
    },
    I: {
        bg: "bg-cyan-500/20",
        text: "text-cyan-300",
        ring: "ring-cyan-500/30",
    },
    // Emerald — J K L
    J: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-300",
        ring: "ring-emerald-500/30",
    },
    K: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-300",
        ring: "ring-emerald-500/30",
    },
    L: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-300",
        ring: "ring-emerald-500/30",
    },
    // Violet — M N P
    M: {
        bg: "bg-violet-500/20",
        text: "text-violet-300",
        ring: "ring-violet-500/30",
    },
    N: {
        bg: "bg-violet-500/20",
        text: "text-violet-300",
        ring: "ring-violet-500/30",
    },
    O: {
        bg: "bg-violet-500/20",
        text: "text-violet-300",
        ring: "ring-violet-500/30",
    },
    // Amber — Q R S
    P: {
        bg: "bg-amber-500/20",
        text: "text-amber-300",
        ring: "ring-amber-500/30",
    },
    Q: {
        bg: "bg-amber-500/20",
        text: "text-amber-300",
        ring: "ring-amber-500/30",
    },
    R: {
        bg: "bg-amber-500/20",
        text: "text-amber-300",
        ring: "ring-amber-500/30",
    },
    // Rose — T U V
    S: {
        bg: "bg-rose-500/20",
        text: "text-rose-300",
        ring: "ring-rose-500/30",
    },
    T: {
        bg: "bg-rose-500/20",
        text: "text-rose-300",
        ring: "ring-rose-500/30",
    },
    U: {
        bg: "bg-rose-500/20",
        text: "text-rose-300",
        ring: "ring-rose-500/30",
    },
    // Orange — V W X
    V: {
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        ring: "ring-orange-500/30",
    },
    W: {
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        ring: "ring-orange-500/30",
    },
    X: {
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        ring: "ring-orange-500/30",
    },
    // Yellow — Y Z
    Y: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-300",
        ring: "ring-yellow-500/30",
    },
    Z: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-300",
        ring: "ring-yellow-500/30",
    },
};

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
