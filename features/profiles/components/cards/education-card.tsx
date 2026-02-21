import React from "react";
import { Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProfileState } from "@/features/profiles/types/profile";

function Field(props: {
  label: string;
  value: string;
  field: keyof ProfileState;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const { label, value, field, isEditing, onInputChange, required, placeholder } = props;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        <Book size={14} className="text-blue-600" />
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>

      {isEditing ? (
        <Input value={value} onChange={(e) => onInputChange(field, e.target.value)} placeholder={placeholder || ""} required={Boolean(required)} />
      ) : (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

export default function EducationCard(props: {
  data: ProfileState;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
  const { data, isEditing, onInputChange } = props;

  return (
    <Card className="flex-col border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Book className="text-blue-600" size={20} />
          <CardTitle>Educational Background</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Field label="Subject Specialization" value={data.subjectSpecialization} field="subjectSpecialization" isEditing={isEditing} onInputChange={onInputChange} />
        <Field label="Bachelor's Degree" value={data.bachelorsDegree} field="bachelorsDegree" isEditing={isEditing} onInputChange={onInputChange} required />
        <Field label="Post Graduate" value={data.postGraduate} field="postGraduate" isEditing={isEditing} onInputChange={onInputChange} placeholder="(optional)" />
      </CardContent>
    </Card>
  );
}
