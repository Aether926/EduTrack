import { useState } from "react";
import { toast } from "sonner";

export function useComplianceReport(schoolYear: string) {
  const [downloading, setDownloading] = useState(false);

  const download = async (type: "teacher" | "admin") => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/compliance-report?type=${type}&school_year=${encodeURIComponent(schoolYear)}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "admin"
        ? `compliance-report-${schoolYear}.xlsx`
        : `my-compliance-${schoolYear}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download compliance report");
    } finally {
      setDownloading(false);
    }
  };

  return { downloading, download };
}