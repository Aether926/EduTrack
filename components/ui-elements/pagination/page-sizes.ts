export type PageSizeEntry = {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
};

export function resolvePageSize(entry: PageSizeEntry): number {
    if (typeof window === "undefined") return entry.default;
    const w = window.innerWidth;
    if (w >= 1024 && entry.lg != null) return entry.lg;
    if (w >= 768  && entry.md != null) return entry.md;
    if (w >= 640  && entry.sm != null) return entry.sm;
    return entry.default;
}

export const PAGE_SIZES = {
    activityFeed:           { default: 8 },
    trainingsCard:          { default: 6 },
    appointmentHistory:     { default: 6 },
    teacherTable:           { default: 8 },
    historyTrainingRecords: { default: 8 },
    pdAssignedUsers:        { default: 6 },
    trainingSeminarTable:   { default: 8, md: 10, lg: 12 },
} as const satisfies Record<string, PageSizeEntry>;