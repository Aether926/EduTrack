import TeacherPickerClient from "./teacher-picker-client";
import {
  getAssignedTeacherIds,
  getProfessionalDevelopmentAdmin,
  getTeachersForPicker,
} from "@/lib/database/assignments";
import type { TeacherTableRow } from "@/lib/user";

export default async function AssignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: trainingId } = await params;

  const [training, teachers, assignedIds] = await Promise.all([
    getProfessionalDevelopmentAdmin(trainingId),
    getTeachersForPicker(),
    getAssignedTeacherIds(trainingId),
  ]);
  

  if (!training) return <div className="p-6">training/seminar not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-lg border p-4 space-y-1">
        <div className="text-2xl font-bold">{training.title}</div>
        <div className="text-sm opacity-70">
          {training.type} • {training.level} • {training.total_hours} hrs
        </div>
        <div className="text-sm opacity-70">
          {training.sponsoring_agency} • {training.venue}
        </div>
        {training.description ? (
          <div className="text-sm opacity-70">{training.description}</div>
        ) : null}
      </div>

      <TeacherPickerClient
        trainingId={trainingId}
        teachers={teachers as TeacherTableRow[]}
        assignedIds={assignedIds as string[]}
      />
    </div>
  );
}
