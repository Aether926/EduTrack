"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SuperadminUser } from "../types";
import {
    fetchAllUsers,
} from "../actions/fetch-actions";
import {
    superadminApproveUser,
    superadminRejectUser,
    superadminSuspendUser,
    superadminUnsuspendUser,
    superadminDeleteUser,
    changeUserRole,
} from "../actions/superadmin-actions";

export function useSuperadminUsers() {
    const [users, setUsers]     = useState<SuperadminUser[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllUsers();
            setUsers(data);
        } catch {
            toast.error("Failed to load users.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    async function approve(id: string) {
        const res = await superadminApproveUser(id);
        if (!res.ok) { toast.error(res.error); return; }
        toast.success("User approved.");
        refresh();
    }

    async function reject(id: string) {
        const res = await superadminRejectUser(id);
        if (!res.ok) { toast.error(res.error); return; }
        toast.success("User rejected.");
        refresh();
    }

    async function suspend(id: string, reason: string) {
        const res = await superadminSuspendUser(id, reason);
        if (!res.ok) { toast.error(res.error); return; }
        toast.success("User suspended.");
        refresh();
    }

    async function unsuspend(id: string) {
        const res = await superadminUnsuspendUser(id);
        if (!res.ok) { toast.error(res.error); return; }
        toast.success("User unsuspended.");
        refresh();
    }

    async function deleteUser(id: string) {
        const res = await superadminDeleteUser(id);
        if (!res.ok) { toast.error(res.error); return; }
        toast.success("User permanently deleted.");
        refresh();
    }

    async function changeRole(id: string, role: "TEACHER" | "ADMIN" | "SUPERADMIN") {
        const res = await changeUserRole(id, role);
        if (!res.ok) { toast.error(res.error); return; }
        toast.success("Role updated.");
        refresh();
    }

    return {
        users,
        loading,
        refresh,
        approve,
        reject,
        suspend,
        unsuspend,
        deleteUser,
        changeRole,
    };
}