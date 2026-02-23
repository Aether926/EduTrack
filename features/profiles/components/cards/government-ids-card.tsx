import React from "react";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProfileState } from "@/features/profiles/types/profile";

function Field(props: {
  label: string;
  value: string;
  field: keyof ProfileState;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
  placeholder?: string;
}) {
  const { label, value, field, isEditing, onInputChange, placeholder } = props;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        <Shield size={14} className="text-blue-600" />
        {label}
      </label>

      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => onInputChange(field, e.target.value)}
          placeholder={placeholder || "(optional)"}
        />
      ) : (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

export default function GovernmentIDsCard(props: {
  data: ProfileState;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
  const { data, isEditing, onInputChange } = props;

  return (
    <Card className="flex-col border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="text-blue-600" size={20} />
          <CardTitle>Government IDs & Numbers</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* ── Existing IDs ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field
            label="PAG-IBIG No."
            value={data.pagibigNo}
            field="pagibigNo"
            isEditing={isEditing}
            onInputChange={onInputChange}
          />
          <Field
            label="PhilHealth No."
            value={data.philHealthNo}
            field="philHealthNo"
            isEditing={isEditing}
            onInputChange={onInputChange}
          />
          <Field
            label="GSIS No."
            value={data.gsisNo}
            field="gsisNo"
            isEditing={isEditing}
            onInputChange={onInputChange}
          />
          <Field
            label="TIN No."
            value={data.tinNo}
            field="tinNo"
            isEditing={isEditing}
            onInputChange={onInputChange}
          />
        </div>

        {/* ── NEW: Additional PDS IDs (CS Form 212) ── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field
              label="SSS No."
              value={data.sssNo ?? ""}
              field="sssNo"
              isEditing={isEditing}
              onInputChange={onInputChange}
            />
            <Field
              label="UMID No."
              value={data.umidNo ?? ""}
              field="umidNo"
              isEditing={isEditing}
              onInputChange={onInputChange}
            />
            <Field
              label="PhilSys No. (PSN)"
              value={data.philSysNo ?? ""}
              field="philSysNo"
              isEditing={isEditing}
              onInputChange={onInputChange}
            />
            <Field
              label="Agency Employee No."
              value={data.agencyEmployeeNo ?? ""}
              field="agencyEmployeeNo"
              isEditing={isEditing}
              onInputChange={onInputChange}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}