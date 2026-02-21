import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProfileState } from "@/features/profiles/types/profile";
import type { HRChangeRequestPayload } from "@/features/profiles/types/employment-info";

// add this helper component inside the file
function DatePickerField(props: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  optional?: boolean;
}) {
  const { label, value, onChange, required, optional } = props;
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(value) : undefined;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            {dateValue ? dateValue.toLocaleDateString() : "Select date"}
            <ChevronDownIcon className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
          <CalendarComponent
            mode="single"
            selected={dateValue}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date ? date.toISOString().split("T")[0] : "");
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
const POSITIONS = [
  "Teacher I",
  "Teacher II",
  "Teacher III",
  "Master Teacher I",
  "Master Teacher II",
  "Master Teacher III",
  "Principal",
  "Administrative Staff",
];

type Form = {
  employeeId: string;
  position: string;
  plantillaNo: string;
  dateOfOriginalAppointment: string;
  dateOfLatestAppointment: string;
  reason: string;
};

function toDateString(d?: Date) {
  return d ? d.toISOString().split("T")[0] : "";
}

export function RequestHRChangeModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData: ProfileState;
  submitting: boolean;
  onSubmit: (payload: HRChangeRequestPayload) => Promise<boolean>;
}) {
  const { open, onOpenChange, currentData, submitting, onSubmit } = props;

  const [form, setForm] = useState<Form>({
    employeeId: currentData.employeeId ?? "",
    position: currentData.position ?? "",
    plantillaNo: currentData.plantillaNo ?? "",
    dateOfOriginalAppointment: toDateString(currentData.dateOfOriginalAppointment),
    dateOfLatestAppointment: toDateString(currentData.dateOfLatestAppointment),
    reason: "",
  });

  const set = (key: keyof Form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    const success = await onSubmit({
      employeeId: form.employeeId || null,
      position: form.position || null,
      plantillaNo: form.plantillaNo || null,
      dateOfOriginalAppointment: form.dateOfOriginalAppointment || null,
      dateOfLatestAppointment: form.dateOfLatestAppointment || null,
      reason: form.reason,
    });
    if (success) {
      setForm((f) => ({ ...f, reason: "" }));
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Employment Info Change</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">
            Fill in only the fields you want changed. Leave blank to keep
            current values. An admin will review your request before any
            changes are applied.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Employee ID
            </label>
            <Input
              value={form.employeeId}
              onChange={(e) => set("employeeId")(e.target.value)}
              placeholder={currentData.employeeId || "Current value"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Position/Designation
            </label>
            <Select value={form.position} onValueChange={set("position")}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Plantilla No.
            </label>
            <Input
              value={form.plantillaNo}
              onChange={(e) => set("plantillaNo")(e.target.value)}
              placeholder={currentData.plantillaNo || "Current value"}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DatePickerField
              label="Original Appointment"
              value={form.dateOfOriginalAppointment}
              onChange={set("dateOfOriginalAppointment")}
            />
            <DatePickerField
              label="Latest Appointment"
              value={form.dateOfLatestAppointment}
              onChange={set("dateOfLatestAppointment")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Reason for Change <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Explain why you need these changes..."
              value={form.reason}
              onChange={(e) => set("reason")(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2">
            <Send size={14} />
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}