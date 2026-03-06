/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cell, Label, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Users, ClipboardCheck, FileText, UserCheck, ArrowRight,
  ShieldAlert, FileClock, TrendingUp,
  CheckCircle2, Clock, XCircle, AlertTriangle,
} from "lucide-react";

import type { AdminDashboardStats } from "@/lib/database/admin-dashboard";
import type { TeacherEligibilityRow } from "@/lib/database/salary-eligibility";
import type { AdminCalendarEvent } from "@/lib/database/calendar";
import ActivityFeed from "@/features/dashboard/component/activity-feed";
import TrainingHoursChart from "@/features/dashboard/component/training-hours-chart";
import AdminTrainingCalendar from "@/features/dashboard/component/admin-training-calendar";

type DonutSlice = { name: string; value: number; color: string };

// ── Compliance Card ────────────────────────────────────────────────────────────
function ComplianceCard({ slices, total, viewHref }: { slices: DonutSlice[]; total: number; viewHref: string }) {
  const config = Object.fromEntries(slices.map((s) => [s.name, { label: s.name, color: s.color }])) as ChartConfig;
  const data = slices.map((s) => ({ ...s, fill: s.color }));
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
  const compliantPct = pct(slices[0]?.value ?? 0);

  return (
    <Card className="bg-card/80 border-border/50 h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          Training Compliance
        </CardTitle>
        <CardDescription className="text-sm">Status across all teachers</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <ChartContainer config={config} className="h-[130px] w-[130px]">
              <PieChart>
                <ChartTooltip cursor={false} content={
                  <ChartTooltipContent hideLabel formatter={(value, name) => (
                    <span style={{ color: config[name]?.color ?? "#fff", fontWeight: 600 }}>
                      {name}: {value} ({pct(Number(value))}%)
                    </span>
                  )} />
                } />
                <Pie data={data.filter(d => d.value > 0)} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={46} outerRadius={58}
                  paddingAngle={2} startAngle={90} endAngle={-270} strokeWidth={0}>
                  {data.filter(d => d.value > 0).map((d, i) => <Cell key={i} fill={d.color} />)}
                  <Label content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox)) return null;
                    const { cx, cy } = viewBox as { cx: number; cy: number };
                    return (
                      <g>
                        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
                          className="fill-emerald-500 dark:fill-emerald-400"
                          style={{ fontSize: 22, fontWeight: 800 }}>{compliantPct}%</text>
                        <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
                          className="fill-muted-foreground" style={{ fontSize: 10 }}>compliant</text>
                      </g>
                    );
                  }} />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            {slices.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/70">{d.name}</span>
                  <span className="font-semibold tabular-nums" style={{ color: d.color }}>
                    {d.value} <span className="text-muted-foreground/50 font-normal">{pct(d.value)}%</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct(d.value)}%`, background: d.color }} />
                </div>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full justify-between mt-2">
              <Link href={viewHref}>View report <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Document Card ──────────────────────────────────────────────────────────────
function DocumentCard({ slices, total, viewHref }: { slices: DonutSlice[]; total: number; viewHref: string }) {
  const config = Object.fromEntries(slices.map((s) => [s.name, { label: s.name, color: s.color }])) as ChartConfig;
  const data = slices.map((s) => ({ ...s, fill: s.color }));
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
  const icons: Record<string, React.ElementType> = {
    Approved: CheckCircle2, Pending: Clock, Rejected: XCircle, Missing: AlertTriangle,
  };

  return (
    <Card className="bg-card/80 border-border/50 h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-sky-400" />
          Document Status
        </CardTitle>
        <CardDescription className="text-sm">Required docs across all teachers</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="flex items-center gap-4">
          <ChartContainer config={config} className="h-[130px] w-[130px] shrink-0">
            <PieChart>
              <ChartTooltip cursor={false} content={
                <ChartTooltipContent hideLabel formatter={(value, name) => (
                  <span style={{ color: config[name]?.color ?? "#fff", fontWeight: 600 }}>
                    {name}: {value} ({pct(Number(value))}%)
                  </span>
                )} />
              } />
              <Pie data={data.filter(d => d.value > 0)} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={36} outerRadius={58}
                paddingAngle={3} startAngle={90} endAngle={-270} strokeWidth={0}>
                {data.filter(d => d.value > 0).map((d, i) => <Cell key={i} fill={d.color} />)}
                <Label content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox)) return null;
                  const { cx, cy } = viewBox as { cx: number; cy: number };
                  return (
                    <g>
                      <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="middle"
                        className="fill-foreground" style={{ fontSize: 20, fontWeight: 700 }}>{total}</text>
                      <text x={cx} y={cy + 11} textAnchor="middle" dominantBaseline="middle"
                        className="fill-muted-foreground" style={{ fontSize: 10 }}>total</text>
                    </g>
                  );
                }} />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex-1 min-w-0 space-y-2">
            {slices.map((d) => {
              const Icon = icons[d.name] ?? FileText;
              return (
                <div key={d.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: d.color }} />
                    <span className="text-xs text-foreground/70 truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                    <span className="text-sm font-semibold text-foreground">{d.value}</span>
                    <span className="text-xs text-muted-foreground/50 w-7 text-right">{pct(d.value)}%</span>
                  </div>
                </div>
              );
            })}
            <Button asChild variant="outline" size="sm" className="w-full justify-between mt-1">
              <Link href={viewHref}>View docs <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Salary Card ────────────────────────────────────────────────────────────────
function SalaryCard({ slices, total, eligibleCount, viewHref }: { slices: DonutSlice[]; total: number; eligibleCount: number; viewHref: string }) {
  const config = Object.fromEntries(slices.map((s) => [s.name, { label: s.name, color: s.color }])) as ChartConfig;
  const data = slices.map((s) => ({ ...s, fill: s.color }));
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

  return (
    <Card className="bg-card/80 border-border/50 h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Salary Eligibility
        </CardTitle>
        <CardDescription className="text-sm">Step increment status</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="flex items-center gap-4">
          <div className="shrink-0 relative">
            <ChartContainer config={config} className="h-[130px] w-[130px]">
              <PieChart>
                <ChartTooltip cursor={false} content={
                  <ChartTooltipContent hideLabel formatter={(value, name) => (
                    <span style={{ color: config[name]?.color ?? "#fff", fontWeight: 600 }}>
                      {name}: {value} ({pct(Number(value))}%)
                    </span>
                  )} />
                } />
                <Pie data={[{ value: 1, fill: "hsl(var(--muted)/0.3)" }]} dataKey="value"
                  cx="50%" cy="70%" innerRadius={44} outerRadius={58}
                  startAngle={180} endAngle={0} strokeWidth={0} isAnimationActive={false}>
                  <Cell fill="hsl(var(--muted)/0.2)" />
                </Pie>
                <Pie data={data.filter(d => d.value > 0)} dataKey="value" nameKey="name"
                  cx="50%" cy="70%" innerRadius={44} outerRadius={58}
                  paddingAngle={2} startAngle={180} endAngle={0} strokeWidth={0}>
                  {data.filter(d => d.value > 0).map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <div className="text-xl font-bold text-emerald-400 tabular-nums">{eligibleCount}</div>
              <div className="text-[10px] text-muted-foreground">eligible</div>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2.5">
            {slices.map((d) => (
              <div key={d.name} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-foreground/70 truncate text-xs">{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                  <span className="font-semibold text-foreground">{d.value}</span>
                  <span className="text-muted-foreground/50 text-xs w-7 text-right">{pct(d.value)}%</span>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full justify-between mt-1">
              <Link href={viewHref}>View list <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ title, value, desc, icon: Icon, accent, href }: {
  title: string; value: number; desc: string;
  icon: React.ElementType;
  accent: "blue" | "violet" | "emerald" | "amber" | "rose" | "sky";
  href?: string;
}) {
  const styles = {
    blue:    { border: "border-blue-500/20",    iconWrap: "bg-blue-500/10 text-blue-400",       num: "text-blue-400"    },
    violet:  { border: "border-violet-500/20",  iconWrap: "bg-violet-500/10 text-violet-400",   num: "text-violet-400"  },
    emerald: { border: "border-emerald-500/20", iconWrap: "bg-emerald-500/10 text-emerald-400", num: "text-emerald-400" },
    amber:   { border: "border-amber-500/20",   iconWrap: "bg-amber-500/10 text-amber-400",     num: "text-amber-400"   },
    rose:    { border: "border-rose-500/20",    iconWrap: "bg-rose-500/10 text-rose-400",       num: "text-rose-400"    },
    sky:     { border: "border-sky-500/20",     iconWrap: "bg-sky-500/10 text-sky-400",         num: "text-sky-400"     },
  } as const;
  const s = styles[accent];
  const inner = (
    <Card className={`border ${s.border} bg-card/80 overflow-hidden transition-all duration-200 ${href ? "hover:bg-accent/30 cursor-pointer" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-xl p-2.5 ${s.iconWrap}`}><Icon className="h-5 w-5" /></div>
          {href && <ArrowRight className="h-4 w-4 text-muted-foreground/40" />}
        </div>
        <div className={`text-3xl font-bold tabular-nums tracking-tight mb-1 ${s.num}`}>{value}</div>
        <div className="text-sm font-medium text-foreground/80">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block group">{inner}</Link> : inner;
}

// ── Main ───────────────────────────────────────────────────────────────────────
type Props = {
  role: string | null;
  viewerId: string;
  adminStats: AdminDashboardStats;
  activity: any[];
  eligibilityData: TeacherEligibilityRow[];
  eligibilityCount: number;
  adminEvents: AdminCalendarEvent[];
};

export default function AdminDashboardView({
  role, viewerId, adminStats, activity, eligibilityData, eligibilityCount, adminEvents,
}: Props) {
  const {
    totalTeachers, pendingProofs, pendingHRRequests,
    pendingDocuments, pendingAccountApprovals,
    complianceBreakdown, documentBreakdown, trainingHoursPerMonth,
  } = adminStats;

  const totalCompliance = complianceBreakdown.compliant + complianceBreakdown.atRisk + complianceBreakdown.nonCompliant;
  const totalDocs = documentBreakdown.approved + documentBreakdown.pending + documentBreakdown.rejected + documentBreakdown.missing;

  const COMPLIANCE_DATA: DonutSlice[] = [
    { name: "Compliant",     value: complianceBreakdown.compliant,    color: "#10b981" },
    { name: "At Risk",       value: complianceBreakdown.atRisk,       color: "#f59e0b" },
    { name: "Non-Compliant", value: complianceBreakdown.nonCompliant, color: "#ef4444" },
  ];

  const DOC_DATA: DonutSlice[] = [
    { name: "Approved", value: documentBreakdown.approved, color: "#10b981" },
    { name: "Pending",  value: documentBreakdown.pending,  color: "#3b82f6" },
    { name: "Rejected", value: documentBreakdown.rejected, color: "#ef4444" },
    { name: "Missing",  value: documentBreakdown.missing,  color: "#f59e0b" },
  ];

  const eligibleCount    = eligibilityData.filter((r) => r.status === "ELIGIBLE").length;
  const approachingCount = eligibilityData.filter((r) => r.status === "APPROACHING").length;
  const notYet           = Math.max(totalTeachers - eligibleCount - approachingCount, 0);

  const SALARY_DATA: DonutSlice[] = [
    { name: "Eligible",    value: eligibleCount,    color: "#10b981" },
    { name: "Approaching", value: approachingCount, color: "#f59e0b" },
    { name: "On track",     value: notYet,           color: "#06b6d4" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">

      {/* ── Stat cards ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Teachers"       value={totalTeachers}           desc="Approved accounts"  icon={Users}          accent="blue"   />
        <StatCard title="Pending Proofs" value={pendingProofs}           desc="Awaiting review"    icon={ClipboardCheck} accent="amber"  href="/proof-review"       />
        <StatCard title="HR Requests"    value={pendingHRRequests}       desc="Change requests"    icon={FileClock}      accent="violet" href="/admin-actions/queue" />
        <StatCard title="Documents"      value={pendingDocuments}        desc="Pending submission" icon={FileText}       accent="sky"    href="/admin-actions"       />
        <StatCard title="New Accounts"   value={pendingAccountApprovals} desc="Need approval"      icon={UserCheck}      accent="rose"   href="/account-approval"    />
      </motion.div>

      {/* ── Bar chart + placeholder ── */}
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.06 }}>
          <TrainingHoursChart trainingHoursPerMonth={trainingHoursPerMonth} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.09 }}>
          <Card className="h-full bg-card/80 border-border/50 border-dashed flex items-center justify-center min-h-[220px]">
            <p className="text-sm text-muted-foreground/40">Coming soon</p>
          </Card>
        </motion.div>
      </div>

      {/* ── Insight cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.12 }}>
          <ComplianceCard slices={COMPLIANCE_DATA} total={totalCompliance} viewHref="/admin-actions/compliance" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.15 }}>
          <DocumentCard slices={DOC_DATA} total={totalDocs} viewHref="/admin-actions/documents" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.18 }}>
          <SalaryCard slices={SALARY_DATA} total={totalTeachers} eligibleCount={eligibleCount} viewHref="/admin-actions/salary-increase-eligibility" />
        </motion.div>
      </div>

      {/* ── Admin training calendar ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.20 }}>
        <AdminTrainingCalendar events={adminEvents} />
      </motion.div>

      {/* ── Activity feed ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.24 }}>
        <ActivityFeed rows={activity} role={role} viewerId={viewerId} />
      </motion.div>
    </div>
  );
}