import React from "react";
import { Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { TrainingRow } from "@/features/profiles/types/trainings";
import type { ViewerRole } from "@/features/profiles/types/viewer-role";
import { badgeClass, fmtDateRange } from "@/features/profiles/lib/date";

export default function TrainingsCard(props: {
  trainings: TrainingRow[];
  loading: boolean;
  viewerRole?: ViewerRole; // default = ADMIN behavior for auth page
}) {
  const { trainings, loading, viewerRole = "ADMIN" } = props;

  const showProof = viewerRole === "ADMIN";

  return (
    <Card className="border-0 shadow-lg w-full xl:max-w-[500px]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Book className="text-blue-600" size={20} />
          <CardTitle>Trainings & Seminars</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading trainings...</div>
        ) : trainings.length === 0 ? (
          <div className="text-sm text-muted-foreground">No trainings found.</div>
        ) : (
          <div className="rounded-md border border-gray-800 bg-gray-900/60 dark:bg-gray-900/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-xs uppercase tracking-wide">Title</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide">Type</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide">Dates</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide">Result</TableHead>
                  {showProof ? (
                    <TableHead className="text-right text-xs uppercase tracking-wide">Proof</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {trainings.map((t) => (
                  <TableRow key={t.attendanceId}>
                    <TableCell className="py-3">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs opacity-70">
                        {t.level ? `${t.level} • ` : ""}
                        {t.sponsor ? t.sponsor : ""}
                        {t.totalHours ? ` • ${t.totalHours} hrs` : ""}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-sm">{t.type || "—"}</TableCell>

                    <TableCell className="py-3 text-sm">
                      {fmtDateRange(t.startDate, t.endDate)}
                    </TableCell>

                    <TableCell className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded border text-xs ${badgeClass(t.status)}`}>
                        {t.status || "—"}
                      </span>
                    </TableCell>

                    <TableCell className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded border text-xs ${badgeClass(t.result ?? "")}`}>
                        {t.result ?? "—"}
                      </span>
                    </TableCell>

                    {showProof ? (
                      <TableCell className="py-3 text-right">
                        {t.proof_url ? (
                          <a
                            href={t.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline text-sm"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-sm opacity-60">—</span>
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
