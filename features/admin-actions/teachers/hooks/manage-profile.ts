import { useState } from "react";
import { toast } from "sonner";
import { saveTeacherHR } from "@/features/admin-actions/teachers/actions/manage-teacher-action";
import type { TeacherHRFields } from "@/features/admin-actions/teachers/types/manage-profile";

export function useAdminHREdit(teacherId: string, initial: TeacherHRFields) {
  const [fields, setFields] = useState<TeacherHRFields>(initial);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (key: keyof TeacherHRFields, value: string | null) => {
    setFields((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTeacherHR(teacherId, fields);
      toast.success("Updated successfully.");
      setIsEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFields(initial);
    setIsEditing(false);
  };

  return {
    fields,
    saving,
    isEditing,
    setIsEditing,
    handleChange,
    handleSave,
    handleCancel,
  };
}