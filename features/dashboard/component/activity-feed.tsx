import type { ActivityRow } from "@/lib/database/activity";

// ActivityLog rows include sender/receiver.
// Keep these optional so this component still works if your ActivityRow type is older.
type FeedRow = ActivityRow & {
  actor_id?: string | null;
  target_user_id?: string;
};

function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function getDisplayMessage(r: FeedRow, viewerId: string) {
  const title = (r.meta?.title as string | undefined) ?? null;
  const note = (r.meta?.note as string | undefined) ?? null;
  const position = (r.meta?.position as string | undefined) ?? null;
  const appointmentType = (r.meta?.appointment_type as string | undefined) ?? null;

  const targetUserId = r.target_user_id ?? null;
  const actorId = r.actor_id ?? null;
  const isReceiver = !!targetUserId && targetUserId === viewerId;
  const isActor = !!actorId && actorId === viewerId;

  if (r.action === "ASSIGNED_TO_TRAINING") {
    if (isActor) return `You assigned a teacher to ${title ?? "a training"}.`;
    if (isReceiver) return `You were assigned to ${title ?? "a training"}.`;
    return `Training assignment updated: ${title ?? "a training"}.`;
  }

  if (r.action === "HR_REQUEST_APPROVED") {
    if (isReceiver) return `Your employment info change request was approved.${note ? ` Note: ${note}` : ""}`;
    if (isActor) return `You approved an employment info change request.`;
    return "An employment info change request was approved.";
  }

  if (r.action === "HR_REQUEST_REJECTED") {
    if (isReceiver) return `Your employment info change request was rejected.${note ? ` Reason: ${note}` : ""}`;
    if (isActor) return `You rejected an employment info change request.`;
    return "An employment info change request was rejected.";
  }

  if (r.action === "APPOINTMENT_REQUEST_APPROVED") {
    const details = position ? ` (${appointmentType} — ${position})` : "";
    if (isReceiver) return `Your appointment change request was approved.${details}`;
    if (isActor) return `You approved an appointment change request.${details}`;
    return `An appointment change request was approved.${details}`;
  }

  if (r.action === "APPOINTMENT_REQUEST_REJECTED") {
    const details = position ? ` (${appointmentType} — ${position})` : "";
    if (isReceiver) return `Your appointment change request was rejected.${details}${note ? ` Reason: ${note}` : ""}`;
    if (isActor) return `You rejected an appointment change request.${details}`;
    return `An appointment change request was rejected.${details}`;
  }

  if (r.action === "PROOF_APPROVED") {
    if (isReceiver) return "Your proof submission was approved.";
    if (isActor) return "You approved a proof submission.";
    return "A proof submission was approved.";
  }

  if (r.action === "PROOF_REJECTED") {
    if (isReceiver) return "Your proof submission was rejected.";
    if (isActor) return "You rejected a proof submission.";
    return "A proof submission was rejected.";
  }

    if (r.action === "REQUEST_REJECTED") {
    if (isReceiver) return `Your request was rejected.${note ? ` Reason: ${note}` : ""}`;
    if (isActor) return `You rejected a request.`;
    return "A request was rejected.";
  }

    if (r.action === "REQUEST_APPROVED") {
    if (isReceiver) return `Your request was approved.${note ? ` Note: ${note}` : ""}`;
    if (isActor) return `You approved a request.`;
    return "A request was approved.";
  }

  if (r.message) return r.message;
  return "Activity updated.";
}

export default function ActivityFeed({
  rows,
  role,
  viewerId,
}: {
  rows: ActivityRow[];
  role: string | null;
  viewerId: string;
}) {
  if (!rows.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 opacity-70">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>

      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {getDisplayMessage(r as FeedRow, viewerId)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{fmt(r.created_at)}</p>
            </div>

            <span className="text-xs px-2 py-1 rounded whitespace-nowrap border border-border text-muted-foreground">
              {r.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
