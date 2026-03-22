"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EmployeeIdInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/** Returns true if the employee ID is exactly 7 digits. */
export function isValidEmployeeId(value: string): boolean {
    return /^\d{7}$/.test(value);
}

/**
 * Employee ID input — accepts exactly 7 digits, nothing else.
 */
export function EmployeeIdInput({
    value,
    onChange,
    className,
    ...props
}: EmployeeIdInputProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 7);
        onChange(digits);
    }

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            maxLength={7}
            className={cn(className)}
        />
    );
}
