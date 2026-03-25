import { createAdminClient, createClient } from "@/lib/supabase/server";
import { toLocalDateString } from "@/lib/utils";

export type EligibilityStatus = "ELIGIBLE" | "APPROACHING" | "ON_TRACK";
export type SortBy = "eligible_first" | "name" | "years_desc";

export type TeacherEligibilityRow = {
    userId: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    middleInitial: string | null;
    profileImage: string | null;
    position: string;
    dateOfLatestAppointment: string | null;
    dateOfOriginalAppointment: string | null;
    lastSalaryIncreaseAt: string | null;
    cycleStartDate: string;
    cycleYears: number;
    cycleMonths: number;
    cycleDays: number;
    cycleTotalDays: number;
    nextEligibleDate: string;
    daysUntilEligible: number;
    status: EligibilityStatus;
};

// ── Date helpers ───────────────────────────────────────────────────────────────

function addYears(date: Date, years: number): Date {
    return new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
}

function diffDays(from: Date, to: Date): number {
    return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function computeTenure(from: Date, to: Date) {
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();

    if (days < 0) {
        months -= 1;
        days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return { years, months, days, totalDays: diffDays(from, to) };
}

function computeCycle(
    appointmentDate: Date,
    lastSalaryIncreaseAt: Date | null,
    today: Date,
) {
    const totalYears = computeTenure(appointmentDate, today).years;
    const completedCycles = Math.floor(totalYears / 3);
    const cycleStartDate = addYears(appointmentDate, completedCycles * 3);
    const nextEligibleDate = addYears(cycleStartDate, 3);
    const cycleProgress = computeTenure(cycleStartDate, today);
    const daysUntilEligible = Math.max(0, diffDays(today, nextEligibleDate));

    const cycleMarkStr = toLocalDateString(cycleStartDate);
    const lastIncreaseStr = lastSalaryIncreaseAt
        ? toLocalDateString(lastSalaryIncreaseAt)
        : null;

    const alreadyAcknowledged =
        lastIncreaseStr !== null && lastIncreaseStr >= cycleMarkStr;

    const isEligible = completedCycles >= 1 && !alreadyAcknowledged;

    const sixMonthsBefore = new Date(nextEligibleDate);
    sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6);
    const isApproaching = !isEligible && today >= sixMonthsBefore;

    const status: EligibilityStatus = isEligible
        ? "ELIGIBLE"
        : isApproaching
          ? "APPROACHING"
          : "ON_TRACK";

    return {
        cycleStartDate,
        nextEligibleDate,
        cycleYears: cycleProgress.years,
        cycleMonths: cycleProgress.months,
        cycleDays: cycleProgress.days,
        cycleTotalDays: cycleProgress.totalDays,
        daysUntilEligible,
        status,
    };
}

// ── Shared profile fetcher ────────────────────────────────────────────────────

async function fetchProfileMap(admin: ReturnType<typeof createAdminClient>, ids: string[]) {
    const { data: profiles } = await admin
        .from("Profile")
        .select("id, firstName, lastName, middleInitial, profileImage")
        .in("id", ids);
    return new Map((profiles ?? []).map((p) => [String(p.id), p]));
}

// ── STEP: approved TEACHER+ADMIN with dateOfLatestAppointment ─────────────────

export async function getStepEligibility(
    page: number = 1,
    pageSize: number = 10,
    sortBy: SortBy = "eligible_first",
): Promise<{ data: TeacherEligibilityRow[]; count: number }> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { data: [], count: 0 };

        const role = auth.user.user_metadata?.role ?? "TEACHER";
        if (!["ADMIN", "SUPERADMIN"].includes(role)) return { data: [], count: 0 };

        const admin = createAdminClient();

        // Only TEACHER + ADMIN approved users
        const { data: approvedUsers } = await admin
            .from("User")
            .select("id")
            .eq("status", "APPROVED")
            .or("role.eq.TEACHER,role.eq.ADMIN");

        const approvedIds = (approvedUsers ?? []).map((u) => u.id);
        if (approvedIds.length === 0) return { data: [], count: 0 };

        // Must have dateOfLatestAppointment
        const { data: hrRows, error } = await admin
            .from("ProfileHR")
            .select(
                "id, employeeId, position, dateOfLatestAppointment, dateOfOriginalAppointment, last_salary_increase_at, salary_increase_notified_at",
            )
            .in("id", approvedIds)
            .not("dateOfLatestAppointment", "is", null);

        if (error || !hrRows || hrRows.length === 0) return { data: [], count: 0 };

        const profileMap = await fetchProfileMap(admin, hrRows.map((r) => String(r.id)));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const computed = hrRows.map((r) => {
            const profile = profileMap.get(String(r.id));
            const appointmentDate = new Date(r.dateOfLatestAppointment + "T00:00:00");
            const lastIncreaseDate = r.last_salary_increase_at
                ? new Date(r.last_salary_increase_at + "T00:00:00")
                : null;
            const cycle = computeCycle(appointmentDate, lastIncreaseDate, today);

            return {
                userId: String(r.id),
                employeeId: r.employeeId ?? "—",
                firstName: profile?.firstName ?? "",
                lastName: profile?.lastName ?? "",
                middleInitial: profile?.middleInitial ?? null,
                profileImage: profile?.profileImage ?? null,
                position: r.position ?? "—",
                dateOfLatestAppointment: r.dateOfLatestAppointment,
                dateOfOriginalAppointment: r.dateOfOriginalAppointment ?? null,
                lastSalaryIncreaseAt: r.last_salary_increase_at ?? null,
                cycleStartDate: toLocalDateString(cycle.cycleStartDate),
                cycleYears: cycle.cycleYears,
                cycleMonths: cycle.cycleMonths,
                cycleDays: cycle.cycleDays,
                cycleTotalDays: cycle.cycleTotalDays,
                nextEligibleDate: toLocalDateString(cycle.nextEligibleDate),
                daysUntilEligible: cycle.daysUntilEligible,
                status: cycle.status,
                _notifiedAt: r.salary_increase_notified_at ?? null,
                _cycleStartDate: toLocalDateString(cycle.cycleStartDate),
            };
        });

        // Notifications
        const toNotify = computed.filter(
            (r) =>
                r.status === "ELIGIBLE" &&
                (r._notifiedAt === null || r._notifiedAt < r._cycleStartDate),
        );

        if (toNotify.length > 0) {
            await admin.from("ActivityLog").insert(
                toNotify.flatMap((r) => [
                    {
                        actor_id: auth.user!.id,
                        target_user_id: auth.user!.id,
                        action: "SALARY_INCREASE_ELIGIBLE",
                        entity_type: "ProfileHR",
                        entity_id: r.userId,
                        message: `${r.lastName}, ${r.firstName} is eligible for a salary increase.`,
                        meta: { teacherId: r.userId, employeeId: r.employeeId, position: r.position, cycleStartDate: r.cycleStartDate },
                    },
                    {
                        actor_id: auth.user!.id,
                        target_user_id: r.userId,
                        action: "SALARY_INCREASE_ELIGIBLE",
                        entity_type: "ProfileHR",
                        entity_id: r.userId,
                        message: `You are eligible for a salary increase as of ${r.cycleStartDate}.`,
                        meta: { cycleStartDate: r.cycleStartDate, position: r.position },
                    },
                ]),
            );
            await Promise.all(
                toNotify.map((r) =>
                    admin
                        .from("ProfileHR")
                        .update({ salary_increase_notified_at: toLocalDateString(today) })
                        .eq("id", r.userId),
                ),
            );
        }

        // Strip internals
        const cleaned: TeacherEligibilityRow[] = computed.map(
            ({ _notifiedAt: _n, _cycleStartDate: _c, ...rest }) => {
                void _n; void _c;
                return rest;
            },
        );

        return paginate(sort(cleaned, sortBy), page, pageSize);
    } catch {
        return { data: [], count: 0 };
    }
}

// ── LOYALTY: all approved users with dateOfOriginalAppointment ────────────────

export async function getLoyaltyEligibility(
    page: number = 1,
    pageSize: number = 10,
    sortBy: SortBy = "eligible_first",
): Promise<{ data: TeacherEligibilityRow[]; count: number }> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { data: [], count: 0 };

        const role = auth.user.user_metadata?.role ?? "TEACHER";
        if (!["ADMIN", "SUPERADMIN"].includes(role)) return { data: [], count: 0 };

        const admin = createAdminClient();

        // Fetch ALL ProfileHR rows that have dateOfOriginalAppointment.
        // Do NOT gate by User.status — the approvedUsers list was the bottleneck
        // (only 5 users returned) because some users have a different status
        // string or the join was too narrow. Every user who completed fill-up
        // will have this field set, so the field itself is the gate.
        const { data: hrRows, error } = await admin
            .from("ProfileHR")
            .select(
                "id, employeeId, position, dateOfOriginalAppointment, dateOfLatestAppointment, last_salary_increase_at",
            )
            .not("dateOfOriginalAppointment", "is", null);

        if (error || !hrRows || hrRows.length === 0) return { data: [], count: 0 };

        const profileMap = await fetchProfileMap(admin, hrRows.map((r) => String(r.id)));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // For loyalty we reuse computeCycle but driven by originalAppointment.
        // The "cycle" here is not the 3-year step cycle — the table component's
        // computeLoyalty() handles the 10/5-year milestone math using
        // dateOfOriginalAppointment directly. We still need to populate the
        // shared row fields, so we run cycle math on original appointment so
        // cycleTotalDays is meaningful for sorting.
        const cleaned: TeacherEligibilityRow[] = hrRows.map((r) => {
            const profile = profileMap.get(String(r.id));
            const originalDate = new Date(r.dateOfOriginalAppointment + "T00:00:00");
            // Tenure from original appointment — used only for sorting
            const tenure = computeTenure(originalDate, today);

            return {
                userId: String(r.id),
                employeeId: r.employeeId ?? "—",
                firstName: profile?.firstName ?? "",
                lastName: profile?.lastName ?? "",
                middleInitial: profile?.middleInitial ?? null,
                profileImage: profile?.profileImage ?? null,
                position: r.position ?? "—",
                dateOfLatestAppointment: r.dateOfLatestAppointment ?? null,
                dateOfOriginalAppointment: r.dateOfOriginalAppointment,
                lastSalaryIncreaseAt: r.last_salary_increase_at ?? null,
                // These step-cycle fields are intentionally blank for loyalty rows;
                // the table component uses dateOfOriginalAppointment for its own math.
                cycleStartDate: "—",
                cycleYears: tenure.years,
                cycleMonths: tenure.months,
                cycleDays: tenure.days,
                cycleTotalDays: tenure.totalDays,
                nextEligibleDate: "—",
                daysUntilEligible: 0,
                status: "ON_TRACK" as EligibilityStatus, // table component overrides this
            };
        });

        return paginate(sort(cleaned, sortBy), page, pageSize);
    } catch {
        return { data: [], count: 0 };
    }
}

// ── Kept for backwards compatibility (used by markSalaryIncreaseGiven etc.) ───

export async function getTeacherSalaryEligibility(
    page: number = 1,
    pageSize: number = 10,
    sortBy: SortBy = "eligible_first",
): Promise<{ data: TeacherEligibilityRow[]; count: number }> {
    return getStepEligibility(page, pageSize, sortBy);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sort(rows: TeacherEligibilityRow[], sortBy: SortBy): TeacherEligibilityRow[] {
    return [...rows].sort((a, b) => {
        if (sortBy === "eligible_first") {
            const order = { ELIGIBLE: 0, APPROACHING: 1, ON_TRACK: 2 };
            const diff = order[a.status] - order[b.status];
            if (diff !== 0) return diff;
            return b.cycleTotalDays - a.cycleTotalDays;
        }
        if (sortBy === "years_desc") return b.cycleTotalDays - a.cycleTotalDays;
        if (sortBy === "name")
            return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
        return 0;
    });
}

function paginate(
    rows: TeacherEligibilityRow[],
    page: number,
    pageSize: number,
): { data: TeacherEligibilityRow[]; count: number } {
    const count = rows.length;
    const from = (page - 1) * pageSize;
    return { data: rows.slice(from, from + pageSize), count };
}

// ── Mark salary increase (unchanged) ─────────────────────────────────────────

export async function markSalaryIncreaseGiven(
    teacherUserId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return { ok: false, error: "Not authenticated" };

        const role = auth.user.user_metadata?.role ?? "TEACHER";
        if (!["ADMIN", "SUPERADMIN"].includes(role))
            return { ok: false, error: "Unauthorized" };

        const admin = createAdminClient();

        const { data: hr } = await admin
            .from("ProfileHR")
            .select("dateOfLatestAppointment, last_salary_increase_at")
            .eq("id", teacherUserId)
            .single();

        if (!hr?.dateOfLatestAppointment)
            return { ok: false, error: "Teacher employment record not found" };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointmentDate = new Date(hr.dateOfLatestAppointment + "T00:00:00");
        const lastIncreaseDate = hr.last_salary_increase_at
            ? new Date(hr.last_salary_increase_at + "T00:00:00")
            : null;

        const cycle = computeCycle(appointmentDate, lastIncreaseDate, today);
        const markDate = toLocalDateString(cycle.cycleStartDate);

        const { error } = await admin
            .from("ProfileHR")
            .update({ last_salary_increase_at: markDate })
            .eq("id", teacherUserId);

        if (error) return { ok: false, error: error.message };

        const { data: profile } = await admin
            .from("Profile")
            .select("firstName, lastName")
            .eq("id", teacherUserId)
            .single();

        const name = profile
            ? `${profile.lastName}, ${profile.firstName}`
            : "Teacher";

        await admin.from("ActivityLog").insert([
            {
                actor_id: auth.user.id,
                target_user_id: auth.user.id,
                action: "SALARY_INCREASE_MARKED",
                entity_type: "ProfileHR",
                entity_id: teacherUserId,
                message: `You marked salary increase for ${name} (cycle: ${markDate}).`,
                meta: { teacherId: teacherUserId, cycleMarkDate: markDate },
            },
            {
                actor_id: auth.user.id,
                target_user_id: teacherUserId,
                action: "SALARY_INCREASE_MARKED",
                entity_type: "ProfileHR",
                entity_id: teacherUserId,
                message: `Your salary increase has been processed (cycle: ${markDate}).`,
                meta: { cycleMarkDate: markDate },
            },
        ]);

        return { ok: true };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : "Something went wrong",
        };
    }
}