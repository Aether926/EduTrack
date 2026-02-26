/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TeacherDocumentsModal } from "./teacher-documents-modal";

type TeacherStatus = {
  teacherId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  employeeId: string | null;
  approved: number;
  submitted: number;
  rejected: number;
  missing: number;
  total: number;
  docs: any[];
};

export function TeacherOverviewTable({ teacherStatus }: { teacherStatus: TeacherStatus[] }) {
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">Teacher</th>
                <th className="text-center p-3 font-medium">Approved</th>
                <th className="text-center p-3 font-medium">Pending</th>
                <th className="text-center p-3 font-medium">Rejected</th>
                <th className="text-center p-3 font-medium">Missing</th>
                <th className="text-center p-3 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {teacherStatus.map((t) => (
                <tr
                  key={t.teacherId}
                  className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedTeacher(t);
                    setModalOpen(true);
                  }}
                >
                  <td className="p-3">
                    <p className="font-medium">{t.firstName} {t.lastName}</p>
                    <p className="text-xs text-muted-foreground">{t.email}</p>
                  </td>
                  <td className="p-3 text-center text-green-600 font-medium">{t.approved}</td>
                  <td className="p-3 text-center text-blue-600 font-medium">{t.submitted}</td>
                  <td className="p-3 text-center text-red-600 font-medium">{t.rejected}</td>
                  <td className="p-3 text-center text-orange-500 font-medium">{t.missing}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: t.total > 0
                              ? `${(t.approved / t.total) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {t.approved}/{t.total}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <TeacherDocumentsModal
        teacher={selectedTeacher}
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setSelectedTeacher(null);
        }}
      />
    </>
  );
}