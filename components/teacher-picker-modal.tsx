"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Check, Users } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InitialAvatar from "@/components/ui-elements/avatars/avatar-color";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchTeacherOptions } from "@/features/admin-actions/responsibilities/actions/teacher-picker-actions";

export type TeacherOption = {
    id: string;
    fullName: string;
    employeeId: string;
    position: string;
    email: string;
    profileImage?: string | null;
};

const PAGE_SIZE = 8;

export function TeacherPickerModal(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (teacher: TeacherOption) => void;
    selectedId?: string;
}) {
    const { open, onOpenChange, onSelect, selectedId } = props;
    const isMobile = useIsMobile();

    const [search, setSearch] = useState("");
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (!open) return;
        setSearch("");
        setPage(0);
        const load = async () => {
            setLoading(true);
            try {
                const options = await fetchTeacherOptions();
                setTeachers(options);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [open]);

    // Reset page when search changes
    useEffect(() => {
        setPage(0);
    }, [search]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return teachers;
        return teachers.filter(
            (t) =>
                t.fullName.toLowerCase().includes(q) ||
                t.employeeId.toLowerCase().includes(q) ||
                t.position.toLowerCase().includes(q),
        );
    }, [teachers, search]);

    const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const selectedTeacher = teachers.find((t) => t.id === selectedId);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={[
                    "flex flex-col gap-0 p-0",
                    isMobile
                        ? "h-[90vh] rounded-t-2xl"
                        : "w-[400px] sm:w-[440px]",
                ].join(" ")}
            >
                {/* Header */}
                <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60 shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 shrink-0">
                            <Users className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <SheetTitle className="text-base leading-snug">
                                Select Teacher
                            </SheetTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {filtered.length} teacher
                                {filtered.length !== 1 ? "s" : ""}
                                {search && ` matching "${search}"`}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            className="pl-9 h-9 text-sm"
                            placeholder="Search name, ID, or position..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Selected preview */}
                    {selectedTeacher && (
                        <div className="flex items-center gap-2.5 mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <InitialAvatar
                                name={selectedTeacher.fullName}
                                src={selectedTeacher.profileImage}
                                className="h-6 w-6 shrink-0"
                            />
                            <span className="text-xs text-emerald-400 font-medium truncate">
                                {selectedTeacher.fullName}
                            </span>
                        </div>
                    )}
                </SheetHeader>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                            <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground animate-spin" />
                            <p className="text-sm text-muted-foreground">
                                Loading teachers...
                            </p>
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                            <Users className="h-10 w-10 text-muted-foreground/20" />
                            <p className="text-sm text-muted-foreground">
                                No teachers found.
                            </p>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {paginated.map((t) => {
                                const isSelected = t.id === selectedId;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        className={[
                                            "w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors group",
                                            isSelected
                                                ? "bg-emerald-500/8 border-l-2 border-l-emerald-500"
                                                : "hover:bg-accent/50 border-l-2 border-l-transparent",
                                        ].join(" ")}
                                        onClick={() => {
                                            onSelect(t);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <InitialAvatar
                                            name={t.fullName}
                                            src={t.profileImage}
                                            className="h-9 w-9 shrink-0"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={[
                                                        "text-sm font-medium truncate",
                                                        isSelected
                                                            ? "text-emerald-400"
                                                            : "text-foreground",
                                                    ].join(" ")}
                                                >
                                                    {t.fullName}
                                                </span>
                                                {isSelected && (
                                                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                                {t.position && (
                                                    <span className="text-xs text-muted-foreground truncate">
                                                        {t.position}
                                                    </span>
                                                )}
                                                {t.position &&
                                                    t.employeeId !== "—" && (
                                                        <span className="text-muted-foreground/30 text-xs shrink-0">
                                                            ·
                                                        </span>
                                                    )}
                                                {t.employeeId !== "—" && (
                                                    <span className="text-xs font-mono text-muted-foreground/60 shrink-0">
                                                        {t.employeeId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination footer */}
                {pageCount > 1 && (
                    <div className="shrink-0 border-t border-border/60 px-5 py-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                            Page {page + 1} of {pageCount}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p - 1)}
                                disabled={page === 0}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= pageCount - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
