/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ── Hardcoded DepEd standard positions ────────────────────────────────────────
const STANDARD_POSITIONS = [
    "Teacher I",
    "Teacher II",
    "Teacher III",
    "Teacher IV",
    "Teacher V",
    "Teacher VI",
    "Teacher VII",
    "Master Teacher I",
    "Master Teacher II",
    "Master Teacher III",
    "Master Teacher IV",
    "Master Teacher V",
    "Head Teacher I",
    "Head Teacher II",
    "Head Teacher III",
    "Head Teacher IV",
    "Head Teacher V",
    "Head Teacher VI",
    "Assistant School Principal I",
    "Assistant School Principal II",
    "Assistant School Principal III",
    "Assistant School Principal IV",
    "School Principal I",
    "School Principal II",
    "School Principal III",
    "School Principal IV",
    "School Principal V",
    "Administrative Staff",
];

// ── Arabic → Roman numeral map ────────────────────────────────────────────────
const ARABIC_TO_ROMAN: Record<string, string> = {
    "1": "I",
    "2": "II",
    "3": "III",
    "4": "IV",
    "5": "V",
    "6": "VI",
    "7": "VII",
    "8": "VIII",
    "9": "IX",
    "10": "X",
    "11": "XI",
    "12": "XII",
    "13": "XIII",
    "14": "XIV",
    "15": "XV",
    "16": "XVI",
    "17": "XVII",
    "18": "XVIII",
    "19": "XIX",
    "20": "XX",
};

function normalizePosition(raw: string): string {
    if (!raw) return "";
    let result = raw.trim().replace(/\s+/g, " ");
    result = result.replace(/\b(\d+)\b/g, (_, n) => ARABIC_TO_ROMAN[n] ?? n);
    result = result
        .split(" ")
        .map((word) => {
            if (/^[IVXLCDM]+$/.test(word)) return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
    return result;
}

const naturalSort = (a: string, b: string) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

const STANDARD_SET_LOWER = new Set(
    STANDARD_POSITIONS.map((p) => p.trim().toLowerCase()),
);
function isStandardPosition(value: string): boolean {
    return STANDARD_SET_LOWER.has(value.trim().toLowerCase());
}
function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "");
}

function findExactMatch(input: string, dbPositions: string[]): string | null {
    if (!input.trim()) return null;
    const normalized = normalizePosition(input).toLowerCase();
    const fuzzy = normalize(input);

    const standardExact = STANDARD_POSITIONS.find(
        (p) => p.toLowerCase() === normalized,
    );
    if (standardExact) return standardExact;

    const dbExact = dbPositions.find(
        (p) => p.trim().toLowerCase() === normalized,
    );
    if (dbExact) return dbExact;

    const standardFuzzy = STANDARD_POSITIONS.find(
        (p) => normalize(p) === fuzzy,
    );
    if (standardFuzzy) return standardFuzzy;

    const dbFuzzy = dbPositions.find((p) => normalize(p) === fuzzy);
    if (dbFuzzy) return dbFuzzy;

    return null;
}

function resolveInitialSelectValue(value: string): string {
    if (!value) return "";
    if (isStandardPosition(value)) return value.trim();

    return "__custom__";
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PositionSelectProps {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
    triggerClassName?: string;
    inputClassName?: string;
    placeholder?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function PositionSelect({
    value,
    onChange,
    required,
    disabled,
    triggerClassName,
    inputClassName,
    placeholder = "Select position",
}: PositionSelectProps) {
    const [dbPositions, setDbPositions] = useState<string[]>([]);
    const [loadingPositions, setLoadingPositions] = useState(true);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── selectValue is LOCAL state — not derived from prop ───────────────────
    // This is the key fix: it can hold "__custom__" independently of the
    // parent's value being empty, so the custom input stays visible while
    // the user is typing.
    const [selectValue, setSelectValue] = useState<string>(() =>
        resolveInitialSelectValue(value),
    );

    // Local state for the raw text in the custom input
    const [customInput, setCustomInput] = useState<string>(() => {
        if (!value || isStandardPosition(value)) return "";
        return value;
    });

    // Fetch non-standard positions from DB once on mount
    useEffect(() => {
        let cancelled = false;
        const fetchPositions = async () => {
            const { data } = await supabase
                .from("ProfileHR")
                .select("position")
                .not("position", "is", null)
                .neq("position", "");

            if (cancelled) return;

            const unique = [
                ...new Set(
                    (data ?? []).map((r: { position: string }) => r.position),
                ),
            ]
                .filter((p): p is string => !!p && !isStandardPosition(p))
                .sort(naturalSort);

            setDbPositions(unique);
            setLoadingPositions(false);
        };
        fetchPositions();
        return () => {
            cancelled = true;
        };
    }, []);

    // If parent resets value to "" externally (e.g. form reset), sync back
    useEffect(() => {
        if (!value) {
            setSelectValue("");
            setCustomInput("");
        }
    }, [value]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const handleSelectChange = (val: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        setSelectValue(val); // always update local select state

        if (val === "__custom__") {
            // Don't emit to parent yet — wait for user to type
            setCustomInput("");
            onChange("");
        } else {
            setCustomInput("");
            onChange(val);
        }
    };

    const handleCustomInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const raw = e.target.value;

        // Update local input immediately — never block typing
        setCustomInput(raw);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!raw.trim()) {
            onChange("");
            return;
        }

        onChange(normalizePosition(raw));

        debounceRef.current = setTimeout(() => {
            const match = findExactMatch(raw, dbPositions);
            if (match) {
                setCustomInput("");
                setSelectValue(
                    isStandardPosition(match) ? match : "__custom__",
                );
                onChange(match);
            }
        }, 600);
    };

    const dbOnlyPositions = useMemo(
        () =>
            dbPositions
                .filter(
                    (p) =>
                        p.trim().toLowerCase() !==
                        customInput.trim().toLowerCase(),
                )
                .sort(naturalSort),
        [dbPositions, customInput],
    );

    return (
        <div className="flex flex-col gap-2">
            <Select
                value={selectValue}
                onValueChange={handleSelectChange}
                required={required}
                disabled={disabled || loadingPositions}
            >
                <SelectTrigger
                    className={
                        triggerClassName ??
                        "w-full bg-[#1c1c1e] border-[#2e2e32] text-[13.5px] text-[#f0f0f0] focus:ring-[#5b8dee]/20 focus:border-[#5b8dee] rounded-lg"
                    }
                >
                    <SelectValue
                        placeholder={
                            loadingPositions ? "Loading…" : placeholder
                        }
                    />
                </SelectTrigger>

                <SelectContent className="bg-[#1c1c1e] border-[#2e2e32] text-[#f0f0f0]">
                    {/* Standard DepEd positions */}
                    <div className="px-2 py-1 text-[10px] font-semibold text-[#555560] uppercase tracking-widest">
                        Standard Positions
                    </div>
                    {STANDARD_POSITIONS.map((pos) => (
                        <SelectItem
                            key={pos}
                            value={pos}
                            className="text-[13px] focus:bg-[#2e2e32] focus:text-[#f0f0f0] cursor-pointer"
                        >
                            {pos}
                        </SelectItem>
                    ))}

                    {/* Custom positions from DB */}
                    {dbOnlyPositions.length > 0 && (
                        <>
                            <div className="px-2 py-1 text-[10px] font-semibold text-[#555560] uppercase tracking-widest border-t border-[#2e2e32] mt-1 pt-2">
                                Other Positions
                            </div>
                            {dbOnlyPositions.map((pos) => (
                                <SelectItem
                                    key={pos}
                                    value={pos}
                                    className="text-[13px] focus:bg-[#2e2e32] focus:text-[#f0f0f0] cursor-pointer"
                                >
                                    {pos}
                                </SelectItem>
                            ))}
                        </>
                    )}

                    {/* Other — type your own */}
                    <div className="border-t border-[#2e2e32] mt-1" />
                    <SelectItem
                        value="__custom__"
                        className="text-[13px] text-[#8a8a9a] focus:bg-[#2e2e32] focus:text-[#f0f0f0] cursor-pointer"
                    >
                        Other (not listed)
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* Custom input — visible whenever selectValue is "__custom__" */}
            {selectValue === "__custom__" && (
                <Input
                    type="text"
                    value={customInput}
                    onChange={handleCustomInputChange}
                    required={required}
                    disabled={disabled}
                    placeholder="Type your position"
                    autoFocus
                    className={
                        inputClassName ??
                        "bg-[#1c1c1e] border-[#2e2e32] text-[#f0f0f0] text-[13.5px] rounded-lg placeholder:text-[#555560] focus:border-[#5b8dee] focus:ring-[#5b8dee]/10"
                    }
                />
            )}
        </div>
    );
}

// ── Validator helper ──────────────────────────────────────────────────────────
export function isValidPosition(value: string): boolean {
    return value.trim().length > 0;
}
