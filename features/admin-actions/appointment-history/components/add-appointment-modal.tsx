/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addAppointmentHistoryEntry } from "@/features/admin-actions/appointment-history/actions/appointment-history-actions";
import type { AddAppointmentForm } from "@/features/admin-actions/appointment-history/types/appointment-history";
import { TeacherPickerModal, type TeacherOption } from "@/components/teacher-picker-modal";

const POSITIONS = [
  "Teacher I", "Teacher II", "Teacher III", "Teacher IV", "Teacher V", "Teacher VI","Teacher VII",
  "Master Teacher I", "Master Teacher II", "Master Teacher III", 
  "Principal", "Administrative Staff",
];

const APPOINTMENT_TYPES = [
  "Original", "Promotion", "Reappointment", "Transfer", "Reinstatement",
];

const EMPTY: AddAppointmentForm = {
  teacher_id: "",
  position: "",
  appointment_type: "",
  start_date: "",
  end_date: "",
  memo_no: "",
  remarks: "",
  school_name: "",
};

export function AddAppointmentModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { open, onOpenChange, onSuccess } = props;
  const [form, setForm] = useState<AddAppointmentForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(null);

  const set = (key: keyof AddAppointmentForm) => (val: string) =>
    setForm((f: any) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.teacher_id) return toast.info("Please select a teacher.");
    if (!form.position) return toast.info("Please select a position.");
    if (!form.appointment_type) return toast.info("Please select an appointment type.");
    if (!form.start_date) return toast.info("Please provide a start date.");

    setSubmitting(true);
    try {
      await addAppointmentHistoryEntry(form);
      toast.success("Appointment history entry added.");
      setForm(EMPTY);
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Appointment History Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Teacher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Teacher <span className="text-red-500">*</span>
            </label>
            <Button
              variant="outline"
              className="w-full justify-start font-normal"
              onClick={() => setPickerOpen(true)}
            >
              {selectedTeacher ? selectedTeacher.fullName : "Select teacher..."}
            </Button>
            <TeacherPickerModal
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              selectedId={selectedTeacher?.id}
              onSelect={(t) => {
                setSelectedTeacher(t);
                setForm((f) => ({ ...f, teacher_id: t.id }));
              }}
            />
          </div>
          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Position <span className="text-red-500">*</span>
            </label>
            <Select value={form.position} onValueChange={set("position")}>
              <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Appointment Type <span className="text-red-500">*</span>
            </label>
            <Select value={form.appointment_type} onValueChange={set("appointment_type")}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* School Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              School Name
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <Input
              value={form.school_name}
              onChange={(e) => set("school_name")(e.target.value)}
              placeholder="e.g. Ormoc City National High School"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => set("start_date")(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                End Date
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => set("end_date")(e.target.value)}
              />
            </div>
          </div>

          {/* Memo No */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Memo No.
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <Input
              value={form.memo_no}
              onChange={(e) => set("memo_no")(e.target.value)}
              placeholder="e.g. DepEd-2024-001"
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Remarks
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes..."
              value={form.remarks}
              onChange={(e) => set("remarks")(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2">
            <Send size={14} />
            {submitting ? "Saving..." : "Add Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}