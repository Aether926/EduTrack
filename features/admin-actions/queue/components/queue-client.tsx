"use client";

"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HRQueueRow } from "@/features/admin-actions/queue/components/queue-row";
import { AppointmentQueueRow } from "@/features/admin-actions/queue/components/appointment-queue-row";
import type { RequestWithTeacher, AppointmentRequestWithTeacher } from "@/features/admin-actions/queue/types/queue";

export function HRQueueClient(props: {
  hrRequests: RequestWithTeacher[];
  apptRequests: AppointmentRequestWithTeacher[];
}) {
  const { hrRequests, apptRequests } = props;
  const [hrList, setHrList] = useState(hrRequests);
  const [apptList, setApptList] = useState(apptRequests);

  const handleHRRefresh = (id: string, status: "APPROVED" | "REJECTED") =>
    setHrList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const handleApptRefresh = (id: string, status: "APPROVED" | "REJECTED") =>
    setApptList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const pendingHR = hrList.filter((r) => r.status === "PENDING");
  const reviewedHR = hrList.filter((r) => r.status !== "PENDING");
  const pendingAppt = apptList.filter((r) => r.status === "PENDING");
  const reviewedAppt = apptList.filter((r) => r.status !== "PENDING");
  const totalPending = pendingHR.length + pendingAppt.length;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            HR Change Request Queue
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and approve or reject pending requests from teachers.
          </p>
        </header>

        {/* Pending section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-yellow-500" />
              <CardTitle className="text-base">
                Pending ({totalPending})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {totalPending === 0 && (
              <p className="text-sm text-gray-400">No pending requests.</p>
            )}

            {pendingHR.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Employment Info
                </p>
                {pendingHR.map((r) => (
                  <HRQueueRow key={r.id} request={r} onRefresh={handleHRRefresh} />
                ))}
              </div>
            )}

            {pendingAppt.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Appointment Changes
                </p>
                {pendingAppt.map((r) => (
                  <AppointmentQueueRow key={r.id} request={r} onRefresh={handleApptRefresh} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviewed section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">
              Reviewed ({reviewedHR.length + reviewedAppt.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviewedHR.length === 0 && reviewedAppt.length === 0 && (
              <p className="text-sm text-gray-400">No reviewed requests yet.</p>
            )}

            {reviewedHR.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Employment Info
                </p>
                {reviewedHR.map((r) => (
                  <HRQueueRow key={r.id} request={r} onRefresh={handleHRRefresh} />
                ))}
              </div>
            )}

            {reviewedAppt.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Appointment Changes
                </p>
                {reviewedAppt.map((r) => (
                  <AppointmentQueueRow key={r.id} request={r} onRefresh={handleApptRefresh} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}