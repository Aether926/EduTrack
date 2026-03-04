import { useState } from "react";
import { toast } from "sonner";

export function useServiceRecord(teacherId: string) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/service-record");
      if (!res.ok) throw new Error("Failed to generate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `service-record-${new Date().getFullYear()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("PDF generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return { generating, generate };
}