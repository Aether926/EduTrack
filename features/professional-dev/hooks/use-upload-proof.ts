"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { compressProofFile } from "@/lib/utils/compress-proof";
import { submitAttendanceProof } from "@/app/actions/attendance";

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "something went wrong";
}

export function useUploadProof(attendanceId: string) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!file) return toast.error("please choose a file");

    try {
      setLoading(true);


      const finalFile = await compressProofFile(file);


      if (finalFile.size > 950 * 1024) {
        return toast.error("file is still too large. try a smaller image/pdf.");
      }

      const formData = new FormData();
      formData.append("file", finalFile);

      const res = await submitAttendanceProof(attendanceId, formData);
      if (!res.ok) return toast.error(res.error);

      toast.success("proof submitted");
      router.push("/professional-dev");
      router.refresh();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return { file, setFile, loading, submit };
}
