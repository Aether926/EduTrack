"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TeacherPickerTable from "@/components/teacher-picker-table";
import type { TeacherTableRow } from "@/lib/user";
import { saveTrainingAssignments } from "@/app/actions/attendance";

function buildSkipReasons(
  skipped: { teacherId: string; status: string }[]
): string {
  const groups: Record<string, number> = {};
  for (const s of skipped) {
    const label =
      s.status === "APPROVED"
        ? "already completed"
        : s.status === "SUBMITTED"
          ? "has pending proof"
          : s.status === "ENROLLED"
            ? "already enrolled"
            : s.status;
    groups[label] = (groups[label] ?? 0) + 1;
  }

  const parts = Object.entries(groups).map(
    ([label, count]) =>
      `${count} ${count === 1 ? "teacher" : "teachers"} ${label}`
  );

  return `Skipped: ${parts.join(", ")}.`;
}

export default function TeacherPickerClient({
  trainingId,
  teachers,
  assignedIds,
}: {
  trainingId: string;
  teachers: TeacherTableRow[];
  assignedIds: string[];
}) {
  const router = useRouter();

  const onAssign = async (rows: TeacherTableRow[]) => {
    try {
      const ids = rows.map((r) => r.id);
      const result = await saveTrainingAssignments(trainingId, ids);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const { assigned, skipped } = result;

      // all assigned successfully
      if (assigned > 0 && skipped.length === 0) {
        toast.success(
          `${assigned} teacher${assigned === 1 ? "" : "s"} assigned successfully.`
        );
        router.push("/add-training-seminar");
        router.refresh();
        return;
      }

      // none assigned — all skipped
      if (assigned === 0 && skipped.length > 0) {
        toast.warning(
          `No teachers were assigned. ${buildSkipReasons(skipped)}`,
          { duration: 6000 }
        );
        return;
      }

      // partial — some assigned, some skipped
      if (assigned > 0 && skipped.length > 0) {
        toast.success(
          `${assigned} teacher${assigned === 1 ? "" : "s"} assigned. ${buildSkipReasons(skipped)}`,
          { duration: 6000 }
        );
        router.push("/add-training-seminar");
        router.refresh();
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to assign teachers.");
    }
  };

  return (
    <TeacherPickerTable
      data={teachers}
      // assignedIds={assignedIds}
      onAssign={onAssign}
    />
  );
}