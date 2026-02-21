import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { submitHRChangeRequest } from "@/features/profiles/actions/employment-info-action";
import type { HRChangeRequestPayload, ProfileHRChangeRequest } from "@/features/profiles/types/employment-info";

export function useEmploymentHR(teacherId: string) {
  const [submitting, setSubmitting] = useState(false);
  const [lastRequest, setLastRequest] = useState<ProfileHRChangeRequest | null>(null);
  const [loadingLastRequest, setLoadingLastRequest] = useState(false);

  const hasPendingRequest = lastRequest?.status === "PENDING";

  const fetchLastRequest = useCallback(async () => {
    setLoadingLastRequest(true);
    const { data, error } = await supabase
      .from("ProfileHRChangeRequest")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("requested_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) setLastRequest(data as ProfileHRChangeRequest);
    setLoadingLastRequest(false);
  }, [teacherId]);

  const submitRequest = async (payload: HRChangeRequestPayload) => {
    if (!payload.reason?.trim()) {
      toast.info("Please provide a reason for the change request.");
      return false;
    }

    setSubmitting(true);
    try {
      await submitHRChangeRequest(teacherId, payload);
      toast.success("Change request submitted. Awaiting admin approval.");
      await fetchLastRequest();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    lastRequest,
    loadingLastRequest,
    hasPendingRequest,
    fetchLastRequest,
    submitRequest,
  };
}