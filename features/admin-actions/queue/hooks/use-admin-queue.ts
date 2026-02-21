import { useState } from "react";
import { toast } from "sonner";
import {
  approveHRChangeRequest,
  rejectHRChangeRequest,
} from "@/features/admin-actions/queue/actions/queue-actions";

export function useHRQueue() {
  const [loading, setLoading] = useState(false);

  const approve = async (id: string, note?: string) => {
    setLoading(true);
    try {
      await approveHRChangeRequest(id, note);
      toast.success("Request approved.");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to approve.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: string, note?: string) => {
    if (!note?.trim()) {
      toast.info("Please provide a note when rejecting.");
      return false;
    }
    setLoading(true);
    try {
      await rejectHRChangeRequest(id, note);
      toast.success("Request rejected.");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reject.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, approve, reject };
}