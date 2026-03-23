"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Capitalizes the first letter of every word. */
function toProperCase(str: string): string {
    return str
        .split(" ")
        .map((word) =>
            word.length > 0
                ? word[0].toUpperCase() + word.slice(1).toLowerCase()
                : word,
        )
        .join(" ");
}

/** Fixes capitalization after each space keystroke (real-time). */
function fixOnSpace(str: string): string {
    return str
        .split(" ")
        .map((word, i, arr) => {
            // Only capitalize completed words (not the word being typed)
            if (i < arr.length - 1 && word.length > 0) {
                return word[0].toUpperCase() + word.slice(1).toLowerCase();
            }
            return word;
        })
        .join(" ");
}

// ── NameInput ─────────────────────────────────────────────────────────────────

interface NameInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * A regular name input that:
 * - Fixes capitalization in real-time after each space
 * - Applies full proper-case correction on blur
 */
export function NameInput({
    value,
    onChange,
    className,
    ...props
}: NameInputProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        // Fix completed words on space, leave current word as-is
        onChange(fixOnSpace(raw));
    }

    function handleBlur() {
        onChange(toProperCase(value.trim()));
    }

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
        />
    );
}

// ── MiddleNameInput ───────────────────────────────────────────────────────────

interface MiddleNameInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * Middle name input — same proper-case behavior as NameInput.
 * Treated as optional by convention; no special dot logic.
 */
export function MiddleNameInput({
    value,
    onChange,
    className,
    ...props
}: MiddleNameInputProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(fixOnSpace(e.target.value));
    }

    function handleBlur() {
        onChange(toProperCase(value.trim()));
    }

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
        />
    );
}

interface MiddleInitialInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * Middle initial input that:
 * - Accepts only a single letter and auto-appends a dot (e.g. "A" → "A.")
 * - Pressing Backspace or Delete clears the entire value at once
 */
export function MiddleInitialInput({
    value,
    onChange,
    className,
    ...props
}: MiddleInitialInputProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value.replace(/[^a-zA-Z.]/g, "");
        const letter = raw.replace(/\./g, "").slice(0, 1).toUpperCase();
        onChange(letter ? `${letter}.` : "");
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if ((e.key === "Backspace" || e.key === "Delete") && value) {
            e.preventDefault();
            onChange("");
        }
    }

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={2}
            className={className}
        />
    );
}
