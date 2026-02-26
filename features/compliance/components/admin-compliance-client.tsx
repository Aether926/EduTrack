"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Loader2,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  recomputeAllCompliance,
  upsertCompliancePolicy,
} from "@/features/compliance/actions/admin-compliance-actions";
import { STATUS_LABEL, STATUS_BADGE } from "@/features/compliance/lib/status";
import type {
  ComplianceWithTeacher,
  TrainingCompliancePolicy,
  ComplianceStatus,
} from "@/features/compliance/types/compliance";

import { useComplianceReport } from "@/features/compliance/hooks/use-compliance-report";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

// ✅ shadcn SelectItem can't use empty string value
const ALL_STATUS = "__ALL_STATUS__";
const ALL_SCHOOLS = "__ALL_SCHOOLS__";

export function AdminComplianceClient(props: {
  compliance: ComplianceWithTeacher[];
  policies: TrainingCompliancePolicy[];
  schools: { id: string; name: string }[];
  schoolYear: string;
}) {
  const { compliance, policies, schools, schoolYear } = props;
  const router = useRouter();

  const [policyOpen, setPolicyOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<TrainingCompliancePolicy | null>(null);

  // store "" for "all" internally, but Select uses sentinel values
  const [filterStatus, setFilterStatus] = useState<string>(""); // "" = all
  const [filterSchool, setFilterSchool] = useState<string>(""); // "" = all

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const { downloading, download } = useComplianceReport(schoolYear);

  const [policyForm, setPolicyForm] = useState({
    school_id: "",
    school_year: schoolYear,
    required_hours: "40",
    at_risk_threshold_hours: "10",
    period_start: "",
    period_end: "",
  });

  const counts = {
    NON_COMPLIANT: compliance.filter((c) => c.status === "NON_COMPLIANT").length,
    AT_RISK: compliance.filter((c) => c.status === "AT_RISK").length,
    COMPLIANT: compliance.filter((c) => c.status === "COMPLIANT").length,
  };

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    return [...compliance]
      .filter((c: any) => {
        const matchStatus = filterStatus ? c.status === filterStatus : true;
        const matchSchool = filterSchool ? c.school_id === filterSchool : true;

        if (!q) return matchStatus && matchSchool;

        const name = `${c.teacher?.firstName ?? ""} ${c.teacher?.lastName ?? ""}`.toLowerCase();
        const email = String(c.teacher?.email ?? "").toLowerCase();
        const school = String(c.school?.name ?? "").toLowerCase();

        return (
          matchStatus &&
          matchSchool &&
          (name.includes(q) || email.includes(q) || school.includes(q))
        );
      })
      .sort(
        (a: any, b: any) =>
          STATUS_ORDER[a.status as ComplianceStatus] - STATUS_ORDER[b.status as ComplianceStatus]
      );
  }, [compliance, filterStatus, filterSchool, query]);

  const handleSavePolicy = async () => {
    if (!policyForm.period_start || !policyForm.period_end) {
      toast.info("Please fill in all required fields.");
      return;
    }

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
      setEditingPolicy(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await recomputeAllCompliance();
      toast.success("Compliance recalculated.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to recalculate.");
    } finally {
      setRecalculating(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterSchool("");
    setQuery("");
  };

  return (
    <div className="space-y-4">
      {/* toolbar card */}
      <Card>
        <CardContent className="p-4 md:p-6 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                <ShieldX className="h-3.5 w-3.5" />
                {counts.NON_COMPLIANT} non-compliant
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <ShieldAlert className="h-3.5 w-3.5" />
                {counts.AT_RISK} at risk
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                {counts.COMPLIANT} compliant
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Button
                variant="outline"
                onClick={() => download("admin")}
                disabled={downloading}
                className="gap-2"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Report
              </Button>

              <Button
                variant="outline"
                onClick={handleRecalculate}
                disabled={recalculating}
                className="gap-2"
              >
                {recalculating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Recalculate
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setPolicyOpen(true)}
              >
                <Settings className="h-4 w-4" />
                Manage Policy
              </Button>
            </div>
          </div>

          {/* filters + search */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={filterStatus ? filterStatus : ALL_STATUS}
                onValueChange={(v) => setFilterStatus(v === ALL_STATUS ? "" : v)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUS}>All statuses</SelectItem>
                  <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
                  <SelectItem value="AT_RISK">At Risk</SelectItem>
                  <SelectItem value="COMPLIANT">Compliant</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterSchool ? filterSchool : ALL_SCHOOLS}
                onValueChange={(v) => setFilterSchool(v === ALL_SCHOOLS ? "" : v)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SCHOOLS}>All schools</SelectItem>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* desktop search */}
            <div className="hidden md:block w-[360px]">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teacher, email, school..."
              />
            </div>

            {/* mobile search toggle */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                {searchOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>

              <AnimatePresence initial={false}>
                {searchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "240px", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="h-9"
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {(filterStatus || filterSchool || query) ? (
            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
              <span className="text-xs text-muted-foreground">
                {sorted.length} of {compliance.length} teachers
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              {sorted.length} teachers
            </span>
          )}
        </CardContent>
      </Card>

      {/* table card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance list</CardTitle>
          <CardDescription>
            Sorted by risk (non-compliant → compliant).
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="hidden md:table-cell">School</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Total</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Required</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Remaining</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Status</TableHead>
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
                  sorted.map((c: any, idx: number) => (
                    <motion.tr
                      key={c.teacher_id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, delay: Math.min(idx * 0.01, 0.15) }}
                      className="border-b last:border-b-0 hover:bg-accent/40"
                    >
                      <TableCell>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {c.teacher
                              ? `${c.teacher.firstName} ${c.teacher.lastName}`
                              : "Unknown"}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {c.teacher?.email ?? "—"}
                          </div>

                          {/* mobile meta */}
                          <div className="md:hidden mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{c.school?.name ?? "—"}</span>
                            <span className="font-mono">
                              {c.total_hours}h / {c.required_hours}h
                            </span>
                            <span
                              className={
                                c.remaining_hours > 0
                                  ? "text-red-600 font-medium"
                                  : "text-green-600 font-medium"
                              }
                            >
                              {c.remaining_hours}h remaining
                            </span>
                            <span className="flex items-center gap-1">
                              {STATUS_ICON[c.status as ComplianceStatus]}
                              <Badge className={STATUS_BADGE[c.status as ComplianceStatus]}>
                                {STATUS_LABEL[c.status as ComplianceStatus]}
                              </Badge>
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {c.school?.name ?? "—"}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-center font-medium">
                        {c.total_hours}h
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-center text-muted-foreground">
                        {c.required_hours}h
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-center">
                        <span
                          className={
                            c.remaining_hours > 0
                              ? "text-red-600 font-medium"
                              : "text-green-600 font-medium"
                          }
                        >
                          {c.remaining_hours}h
                        </span>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {STATUS_ICON[c.status as ComplianceStatus]}
                          <Badge className={STATUS_BADGE[c.status as ComplianceStatus]}>
                            {STATUS_LABEL[c.status as ComplianceStatus]}
                          </Badge>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* policy dialog */}
      <Dialog
        open={policyOpen}
        onOpenChange={(open) => {
          setPolicyOpen(open);
          if (!open) setEditingPolicy(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? "Edit Compliance Policy" : "New Compliance Policy"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {policies.length > 0 && !editingPolicy ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Existing Policies
                </Label>

                {policies.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.school_year}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.required_hours}h required • {p.at_risk_threshold_hours}h threshold
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
            ) : null}

            <div className="space-y-1.5">
              <Label>School Year</Label>
              <Input
                value={policyForm.school_year}
                onChange={(e) =>
                  setPolicyForm((f) => ({ ...f, school_year: e.target.value }))
                }
                placeholder="e.g. SY 2025-2026"
                disabled={!!editingPolicy}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Required Hours</Label>
                <Input
                  type="number"
                  value={policyForm.required_hours}
                  onChange={(e) =>
                    setPolicyForm((f) => ({ ...f, required_hours: e.target.value }))
                  }
                  disabled={!!editingPolicy}
                />
              </div>
              <div className="space-y-1.5">
                <Label>At-Risk Threshold (hrs)</Label>
                <Input
                  type="number"
                  value={policyForm.at_risk_threshold_hours}
                  onChange={(e) =>
                    setPolicyForm((f) => ({
                      ...f,
                      at_risk_threshold_hours: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Period Start</Label>
                <Input
                  type="date"
                  value={policyForm.period_start}
                  onChange={(e) =>
                    setPolicyForm((f) => ({ ...f, period_start: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Period End</Label>
                <Input
                  type="date"
                  value={policyForm.period_end}
                  onChange={(e) =>
                    setPolicyForm((f) => ({ ...f, period_end: e.target.value }))
                  }
                  min={policyForm.period_start || undefined}
                />
              </div>
            </div>

            {!editingPolicy ? (
              <div className="space-y-1.5">
                <Label>School (leave empty for global policy)</Label>
                <Select
                  value={policyForm.school_id || "global"}
                  onValueChange={(v) =>
                    setPolicyForm((f) => ({ ...f, school_id: v === "global" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Global (all schools)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (all schools)</SelectItem>
                    {schools.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPolicyOpen(false);
                setEditingPolicy(null);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} disabled={submitting}>
              {submitting ? "Saving..." : editingPolicy ? "Update Policy" : "Save Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}