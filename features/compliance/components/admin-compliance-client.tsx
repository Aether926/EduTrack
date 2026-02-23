"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Settings, ShieldCheck, ShieldAlert, ShieldX, RefreshCw, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { recomputeAllCompliance, upsertCompliancePolicy } from "@/features/compliance/actions/admin-compliance-actions";
import { STATUS_LABEL, STATUS_BADGE } from "@/features/compliance/lib/status";
import type { ComplianceWithTeacher, TrainingCompliancePolicy, ComplianceStatus } from "@/features/compliance/types/compliance";
import { useComplianceReport } from "../hooks/use-compliance-report";


const STATUS_ICON: Record<ComplianceStatus, React.ReactNode> = {
  COMPLIANT: <ShieldCheck className="h-4 w-4 text-green-600" />,
  AT_RISK: <ShieldAlert className="h-4 w-4 text-yellow-600" />,
  NON_COMPLIANT: <ShieldX className="h-4 w-4 text-red-600" />,
};

const STATUS_ORDER: Record<ComplianceStatus, number> = {
  NON_COMPLIANT: 0,
  AT_RISK: 1,
  COMPLIANT: 2,
};

export function AdminComplianceClient(props: {
  compliance: ComplianceWithTeacher[];
  policies: TrainingCompliancePolicy[];
  schools: { id: string; name: string }[];
  schoolYear: string;
}) {
  const { compliance, policies, schools, schoolYear } = props;
  const router = useRouter();
  const [policyOpen, setPolicyOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [policyForm, setPolicyForm] = useState({
    school_id: "",
    school_year: schoolYear,
    required_hours: "40",
    at_risk_threshold_hours: "10",
    period_start: "",
    period_end: "",
  });

  const sorted = [...compliance]
    .filter((c) => {
      const matchStatus = filterStatus ? c.status === filterStatus : true;
      const matchSchool = filterSchool ? c.school_id === filterSchool : true;
      return matchStatus && matchSchool;
    })
    .sort((a, b) =>
      STATUS_ORDER[a.status as ComplianceStatus] - STATUS_ORDER[b.status as ComplianceStatus]
    );

  const counts = {
    NON_COMPLIANT: compliance.filter((c) => c.status === "NON_COMPLIANT").length,
    AT_RISK: compliance.filter((c) => c.status === "AT_RISK").length,
    COMPLIANT: compliance.filter((c) => c.status === "COMPLIANT").length,
  };
  const [editingPolicy, setEditingPolicy] = useState<TrainingCompliancePolicy | null>(null);


  const handleSavePolicy = async () => {
    if (!policyForm.period_start || !policyForm.period_end)
      return toast.info("Please fill in all required fields.");

    setSubmitting(true);
    try {
      await upsertCompliancePolicy({
        school_id: policyForm.school_id || null,
        school_year: policyForm.school_year,
        required_hours: Number(policyForm.required_hours),
        at_risk_threshold_hours: Number(policyForm.at_risk_threshold_hours),
        period_start: policyForm.period_start,
        period_end: policyForm.period_end,
        is_edit: !!editingPolicy,
      });
      toast.success("Policy saved.");
      setPolicyOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };
  const [recalculating, setRecalculating] = useState(false);

  const handleRecalculate = async () => {
  setRecalculating(true);
  try {
    await recomputeAllCompliance();
    toast.success("Compliance recalculated.");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1s
    window.location.reload();
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to recalculate.");
    toast.error("recompute error");
  } finally {
    setRecalculating(false);
  }
};
const { downloading, download } = useComplianceReport(schoolYear);


  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <Button
          variant="outline"
          onClick={() => download("admin")}
          disabled={downloading}
          className="flex items-center gap-2"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Report
        </Button>
          <Button
          variant="outline"
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2"
        >
          {recalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Recalculate
        </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Training Compliance
            </h1>
            <p className="text-sm text-muted-foreground">{schoolYear}</p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setPolicyOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Manage Policy
          </Button>
        </header>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-red-700">{counts.NON_COMPLIANT}</p>
              <p className="text-xs text-red-600 mt-1 font-medium">Non-Compliant</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{counts.AT_RISK}</p>
              <p className="text-xs text-yellow-600 mt-1 font-medium">At Risk</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-700">{counts.COMPLIANT}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">Compliant</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
              <SelectItem value="AT_RISK">At Risk</SelectItem>
              <SelectItem value="COMPLIANT">Compliant</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSchool} onValueChange={setFilterSchool}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All schools</SelectItem>
              {schools.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterStatus || filterSchool) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterStatus(""); setFilterSchool(""); }}>
              Clear filters
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {sorted.length} of {compliance.length} teachers
          </span>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead className="text-center">Total Hours</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  <TableHead className="text-center">Remaining</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No compliance records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((c) => (
                    <TableRow key={c.teacher_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.teacher?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.school?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-center font-medium">{c.total_hours}h</TableCell>
                      <TableCell className="text-center text-muted-foreground">{c.required_hours}h</TableCell>
                      <TableCell className="text-center">
                        <span className={c.remaining_hours > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                          {c.remaining_hours}h
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {STATUS_ICON[c.status as ComplianceStatus]}
                          <Badge className={STATUS_BADGE[c.status as ComplianceStatus]}>
                            {STATUS_LABEL[c.status as ComplianceStatus]}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={policyOpen} onOpenChange={(open) => {
  setPolicyOpen(open);
  if (!open) setEditingPolicy(null);
}}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>
        {editingPolicy ? "Edit Compliance Policy" : "New Compliance Policy"}
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4 py-2">

      {/* existing policies list */}
      {policies.length > 0 && !editingPolicy && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Existing Policies
          </Label>
          {policies.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="text-sm font-medium">{p.school_year}</p>
                <p className="text-xs text-muted-foreground">
                  {p.required_hours}h required • {p.at_risk_threshold_hours}h at-risk threshold
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.period_start} → {p.period_end}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPolicy(p);
                  setPolicyForm({
                    school_id: p.school_id ?? "",
                    school_year: p.school_year,
                    required_hours: String(p.required_hours),
                    at_risk_threshold_hours: String(p.at_risk_threshold_hours),
                    period_start: p.period_start,
                    period_end: p.period_end,
                  });
                }}
              >
                Edit
              </Button>
            </div>
          ))}
          <div className="border-t border-border pt-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Add New Policy
            </Label>
          </div>
        </div>
      )}

      {/* warning when editing */}
      {editingPolicy && (
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800">
          ⚠️ Changing period dates or threshold will recompute all teachers compliance immediately.
          Required hours cannot be changed after a policy is active.
        </div>
      )}

      {/* school year — readonly when editing */}
      <div className="space-y-1.5">
        <Label>School Year</Label>
        <Input
          value={policyForm.school_year}
          onChange={(e) => setPolicyForm((f) => ({ ...f, school_year: e.target.value }))}
          placeholder="e.g. SY 2025-2026"
          disabled={!!editingPolicy} // ← locked when editing
        />
        {editingPolicy && (
          <p className="text-xs text-muted-foreground">School year cannot be changed.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Required Hours</Label>
          <Input
            type="number"
            value={policyForm.required_hours}
            onChange={(e) => setPolicyForm((f) => ({ ...f, required_hours: e.target.value }))}
            disabled={!!editingPolicy} // ← locked when editing
          />
          {editingPolicy && (
            <p className="text-xs text-muted-foreground">Cannot change after activation.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>At-Risk Threshold (hrs)</Label>
          <Input
            type="number"
            value={policyForm.at_risk_threshold_hours}
            onChange={(e) => setPolicyForm((f) => ({ ...f, at_risk_threshold_hours: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Period Start</Label>
          <Input
            type="date"
            value={policyForm.period_start}
            onChange={(e) => setPolicyForm((f) => ({ ...f, period_start: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Period End</Label>
          <Input
            type="date"
            value={policyForm.period_end}
            onChange={(e) => setPolicyForm((f) => ({ ...f, period_end: e.target.value }))}
            min={policyForm.period_start || undefined}
          />
        </div>
      </div>

      {/* school selector — only for new policies */}
      {!editingPolicy && (
        <div className="space-y-1.5">
          <Label>School (leave empty for global policy)</Label>
          <Select
            value={policyForm.school_id || "global"}
            onValueChange={(v) => setPolicyForm((f) => ({ ...f, school_id: v === "global" ? "" : v }))}
          >
            <SelectTrigger><SelectValue placeholder="Global (all schools)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global (all schools)</SelectItem>
              {schools.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => {
        setPolicyOpen(false);
        setEditingPolicy(null);
      }} disabled={submitting}>
        Cancel
      </Button>
      <Button onClick={handleSavePolicy} disabled={submitting}>
        {submitting ? "Saving..." : editingPolicy ? "Update Policy" : "Save Policy"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </main>
  );
}