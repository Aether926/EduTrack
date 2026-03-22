"use server";

import {
  getTeacherSalaryEligibility,
  markSalaryIncreaseGiven,
} from "@/lib/database/salary-eligibility";
import type { SortBy } from "@/lib/database/salary-eligibility";

export async function fetchSalaryEligibility(
  page: number,
  pageSize: number,
  sortBy: SortBy
) {
  return getTeacherSalaryEligibility(page, pageSize, sortBy);
}

export async function markSalaryIncreaseGivenAction(teacherUserId: string) {
  return markSalaryIncreaseGiven(teacherUserId);
}