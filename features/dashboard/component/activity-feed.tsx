import type { ActivityRow } from "@/lib/database/activity";

function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function getDisplayMessage(r: ActivityRow, role: string | null) {
  const title = (r.meta?.title as string | undefined) ?? null;

  if (role === "ADMIN") {
    if (r.action === "ASSIGNED_TO_TRAINING") {
      const teacherName = (r.meta?.teacherName as string | undefined) ?? "a teacher";
      return `Assigned ${teacherName} to ${title ?? "a training"}.`;
    }
    if (r.action === "PROOF_SUBMITTED") return "A teacher submitted proof.";
    if (r.action === "PROOF_APPROVED") return "Approved a proof submission.";
    if (r.action === "PROOF_REJECTED") return "Rejected a proof submission.";
  }

  // teacher view (fallback to stored message)
  if (r.action === "ASSIGNED_TO_TRAINING") {
    return `You were assigned to ${title ?? "a training"}.`;
  }

  return r.message;
}

export default function ActivityFeed({
  rows,
  role,
}: {
  rows: ActivityRow[];
  role: string | null;
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
                {getDisplayMessage(r, role)}
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
