"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, X, School } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SchoolResult } from "@/app/api/schools/route";

interface SchoolInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
}

export function SchoolInput({
    value,
    onChange,
    placeholder = "e.g. Valencia National High School",
    disabled,
    className,
    required,
}: SchoolInputProps) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<SchoolResult[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [highlighted, setHighlighted] = useState(-1);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // true only after the user picks from the dropdown
    const confirmedRef = useRef(!!value);

    // Keep local query in sync when value is cleared externally
    useEffect(() => {
        setQuery(value);
        confirmedRef.current = !!value;
    }, [value]);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/schools?q=${encodeURIComponent(q)}`);
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            setResults(data.results ?? []);
            setOpen(true);
            setHighlighted(-1);
        } catch {
            setError("Could not load schools. Try typing the name manually.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const q = e.target.value;
        confirmedRef.current = false; // user is typing, not yet confirmed
        setQuery(q);
        onChange(q); // pass raw input up immediately

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(q), 300);
    }

    function handleSelect(school: SchoolResult) {
        const label = school.city
            ? `${school.name}, ${school.city}`
            : school.name;
        confirmedRef.current = true;
        setQuery(label);
        onChange(label);
        setOpen(false);
        setResults([]);
    }

    function handleClear() {
        setQuery("");
        onChange("");
        setResults([]);
        setOpen(false);
        inputRef.current?.focus();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!open || results.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
        } else if (e.key === "Enter" && highlighted >= 0) {
            e.preventDefault();
            handleSelect(results[highlighted]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlighted < 0 || !listRef.current) return;
        const item = listRef.current.children[
            highlighted
        ] as HTMLElement | null;
        item?.scrollIntoView({ block: "nearest" });
    }, [highlighted]);

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Input */}
            <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted-foreground/60" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results.length > 0) setOpen(true);
                    }}
                    onBlur={() => {
                        // If user typed but never picked from the list, clear
                        if (!confirmedRef.current) {
                            setQuery("");
                            onChange("");
                            setResults([]);
                            setOpen(false);
                        }
                    }}
                    disabled={disabled}
                    required={required}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-8 text-sm shadow-sm transition-colors",
                        "placeholder:text-muted-foreground/50",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                />
                {/* Right side — spinner or clear */}
                <div className="absolute right-2.5 flex items-center">
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/60" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground/60 hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Error hint */}
            {error && (
                <p className="mt-1 text-[11px] text-amber-400">{error}</p>
            )}

            {/* Dropdown */}
            {open && results.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border/60 bg-card shadow-lg"
                    style={{ scrollbarWidth: "thin" }}
                >
                    {results.map((school, i) => (
                        <li
                            key={`${school.name}-${i}`}
                            onMouseDown={(e) => {
                                e.preventDefault(); // prevent blur before click
                                handleSelect(school);
                            }}
                            onMouseEnter={() => setHighlighted(i)}
                            className={cn(
                                "flex cursor-pointer items-start gap-2.5 px-3 py-2.5 text-sm transition-colors",
                                i === highlighted
                                    ? "bg-accent text-foreground"
                                    : "text-foreground/80 hover:bg-accent/60",
                            )}
                        >
                            <School className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                            <div className="min-w-0">
                                <div className="truncate font-medium leading-snug">
                                    {school.name}
                                </div>
                                {(school.city || school.province) && (
                                    <div className="truncate text-[11px] text-muted-foreground">
                                        {[school.city, school.province]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* No results hint */}
            {open && !loading && results.length === 0 && query.length >= 2 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border/60 bg-card px-3 py-2.5 text-[12px] text-muted-foreground shadow-lg">
                    No schools found. You can still type the name manually.
                </div>
            )}
        </div>
    );
}
