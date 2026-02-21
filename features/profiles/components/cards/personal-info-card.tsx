import React from "react";
import { User, Calendar, ChevronDownIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/combobox";

import type { ProfileState } from "@/features/profiles/types/profile";
import { formatName, cleanMiddleInitial } from "@/app/util/helper";

function InputField(props: {
  label: string;
  value: string;
  field: keyof ProfileState;
  type?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  rows?: number;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
  onBlur?: (field: keyof ProfileState) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const { label, value, field, type = "text", icon: Icon, rows, isEditing, onInputChange, onBlur, required, placeholder } = props;
  const isTextarea = type === "textarea";

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        {Icon ? <Icon size={14} className="text-blue-600" /> : null}
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>

      {isEditing ? (
        isTextarea ? (
          <Textarea
            value={value}
            onChange={(e) => onInputChange(field, e.target.value)}
            className="resize-none"
            rows={rows || 3}
            placeholder={placeholder || ""}
            required={Boolean(required)}
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => onInputChange(field, e.target.value)}
            onBlur={() => onBlur?.(field)}
            placeholder={placeholder || ""}
            required={Boolean(required)}
          />
        )
      ) : (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function DatePickerField(props: {
  label: string;
  value: Date | undefined;
  field: keyof ProfileState;
  isEditing: boolean;
  onDateChange: (field: keyof ProfileState, date: Date | undefined) => void;
  required?: boolean;
}) {
  const { label, value, field, isEditing, onDateChange, required } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        <Calendar size={14} className="text-blue-600" />
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>

      {isEditing ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {value ? value.toLocaleDateString() : "Select date"}
              <ChevronDownIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
            <CalendarComponent
              mode="single"
              selected={value}
              captionLayout="dropdown"
              onSelect={(date) => {
                onDateChange(field, date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
          {value ? value.toLocaleDateString() : "—"}
        </div>
      )}
    </div>
  );
}

export default function PersonalInfoCard(props: {
  data: ProfileState;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileState, value: string) => void;
  onDateChange: (field: keyof ProfileState, date: Date | undefined) => void;
}) {
  const { data, isEditing, onInputChange, onDateChange } = props;

  const nationalities = [
    { value: "american", label: "American" },
    { value: "australian", label: "Australian" },
    { value: "british", label: "British" },
    { value: "canadian", label: "Canadian" },
    { value: "chinese", label: "Chinese" },
    { value: "emirati", label: "Emirati" },
    { value: "filipino", label: "Filipino" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "indian", label: "Indian" },
    { value: "indonesian", label: "Indonesian" },
    { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "kuwaiti", label: "Kuwaiti" },
    { value: "malaysian", label: "Malaysian" },
    { value: "qatari", label: "Qatari" },
    { value: "saudi", label: "Saudi" },
    { value: "singaporean", label: "Singaporean" },
    { value: "spanish", label: "Spanish" },
    { value: "taiwanese", label: "Taiwanese" },
    { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" },
  ];

  const religion = [
    { value: "roman catholic", label: "Roman Catholic" },
    { value: "islam", label: "Islam" },
    { value: "evangelical", label: "Evangelical" },
    { value: "protestant", label: "Protestant" },
    { value: "iglesia ni Cristo", label: "Iglesia ni Cristo" },
    { value: "seventh-day Adventist", label: "Seventh-day Adventist" },
  ];

  return (
    <Card className="border-0 shadow-lg w-full xl:max-w-[500px]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="text-blue-600" size={20} />
          <CardTitle>Personal Information</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 w-full">
        <div className="space-y-4">
          <InputField
            label="First Name"
            value={data.firstName}
            field="firstName"
            icon={User}
            isEditing={isEditing}
            onInputChange={onInputChange}
            onBlur={(field) => {
              if (field === "firstName") onInputChange("firstName", formatName(data.firstName));
            }}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="Middle Initial"
              value={data.middleInitial}
              field="middleInitial"
              isEditing={isEditing}
              onInputChange={(field, value) => onInputChange(field, cleanMiddleInitial(value))}
              placeholder="Optional"
            />
            <div className="col-span-2">
              <InputField
                label="Last Name"
                value={data.lastName}
                field="lastName"
                isEditing={isEditing}
                onInputChange={onInputChange}
                onBlur={(field) => {
                  if (field === "lastName") onInputChange("lastName", formatName(data.lastName));
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Age
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                {data.age || "—"}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Gender
              </label>
              {isEditing ? (
                <Select value={data.gender} onValueChange={(v) => onInputChange("gender", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                  {data.gender}
                </div>
              )}
            </div>
          </div>

          <DatePickerField
            label="Date of Birth"
            value={data.dateOfBirth}
            field="dateOfBirth"
            isEditing={isEditing}
            onDateChange={onDateChange}
          />

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Civil Status
            </label>
            {isEditing ? (
              <Select value={data.civilStatus} onValueChange={(v) => onInputChange("civilStatus", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                  <SelectItem value="Separated">Separated</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                {data.civilStatus}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Nationality
            </label>
            {isEditing ? (
              <Combobox
                label="Nationality"
                options={nationalities}
                onChangeValue={(v: string) => onInputChange("nationality", v)}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                {data.nationality}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Religion
            </label>
            {isEditing ? (
              <Combobox
                label="Religion"
                options={religion}
                onChangeValue={(v: string) => onInputChange("religion", v)}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                {data.religion}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800" />
      </CardContent>
    </Card>
  );
}
