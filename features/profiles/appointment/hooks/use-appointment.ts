import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  submitAppointmentRequest,
  fetchLastAppointmentRequest,
  fetchAppointmentHistory,
} from "@/features/profiles/appointment/actions/appointment-action";
import type {
  AppointmentChangeRequest,
  AppointmentHistory,
  AppointmentRequestForm,
} from "@/features/profiles/appointment/types/appointment";

export function useAppointment(teacherId: string) {
  const [submitting, setSubmitting] = useState(false);
  const [lastRequest, setLastRequest] = useState<AppointmentChangeRequest | null>(null);
  const [history, setHistory] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const hasPendingRequest = lastRequest?.status === "PENDING";

 const loadData = useCallback(async () => {
  if (!teacherId) return;
  setLoading(true);
  const [last, hist] = await Promise.all([
    fetchLastAppointmentRequest(teacherId),
    fetchAppointmentHistory(teacherId),
  ]);
  setLastRequest(last);
  setHistory(hist ?? []);
  setLoading(false);
}, [teacherId]);

    const submitRequest = async (form: AppointmentRequestForm) => {
    if (!form.position.trim()) {
      toast.info("Please select a position.");
      return false;
    }
    if (!form.appointment_type) {
      toast.info("Please select an appointment type.");
      return false;
    }
    if (!form.start_date) {
      toast.info("Please provide a start date.");
      return false;
    }
    if (!form.remarks?.trim()) {
      toast.info("Please provide a reason/remarks.");
      return false;
    }

    setSubmitting(true);
    try {
      await submitAppointmentRequest(teacherId, form);
      toast.success("Appointment request submitted. Awaiting admin approval.");
      await loadData();
      return true;
    } catch (e) {
      toast.error("Having trouble submitting request. Please try again.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    lastRequest,
    history,
    loading,
    hasPendingRequest,
    loadData,
    submitRequest,
  };
}