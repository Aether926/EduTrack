import type { ComplianceStatus } from "@/features/compliance/types/compliance";

export const STATUS_LABEL: Record<ComplianceStatus, string> = {
  COMPLIANT: "Compliant",
  AT_RISK: "At Risk",
  NON_COMPLIANT: "Non-Compliant",
};

export const STATUS_BADGE: Record<ComplianceStatus, string> = {
  COMPLIANT: "bg-green-100 text-green-800 border border-green-200",
  AT_RISK: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  NON_COMPLIANT: "bg-red-100 text-red-800 border border-red-200",
};

export const STATUS_CARD: Record<ComplianceStatus, string> = {
  COMPLIANT: "border-green-200 bg-green-50 dark:bg-green-950/20",
  AT_RISK: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20",
  NON_COMPLIANT: "border-red-200 bg-red-50 dark:bg-red-950/20",
};