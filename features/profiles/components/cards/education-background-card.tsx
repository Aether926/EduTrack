"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProfileState } from "@/features/profiles/types/profile";

// ─── Reusable Field ───────────────────────────────────────────────────────────

function Field(props: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const { label, value, isEditing, onChange, placeholder, type = "text" } = props;
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      {isEditing ? (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium min-h-[38px]">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

// ─── Education Level Row ──────────────────────────────────────────────────────

type LevelConfig = {
  label: string;
  schoolKey: keyof ProfileState;
  degreeKey: keyof ProfileState;
  fromKey: keyof ProfileState;
  toKey: keyof ProfileState;
  unitsKey: keyof ProfileState;
  graduatedKey: keyof ProfileState;
  honorsKey: keyof ProfileState;
};

const LEVELS: LevelConfig[] = [
  {
    label: "Elementary",
    schoolKey: "educationElementarySchool",
    degreeKey: "educationElementaryDegree",
    fromKey: "educationElementaryFrom",
    toKey: "educationElementaryTo",
    unitsKey: "educationElementaryUnits",
    graduatedKey: "educationElementaryGraduated",
    honorsKey: "educationElementaryHonors",
  },
  {
    label: "Secondary",
    schoolKey: "educationSecondarySchool",
    degreeKey: "educationSecondaryDegree",
    fromKey: "educationSecondaryFrom",
    toKey: "educationSecondaryTo",
    unitsKey: "educationSecondaryUnits",
    graduatedKey: "educationSecondaryGraduated",
    honorsKey: "educationSecondaryHonors",
  },
  {
    label: "Vocational / Trade Course",
    schoolKey: "educationVocationalSchool",
    degreeKey: "educationVocationalDegree",
    fromKey: "educationVocationalFrom",
    toKey: "educationVocationalTo",
    unitsKey: "educationVocationalUnits",
    graduatedKey: "educationVocationalGraduated",
    honorsKey: "educationVocationalHonors",
  },
  {
    label: "College",
    schoolKey: "educationCollegeSchool",
    degreeKey: "educationCollegeDegree",
    fromKey: "educationCollegeFrom",
    toKey: "educationCollegeTo",
    unitsKey: "educationCollegeUnits",
    graduatedKey: "educationCollegeGraduated",
    honorsKey: "educationCollegeHonors",
  },
  {
    label: "Graduate Studies",
    schoolKey: "educationGraduateSchool",
    degreeKey: "educationGraduateDegree",
    fromKey: "educationGraduateFrom",
    toKey: "educationGraduateTo",
    unitsKey: "educationGraduateUnits",
    graduatedKey: "educationGraduateGraduated",
    honorsKey: "educationGraduateHonors",
  },
];

function EducationLevelRow(props: {
  config: LevelConfig;
  data: ProfileState;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
  const { config, data, isEditing, onInputChange } = props;
  const g = (key: keyof ProfileState) => (data[key] as string) ?? "";
  const s = (key: keyof ProfileState) => (value: string) => onInputChange(key, value);

  const hasData =
    g(config.schoolKey) ||
    g(config.degreeKey) ||
    g(config.fromKey) ||
    g(config.graduatedKey);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="bg-blue-50 dark:bg-blue-950/40 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
          {config.label}
        </span>
        {!isEditing && !hasData && (
          <span className="text-xs text-gray-400 italic">Not filled</span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <Field label="Name of School" value={g(config.schoolKey)} isEditing={isEditing} onChange={s(config.schoolKey)} placeholder="Write in full" />
        <Field label="Basic Education / Degree / Course" value={g(config.degreeKey)} isEditing={isEditing} onChange={s(config.degreeKey)} placeholder="Write in full" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="From (Year)" value={g(config.fromKey)} isEditing={isEditing} onChange={s(config.fromKey)} placeholder="e.g. 2000" type="number" />
          <Field label="To (Year)" value={g(config.toKey)} isEditing={isEditing} onChange={s(config.toKey)} placeholder="e.g. 2004" type="number" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Highest Level / Units Earned" value={g(config.unitsKey)} isEditing={isEditing} onChange={s(config.unitsKey)} placeholder="If not graduated" />
          <Field label="Year Graduated" value={g(config.graduatedKey)} isEditing={isEditing} onChange={s(config.graduatedKey)} placeholder="e.g. 2004" type="number" />
        </div>
        <Field label="Scholarship / Academic Honors Received" value={g(config.honorsKey)} isEditing={isEditing} onChange={s(config.honorsKey)} placeholder="e.g. With Honors" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface EducationBackgroundCardProps {
  data: ProfileState;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
}

export default function EducationBackgroundCard({
  data,
  isEditing,
  onInputChange,
}: EducationBackgroundCardProps) {
  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" size={20} />
          <CardTitle>Educational Background</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 w-full">
        {LEVELS.map((config) => (
          <EducationLevelRow
            key={config.label}
            config={config}
            data={data}
            isEditing={isEditing}
            onInputChange={onInputChange}
          />
        ))}
      </CardContent>
    </Card>
  );
}