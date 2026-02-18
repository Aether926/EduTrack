"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TeacherPickerTable from "@/components/teacher-picker-table";
import type { TeacherTableRow } from "@/lib/user";
import { saveTrainingAssignments } from "@/app/actions/attendance";

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "failed to assign";
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
      await saveTrainingAssignments(trainingId, ids);

      toast.success("teachers assigned");
      router.push("/add-training-seminar");
      router.refresh();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
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
