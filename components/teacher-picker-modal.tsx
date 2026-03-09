"use client";

import { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchTeacherOptions } from "@/features/responsibilities/actions/teacher-picker-actions";

export type TeacherOption = {
  id: string;
  fullName: string;
  employeeId: string;
};

export function TeacherPickerModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (teacher: TeacherOption) => void;
  selectedId?: string;
}) {
  const { open, onOpenChange, onSelect, selectedId } = props;
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const options = await fetchTeacherOptions();
        setTeachers(options);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [open]);

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return t.fullName.toLowerCase().includes(q) || t.employeeId.toLowerCase().includes(q);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Teacher</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto border border-border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">No teachers found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee ID</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const isSelected = t.id === selectedId;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => { onSelect(t); onOpenChange(false); }}
                      className={`cursor-pointer border-b border-border last:border-0 transition-colors ${
                        isSelected ? "bg-blue-50 dark:bg-blue-950/30" : "hover:bg-muted/50"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium">{t.fullName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{t.employeeId}</td>
                      <td className="px-2 py-2.5">
                        {isSelected && <Check size={14} className="text-blue-500" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-right">
          {filtered.length} teacher{filtered.length !== 1 ? "s" : ""}
        </div>
      </DialogContent>
    </Dialog>
  );
}