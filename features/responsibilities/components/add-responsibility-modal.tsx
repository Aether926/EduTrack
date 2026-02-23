"use client";

import { useState } from "react";
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
import { addResponsibility } from "@/features/responsibilities/actions/admin-responsibility-actions";
import type { AddResponsibilityForm, ResponsibilityType } from "@/features/responsibilities/types/responsibility";
import { TeacherPickerModal, type TeacherOption } from "@/components/teacher-picker-modal";

const EMPTY: AddResponsibilityForm = {
  teacher_id: "",
  type: "",
  title: "",
  details: {},
};

export function AddResponsibilityModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { open, onOpenChange, onSuccess } = props;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(null);
  const [form, setForm] = useState<AddResponsibilityForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const setDetail = (key: string) => (val: string) =>
    setForm((f) => ({ ...f, details: { ...f.details, [key]: val } }));

  const handleSubmit = async () => {
    if (!form.teacher_id) return toast.info("Please select a teacher.");
    if (!form.type) return toast.info("Please select a type.");
    if (!form.title.trim()) return toast.info("Please provide a title.");

    setSubmitting(true);
    try {
      await addResponsibility(form);
      toast.success("Responsibility assigned.");
      setForm(EMPTY);
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Responsibility</DialogTitle>
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

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Type <span className="text-red-500">*</span>
            </label>
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as ResponsibilityType, details: {} }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TEACHING_LOAD">Teaching Load</SelectItem>
                <SelectItem value="COORDINATOR">Coordinator Role</SelectItem>
                <SelectItem value="OTHER">Other Duties</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={
                form.type === "TEACHING_LOAD" ? "e.g. Math 8 - Section A" :
                form.type === "COORDINATOR" ? "e.g. Science Department Head" :
                "e.g. Club Adviser - Math Club"
              }
            />
          </div>

          {/* Dynamic details based on type */}
          {form.type === "TEACHING_LOAD" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Subject</label>
                  <Input value={form.details.subject ?? ""} onChange={(e) => setDetail("subject")(e.target.value)} placeholder="e.g. Mathematics" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Grade Level</label>
                  <Input value={form.details.grade ?? ""} onChange={(e) => setDetail("grade")(e.target.value)} placeholder="e.g. Grade 8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Section</label>
                  <Input value={form.details.section ?? ""} onChange={(e) => setDetail("section")(e.target.value)} placeholder="e.g. Section A" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Schedule</label>
                  <Input value={form.details.schedule ?? ""} onChange={(e) => setDetail("schedule")(e.target.value)} placeholder="e.g. MWF 7-8AM" />
                </div>
              </div>
            </div>
          )}

          {form.type === "COORDINATOR" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Role</label>
              <Input value={form.details.role ?? ""} onChange={(e) => setDetail("role")(e.target.value)} placeholder="e.g. Department Head" />
            </div>
          )}

          {form.type === "OTHER" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Organization / Committee</label>
                <Input value={form.details.organization ?? ""} onChange={(e) => setDetail("organization")(e.target.value)} placeholder="e.g. Math Club" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  value={form.details.description ?? ""}
                  onChange={(e) => setDetail("description")(e.target.value)}
                  placeholder="Brief description of the duty..."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2">
            <Send size={14} />
            {submitting ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}