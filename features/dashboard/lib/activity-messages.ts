import type { ActivityRow } from "@/features/dashboard/actions/get-activity-feed";

export function getActivityMessage(row: ActivityRow) {
  if (row.message) return row.message;

  const meta = row.meta ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestType = String((meta as any).request_type ?? "");
  const action = row.action;

  if (action === "REQUEST_APPROVED" && requestType === "EMPLOYMENT") {
    return "Your employment info change was approved";
  }
  if (action === "REQUEST_REJECTED" && requestType === "EMPLOYMENT") {
    return "Your employment info change was rejected";
  }

  if (action === "REQUEST_APPROVED" && requestType === "APPOINTMENT") {
    return "Your appointment history change was approved";
  }
  if (action === "REQUEST_REJECTED" && requestType === "APPOINTMENT") {
    return "Your appointment history change was rejected";
  }

  if (action === "REQUEST_SUBMITTED" && requestType === "EMPLOYMENT") {
    return "You submitted an employment info change request";
  }
  if (action === "REQUEST_SUBMITTED" && requestType === "APPOINTMENT") {
    return "You submitted an appointment history change request";
  }

  return "Activity updated";
}
