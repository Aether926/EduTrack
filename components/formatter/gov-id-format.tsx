import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GovIdInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * Government ID input — allows letters, digits, dashes and spaces.
 * No strict format enforcement for scalability.
 */
export function GovIdInput({
    value,
    onChange,
    className,
    ...props
}: GovIdInputProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        // Allow letters, digits, dashes, spaces — strip everything else
        const sanitized = e.target.value
            .replace(/[^\w\s\-]/g, "") // keep alphanumeric, spaces, dashes
            .trimStart(); // no leading spaces
        onChange(sanitized);
    }

    return (
        <Input
            {...props}
            type="text"
            value={value}
            onChange={handleChange}
            maxLength={30}
            className={cn(className)}
        />
    );
}
