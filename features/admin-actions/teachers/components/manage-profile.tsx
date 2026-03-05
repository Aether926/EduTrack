/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase, FileText, Calendar as CalendarIcon,
  ChevronLeft, Pencil, Save, X, User,
  Phone, MapPin, Shield, Book, History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAdminHREdit } from "@/features/admin-actions/teachers/hooks/manage-profile";
import type { TeacherProfile, TeacherHRFields } from "@/features/admin-actions/teachers/types/manage-profile";
import type { TrainingRow } from "@/features/profiles/types/trainings";
import TrainingsCard from "@/features/profiles/components/cards/training-card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { AdminDangerZone } from "@/features/admin-actions/teachers/components/admin-danger-zone";

const POSITIONS = [
  "Teacher I", "Teacher II", "Teacher III", "Teacher IV", "Teacher V", "Teacher VI","Teacher VII",
  "Master Teacher I", "Master Teacher II", "Master Teacher III", 
  "Principal", "Administrative Staff",
];

const TYPE_STYLE: Record<string, string> = {
  Original: "bg-blue-100 text-blue-800",
  Promotion: "bg-purple-100 text-purple-800",
  Reappointment: "bg-teal-100 text-teal-800",
  Transfer: "bg-orange-100 text-orange-800",
  Reinstatement: "bg-pink-100 text-pink-800",
};

// ─── Read-only field ───────────────────────────────────────────────
function ReadField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        {Icon ? <Icon size={14} className="text-blue-600" /> : null}
        {label}
      </label>
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
        {value || "—"}
      </div>
    </div>
  );
}

// ─── Editable HR field ─────────────────────────────────────────────
function Field(props: {
  label: string;
  value: string;
  fieldKey: string;
  isEditing: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const { label, value, isEditing, icon: Icon, onChange, placeholder } = props;
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        {Icon ? <Icon size={14} className="text-blue-600" /> : null}
        {label}
      </label>
      {isEditing ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function DateField(props: {
  label: string;
  value: string | null;
  isEditing: boolean;
  onChange: (val: string | null) => void;
  minDate?: string | null;
  disabled?: boolean;
}) {
  const { label, value, isEditing, onChange, minDate, disabled } = props;
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(value) : undefined;
  const minDateValue = minDate ? new Date(minDate) : undefined;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        <CalendarIcon size={14} className="text-blue-600" />
        {label}
      </label>
      {isEditing ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={disabled} className="w-full justify-start text-left font-normal">
              {dateValue ? dateValue.toLocaleDateString() : "Select date"}
              <ChevronDownIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
            <CalendarComponent
              mode="single"
              selected={dateValue}
              captionLayout="dropdown"
              disabled={(date) => minDateValue ? date < minDateValue : false}
              onSelect={(date) => {
                onChange(date ? date.toISOString().split("T")[0] : null);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
          {dateValue ? dateValue.toLocaleDateString() : "—"}
        </div>
      )}
    </div>
  );
}

// ─── Appointment Timeline ──────────────────────────────────────────
function AppointmentTimeline({ rows }: { rows: any[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No appointment history yet.</p>;
  }

  return (
    <div className="relative pl-4 space-y-4">
      {/* vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-200 dark:bg-gray-700" />

      {rows.map((row, i) => (
        <div key={row.id} className="relative flex gap-4">
          {/* dot */}
          <div className="mt-1.5 w-3 h-3 rounded-full border-2 border-blue-500 bg-background shrink-0 z-10" />

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLE[row.appointment_type] ?? "bg-gray-100 text-gray-800"}`}>
                {row.appointment_type}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.start_date ? new Date(row.start_date).toLocaleDateString() : "—"}
                {row.end_date ? ` → ${new Date(row.end_date).toLocaleDateString()}` : ""}
              </span>
            </div>
            <p className="text-sm font-medium">{row.position}</p>
            {row.memo_no && (
              <p className="text-xs text-muted-foreground">Memo: {row.memo_no}</p>
            )}
            {row.remarks && (
              <p className="text-xs text-muted-foreground">{row.remarks}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Training Calendar ─────────────────────────────────────────────
function TrainingCalendarView({ trainings }: { trainings: TrainingRow[] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  // map trainings that overlap any day in this month
  const trainingDays = new Map<number, TrainingRow[]>();
  trainings.forEach((t) => {
    if (!t.startDate) return;
    const start = new Date(t.startDate);
    const end = t.endDate ? new Date(t.endDate) : start;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!trainingDays.has(day)) trainingDays.set(day, []);
        trainingDays.get(day)!.push(t);
      }
    }
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedTrainings = selectedDay ? (trainingDays.get(selectedDay) ?? []) : [];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
        >
          ‹
        </Button>
        <span className="text-sm font-semibold">{monthName}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
        >
          ›
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const hasTraining = trainingDays.has(day);
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`
                relative h-9 w-full rounded-md text-xs font-medium transition-colors
                ${isToday ? "border border-blue-500" : ""}
                ${isSelected ? "bg-blue-600 text-white" : hasTraining ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
              `}
            >
              {day}
              {hasTraining && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day trainings */}
      {selectedDay && (
        <div className="border-t pt-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {monthName.split(" ")[0]} {selectedDay}
          </p>
          {selectedTrainings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trainings.</p>
          ) : (
            selectedTrainings.map((t) => (
              <div key={t.attendanceId} className="text-sm border border-border rounded-md px-3 py-2">
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.type} {t.totalHours ? `· ${t.totalHours} hrs` : ""}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────
export default function AdminTeacherManage(props: {
  teacherId: string;
  profile: any;
  hr: TeacherHRFields;
  appointmentHistory: any[];
  trainings: TrainingRow[];
}) {
  const { teacherId, profile, hr, appointmentHistory, trainings } = props;
  const router = useRouter();

  const {
    fields, saving, isEditing,
    setIsEditing, handleChange, handleSave, handleCancel,
  } = useAdminHREdit(teacherId, hr);

  const fullName = `${profile.firstName ?? ""} ${profile.middleInitial ?? ""} ${profile.lastName ?? ""}`.trim();
  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground"
          onClick={() => router.push("/admin-actions/teachers")}
        >
          <ChevronLeft size={16} />
          Back to Teachers
        </Button>

        {/* Identity */}
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.profileImage ?? undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              {fields.position && (
                <p className="text-sm text-blue-600 font-medium mt-0.5">{fields.position}</p>
              )}
            </div>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/teacher-profiles/${teacherId}`)}
              >
                <User size={14} className="mr-2" />
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT column */}
          <div className="space-y-6">

            {/* Personal Info — read only */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  <CardTitle>Personal Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ReadField label="Age" value={profile.age ? String(profile.age) : null} />
                  <ReadField label="Gender" value={profile.gender} />
                </div>
                <ReadField
                  label="Date of Birth"
                  value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null}
                />
                <ReadField label="Civil Status" value={profile.civilStatus} />
                <ReadField label="Nationality" value={profile.nationality} />
                <ReadField label="Religion" value={profile.religion} />
              </CardContent>
            </Card>

            {/* Contact Info — read only */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Phone className="text-blue-600" size={20} />
                  <CardTitle>Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReadField label="Contact Number" icon={Phone} value={profile.contactNumber} />
                <ReadField label="Address" icon={MapPin} value={profile.address} />
              </CardContent>
            </Card>

            {/* Government IDs — read only */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="text-blue-600" size={20} />
                  <CardTitle>Government IDs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <ReadField label="PAG-IBIG No." value={profile.pagibigNo} />
                  <ReadField label="PhilHealth No." value={profile.philHealthNo} />
                  <ReadField label="GSIS No." value={profile.gsisNo} />
                  <ReadField label="TIN No." value={profile.tinNo} />
                </div>
              </CardContent>
            </Card>

            {/* Education — read only */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="text-blue-600" size={20} />
                  <CardTitle>Educational Background</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReadField label="Subject Specialization" value={profile.subjectSpecialization} />
                <ReadField label="Bachelor's Degree" value={profile.bachelorsDegree} />
                <ReadField label="Post Graduate" value={profile.postGraduate} />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT column */}
          <div className="space-y-6">

            {/* Employment — editable */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-blue-600" size={20} />
                    <CardTitle>Employment Information</CardTitle>
                  </div>
                  {!isEditing ? (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Pencil size={14} className="mr-1" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                        <X size={14} className="mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        <Save size={14} className="mr-1" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Employee ID"
                    value={fields.employeeId}
                    fieldKey="employeeId"
                    icon={FileText}
                    isEditing={isEditing}
                    onChange={(v) => handleChange("employeeId", v)}
                  />
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                      <Briefcase size={14} className="text-blue-600" />
                      Position
                    </label>
                    {isEditing ? (
                      <Select value={fields.position} onValueChange={(v) => handleChange("position", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                        {fields.position || "—"}
                      </div>
                    )}
                  </div>
                </div>

                <Field
                  label="Plantilla No."
                  value={fields.plantillaNo}
                  fieldKey="plantillaNo"
                  icon={FileText}
                  isEditing={isEditing}
                  onChange={(v) => handleChange("plantillaNo", v)}
                  placeholder="(optional)"
                />

                <div className="grid grid-cols-2 gap-4">
                  <DateField
                    label="Original Appointment"
                    value={fields.dateOfOriginalAppointment}
                    isEditing={isEditing}
                    onChange={(v) => {
                      handleChange("dateOfOriginalAppointment", v);
                      if (fields.dateOfLatestAppointment && v && fields.dateOfLatestAppointment < v) {
                        handleChange("dateOfLatestAppointment", null);
                      }
                    }}
                  />
                  <DateField
                    label="Latest Appointment"
                    value={fields.dateOfLatestAppointment}
                    isEditing={isEditing}
                    minDate={fields.dateOfOriginalAppointment}   // 👈 block before original
                    disabled={!fields.dateOfOriginalAppointment} // optional UX
                    onChange={(v) => handleChange("dateOfLatestAppointment", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appointment Timeline */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="text-blue-600" size={20} />
                  <CardTitle>Appointment Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <AppointmentTimeline rows={appointmentHistory} />
              </CardContent>
            </Card>

            {/* Training Calendar */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="text-blue-600" size={20} />
                  <CardTitle>Training Calendar</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <TrainingCalendarView trainings={trainings} />
              </CardContent>
            </Card>

            {/* Trainings Table */}
            <TrainingsCard
              trainings={trainings}
              loading={false}
              viewerRole="ADMIN"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <AdminDangerZone
          teacherId={teacherId}
          teacherName={fullName}
        />

      </div>
    </main>
  );
}