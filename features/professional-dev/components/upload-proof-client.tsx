"use client";

import { Button } from "@/components/ui/button";
import { useUploadProof } from "@/features/professional-dev/hooks/use-upload-proof";

export default function UploadProofClient({ attendanceId }: { attendanceId: string }) {
  const { file, setFile, loading, submit } = useUploadProof(attendanceId);

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="text-lg font-semibold">Upload certificate / proof</div>

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <Button onClick={() => void submit()} disabled={loading || !file}>
        {loading ? "uploading..." : "Submit proof"}
      </Button>

      <div className="text-xs opacity-70">
        Tip: use screenshot/crop so it stays under 1MB.
      </div>
    </div>
  );
}
