/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherDocumentsModal } from "./teacher-documents-modal";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

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

function pct(approved: number, total: number) {
  if (!total) return 0;
  return Math.round((approved / total) * 100);
}

export function TeacherOverviewTable({
  teacherStatus,
}: {
  teacherStatus: TeacherStatus[];
}) {
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherStatus | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {/* prevents squish/overlap */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Teacher</th>

                  {/* hide heavy columns on mobile */}
                  <th className="hidden md:table-cell text-center p-3 font-medium">
                    Approved
                  </th>
                  <th className="hidden md:table-cell text-center p-3 font-medium">
                    Pending
                  </th>
                  <th className="hidden md:table-cell text-center p-3 font-medium">
                    Rejected
                  </th>
                  <th className="hidden md:table-cell text-center p-3 font-medium">
                    Missing
                  </th>

                  <th className="text-center p-3 font-medium">Progress</th>
                </tr>
              </thead>

              <tbody>
                {teacherStatus.map((t) => {
                  const percent = pct(t.approved, t.total);

                  return (
                    <tr
                      key={t.teacherId}
                      className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setSelectedTeacher(t);
                        setModalOpen(true);
                      }}
                    >
                      <td className="p-3 align-top">
                        <p className="font-medium">
                          {t.firstName} {t.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[60vw]">
                          {t.email}
                        </p>

                        {/* mobile: show counts compactly under the name */}
                        <div className="mt-2 flex flex-wrap gap-2 md:hidden">
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t.approved}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {t.submitted}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3.5 w-3.5" />
                            {t.rejected}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {t.missing}
                          </Badge>
                        </div>

                        {/* mobile: progress under counts */}
                        <div className="mt-2 md:hidden">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: t.total > 0 ? `${(t.approved / t.total) * 100}%` : "0%",
                              }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {t.approved}/{t.total} approved
                            </span>
                            <span>{percent}%</span>
                          </div>
                        </div>
                      </td>

                      {/* desktop counts */}
                      <td className="hidden md:table-cell p-3 text-center text-green-600 font-medium align-top">
                        {t.approved}
                      </td>
                      <td className="hidden md:table-cell p-3 text-center text-blue-600 font-medium align-top">
                        {t.submitted}
                      </td>
                      <td className="hidden md:table-cell p-3 text-center text-red-600 font-medium align-top">
                        {t.rejected}
                      </td>
                      <td className="hidden md:table-cell p-3 text-center text-orange-500 font-medium align-top">
                        {t.missing}
                      </td>

                      {/* desktop progress */}
                      <td className="p-3 align-top">
                        <div className="hidden md:flex items-center gap-2 min-w-[220px]">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: t.total > 0 ? `${(t.approved / t.total) * 100}%` : "0%",
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {t.approved}/{t.total}
                          </span>
                        </div>

                        {/* on mobile we already show progress under teacher */}
                        <div className="md:hidden text-center text-xs text-muted-foreground">
                          —
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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