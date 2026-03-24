"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strips everything except digits. */
function digitsOnly(str: string): string {
    return str.replace(/\D/g, "");
}

/**
 * Formats a raw phone string for display (e.g. in table cells).
 * Handles +63 prefix. Returns null if not a valid 11-digit PH number.
 */
export function fmtContact(raw: string): string | null {
    const d = raw.replace(/\D/g, "");
    const n = d.startsWith("63") && d.length === 12 ? "0" + d.slice(2) : d;
    return /^09\d{9}$/.test(n)
        ? `${n.slice(0, 4)}-${n.slice(4, 7)}-${n.slice(7)}`
        : null;
}

/** Formats digits as XXXX-XXX-XXXX (max 11 digits). */
function formatContact(digits: string): string {
    const d = digits.slice(0, 11);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)}-${d.slice(4)}`;
    return `${d.slice(0, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
}

/** Returns true if the contact number has exactly 11 digits. */
export function isValidContact(value: string): boolean {
    return digitsOnly(value).length === 11;
}

// ── ContactInput ──────────────────────────────────────────────────────────────

interface ContactInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * Phone number input that auto-formats to XXXX-XXX-XXXX.
 * - Only allows digits; dashes are inserted automatically
 * - Backspace removes the last digit (not the dash)
 * - Returns the raw formatted string (with dashes) via onChange
 */
export function ContactInput({
    value,
    onChange,
    className,
    ...props
}: ContactInputProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const digits = digitsOnly(e.target.value);
        onChange(formatContact(digits));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace") {
            // Strip last digit, reformat
            const digits = digitsOnly(value);
            if (digits.length > 0) {
                e.preventDefault();
                onChange(formatContact(digits.slice(0, -1)));
            }
        }
    }

    return (
        <Input
            {...props}
            type="tel"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={13} // XXXX-XXX-XXXX = 13 chars
            className={cn(className)}
        />
    );
}
