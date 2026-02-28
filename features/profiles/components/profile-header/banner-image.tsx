"use client";

const COLOR_MAP: { letters: string[]; hue: number }[] = [
    { letters: ["A", "B", "C", "D"], hue: 35 }, // violet
    { letters: ["E", "F", "G", "H"], hue: 0 }, // blue
    { letters: ["I", "J", "K", "L"], hue: 310 }, // teal
    { letters: ["M", "N", "O", "P"], hue: 230 }, // green
    { letters: ["Q", "R", "S", "T"], hue: 155 }, // orange
    { letters: ["U", "V", "W"], hue: 130 }, // red
    { letters: ["X", "Y", "Z"], hue: 70 }, // pink
];

const LETTER_HUE: Record<string, number> = Object.fromEntries(
    COLOR_MAP.flatMap(({ letters, hue }) => letters.map((l) => [l, hue])),
);

function getBannerHue(name: string): number {
    const first = name.trim()[0]?.toUpperCase() ?? "";
    return LETTER_HUE[first] ?? 0;
}

interface BannerImageProps {
    firstName: string;
    className?: string;
}

export default function BannerImage({
    firstName,
    className,
}: BannerImageProps) {
    const hue = getBannerHue(firstName);

    return (
        <div
            className={`relative w-full h-45 md:h-65 overflow-hidden ${className ?? ""}`}
        >
            <img
                src="/banner.png"
                alt="banner"
                className="w-full h-full object-cover"
                style={{ filter: `hue-rotate(${hue}deg)` }}
            />
        </div>
    );
}
