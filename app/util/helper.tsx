// ---------- Clean Raw Name Input ----------
export function cleanNameInput(value: string) {
    // Allow letters (including accented), spaces, hyphen, apostrophe, dot
    return value.replace(/[^\p{L}' .-]/gu, "");
}

// ---------- Format Names (Dela Cruz, D'Angelo, Anna-Marie, Jr.) ----------
export function formatName(value: string) {
    if (!value || !value.trim()) return "";

    const suffixMap: Record<string, string> = {
        jr: "Jr.",
        sr: "Sr.",
        ii: "II",
        iii: "III",
        iv: "IV",
        v: "V",
    };

    const particles = [
        "de",
        "del",
        "dela",
        "la",
        "las",
        "los",
        "van",
        "von",
        "da",
        "di",
        "y",
    ];

    const parts = value.trim().toLowerCase().split(/\s+/);

    let suffix: string | null = null;
    let coreParts = parts;

    // Detect if last word is a suffix like Jr, Sr, II, III
    if (parts.length > 1) {
        const last = parts[parts.length - 1].replace(/[.,]/g, "");
        if (suffixMap[last]) {
            suffix = suffixMap[last];
            coreParts = parts.slice(0, -1);
        }
    }

    const formattedCore = coreParts
        .filter((w) => w !== "")
        .map((word, index) => {
            // lowercase particles unless first word
            if (particles.includes(word) && index > 0) return word;

            // O'Brien, D'Angelo
            if (word.includes("'")) {
                return word
                    .split("'")
                    .map((part) =>
                        part ? part[0].toUpperCase() + part.slice(1) : ""
                    )
                    .join("'");
            }

            // Anna-Marie, Jean-Claude
            if (word.includes("-")) {
                return word
                    .split("-")
                    .map((part) =>
                        part ? part[0].toUpperCase() + part.slice(1) : ""
                    )
                    .join("-");
            }

            // Normal capitalization
            return word[0].toUpperCase() + word.slice(1);
        })
        .join(" ");

    return suffix ? `${formattedCore} ${suffix}` : formattedCore;
}

// ---------- Middle Initial Cleaner (A–Z only, 1 char, uppercase) ----------
export function cleanMiddleInitial(value: string) {
    if (!value) return "";

    // Get first letter only, uppercase it, and add a dot
    const letter = value
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .charAt(0);

    return letter ? `${letter}.` : "";
}

// ---------- Age Calculator ----------
export const calculateAge = (dateOfBirth: Date | undefined): string => {
    if (!dateOfBirth) return "";

    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age.toString();
};
