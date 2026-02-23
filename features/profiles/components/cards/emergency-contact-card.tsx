"use client";

import React from "react";
import { PhoneCall, User, MapPin, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProfileState } from "@/features/profiles/types/profile";

function Field(props: {
  label: string;
  value: string;
  field: keyof ProfileState;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  type?: string;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
  placeholder?: string;
}) {
  const { label, value, field, icon: Icon, type = "text", isEditing, onInputChange, placeholder } = props;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        {Icon ? <Icon size={14} className="text-blue-600" /> : null}
        {label}
      </label>
      {isEditing ? (
        <Input
          type={type}
          value={value}
          onChange={(e) => onInputChange(field, e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface EmergencyContactCardProps {
  data: ProfileState;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
}

export default function EmergencyContactCard({
  data,
  isEditing,
  onInputChange,
}: EmergencyContactCardProps) {
  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PhoneCall className="text-blue-600" size={20} />
          <CardTitle>Emergency Contact</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground ml-7">
          Person to contact in case of emergency
        </p>
      </CardHeader>

      <CardContent className="space-y-4 w-full">
        <Field
          label="Full Name"
          value={data.emergencyName}
          field="emergencyName"
          icon={User}
          isEditing={isEditing}
          onInputChange={onInputChange}
          placeholder="e.g. Juan Dela Cruz"
        />
        <Field
          label="Relationship"
          value={data.emergencyRelationship}
          field="emergencyRelationship"
          icon={Heart}
          isEditing={isEditing}
          onInputChange={onInputChange}
          placeholder="e.g. Spouse, Parent, Sibling"
        />
        <Field
          label="Address"
          value={data.emergencyAddress}
          field="emergencyAddress"
          icon={MapPin}
          isEditing={isEditing}
          onInputChange={onInputChange}
          placeholder="e.g. Valencia City, Bukidnon"
        />
        <Field
          label="Telephone / Mobile No."
          value={data.emergencyTelephoneNo}
          field="emergencyTelephoneNo"
          icon={PhoneCall}
          type="tel"
          isEditing={isEditing}
          onInputChange={onInputChange}
          placeholder="e.g. 09XX-XXX-XXXX"
        />
      </CardContent>
    </Card>
  );
}