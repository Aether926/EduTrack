"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PendingUser } from "../types";
import { approveUser, fetchUsersByStatus, permanentlyDeleteUser, rejectUser } from "../actions/access-request-actions";
import { errMsg } from "../lib/utils";

export function useAccessRequests() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, rejected] = await Promise.all([
        fetchUsersByStatus("PENDING"),
        fetchUsersByStatus("REJECTED"),
      ]);
      setPendingUsers(pending);
      setRejectedUsers(rejected);
    } catch (e) {
      toast.error(errMsg(e));
      setPendingUsers([]);
      setRejectedUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const actions = useMemo(() => {
    return {
      approve: async (id: string) => {
        const res = await approveUser(id);
        if (!res.ok) return toast.error(res.error);
        toast.success("User approved. They can now login.");
        refresh();
      },
      reject: async (id: string) => {
        const res = await rejectUser(id);
        if (!res.ok) return toast.error(res.error);
        toast.success("User rejected and moved to archive.");
        refresh();
      },
      deleteForever: async (id: string) => {
        const res = await permanentlyDeleteUser(id);
        if (!res.ok) return toast.error(res.error);
        toast.success("User permanently deleted.");
        refresh();
      },
    };
  }, [refresh]);

  return { pendingUsers, rejectedUsers, loading, refresh, ...actions };
}