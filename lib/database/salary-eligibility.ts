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
  position: string;
  dateOfLatestAppointment: string;
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
  today: Date
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


export async function getTeacherSalaryEligibility(
  page: number = 1,
  pageSize: number = 10,
  sortBy: SortBy = "eligible_first"
): Promise<{ data: TeacherEligibilityRow[]; count: number }> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { data: [], count: 0 };

    const { data: userRow } = await supabase
      .from("User")
      .select("role")
      .eq("id", auth.user.id)
      .single();
    if (userRow?.role !== "ADMIN") return { data: [], count: 0 };

    const admin = createAdminClient();

    // fetch ProfileHR
    const { data: hrRows, error } = await admin
      .from("ProfileHR")
      .select(
        "id, employeeId, position, dateOfLatestAppointment, last_salary_increase_at, salary_increase_notified_at"
      )
      .not("dateOfLatestAppointment", "is", null);

    if (error || !hrRows || hrRows.length === 0) return { data: [], count: 0 };

    // fetch Profile separately (id type mismatch: ProfileHR=uuid, Profile=text)
    const hrIds = hrRows.map((r) => String(r.id));
    const { data: profiles } = await admin
      .from("Profile")
      .select("id, firstName, lastName, middleInitial")
      .in("id", hrIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // compute eligibility
    const computed: TeacherEligibilityRow[] = hrRows.map((r) => {
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
        position: r.position ?? "—",
        dateOfLatestAppointment: r.dateOfLatestAppointment,
        lastSalaryIncreaseAt: r.last_salary_increase_at ?? null,
        cycleStartDate: toLocalDateString(cycle.cycleStartDate),
        cycleYears: cycle.cycleYears,
        cycleMonths: cycle.cycleMonths,
        cycleDays: cycle.cycleDays,
        cycleTotalDays: cycle.cycleTotalDays,
        nextEligibleDate: toLocalDateString(cycle.nextEligibleDate),
        daysUntilEligible: cycle.daysUntilEligible,
        status: cycle.status,
        // internal fields for notification check
        _notifiedAt: r.salary_increase_notified_at ?? null,
        _cycleStartDate: toLocalDateString(cycle.cycleStartDate),
      } as TeacherEligibilityRow & {
        _notifiedAt: string | null;
        _cycleStartDate: string;
      };
    });

    const toNotify = computed.filter((r) => {
      if (r.status !== "ELIGIBLE") return false;
      const row = r as TeacherEligibilityRow & {
        _notifiedAt: string | null;
        _cycleStartDate: string;
      };
      return (
        row._notifiedAt === null ||
        row._notifiedAt < row._cycleStartDate
      );
    });

    if (toNotify.length > 0) {

      const activityRows = toNotify.flatMap((r) => [

        {
          actor_id: auth.user.id,
          target_user_id: auth.user.id,
          action: "SALARY_INCREASE_ELIGIBLE",
          entity_type: "ProfileHR",
          entity_id: r.userId,
          message: `${r.lastName}, ${r.firstName} is eligible for a salary increase.`,
          meta: {
            teacherId: r.userId,
            employeeId: r.employeeId,
            position: r.position,
            cycleStartDate: r.cycleStartDate,
          },
        },
        // notify teacher
        {
          actor_id: auth.user.id,
          target_user_id: r.userId,
          action: "SALARY_INCREASE_ELIGIBLE",
          entity_type: "ProfileHR",
          entity_id: r.userId,
          message: `You are eligible for a salary increase as of ${r.cycleStartDate}.`,
          meta: {
            cycleStartDate: r.cycleStartDate,
            position: r.position,
          },
        },
      ]);

      await admin.from("ActivityLog").insert(activityRows);

      // update salary_increase_notified_at for all notified teachers
      await Promise.all(
        toNotify.map((r) =>
          admin
            .from("ProfileHR")
            .update({
              salary_increase_notified_at: toLocalDateString(today),
            })
            .eq("id", r.userId)
        )
      );
    }

    // clean up internal fields before returning
    const cleaned = computed.map((r) => {
      const { _notifiedAt, _cycleStartDate, ...rest } = r as TeacherEligibilityRow & {
        _notifiedAt: string | null;
        _cycleStartDate: string;
      };
      return rest;
    });

    // sort
    const sorted = cleaned.sort((a, b) => {
      if (sortBy === "eligible_first") {
        const order = { ELIGIBLE: 0, APPROACHING: 1, ON_TRACK: 2 };
        const diff = order[a.status] - order[b.status];
        if (diff !== 0) return diff;
        return b.cycleTotalDays - a.cycleTotalDays;
      }
      if (sortBy === "years_desc") return b.cycleTotalDays - a.cycleTotalDays;
      if (sortBy === "name")
        return `${a.lastName}${a.firstName}`.localeCompare(
          `${b.lastName}${b.firstName}`
        );
      return 0;
    });

    const count = sorted.length;
    const from = (page - 1) * pageSize;
    const paginated = sorted.slice(from, from + pageSize);

    return { data: paginated, count };
  } catch {
    return { data: [], count: 0 };
  }
}


export async function markSalaryIncreaseGiven(
  teacherUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false, error: "Not authenticated" };

    const { data: userRow } = await supabase
      .from("User")
      .select("role")
      .eq("id", auth.user.id)
      .single();
    if (userRow?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

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

    // always anchor to the cycle mark date, not today
    const markDate = toLocalDateString(cycle.cycleStartDate);

    const { error } = await admin
      .from("ProfileHR")
      .update({ last_salary_increase_at: markDate })
      .eq("id", teacherUserId);

    if (error) return { ok: false, error: error.message };

    // fetch teacher name for the log message
    const { data: profile } = await admin
      .from("Profile")
      .select("firstName, lastName")
      .eq("id", teacherUserId)
      .single();

    const name = profile
      ? `${profile.lastName}, ${profile.firstName}`
      : "Teacher";

    // activity log — admin feed
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