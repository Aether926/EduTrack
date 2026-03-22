"use client";

import { useState, useEffect } from "react";
import UserApprovalGrid, { PendingUser } from "@/components/user-approval-grid";
import {
    fetchUsersByStatus,
    approveUser,
    rejectUser,
    permanentlyDeleteUser,
} from "@/features/account-approval/actions/access-request-actions";
import { toast } from "sonner";

async function loadUsers() {
    const [pending, rejected] = await Promise.all([
        fetchUsersByStatus("PENDING"),
        fetchUsersByStatus("REJECTED"),
    ]);
    return { pending, rejected };
}

export default function AccessRequest() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "rejected">("pending");

    useEffect(() => {
        const init = async () => {
            const { pending, rejected } = await loadUsers();
            setPendingUsers(pending as PendingUser[]);
            setRejectedUsers(rejected as PendingUser[]);
            setLoading(false);
        };
        void init();
    }, []);

    const refetch = async () => {
        const { pending, rejected } = await loadUsers();
        setPendingUsers(pending as PendingUser[]);
        setRejectedUsers(rejected as PendingUser[]);
    };

    const handleApprove = async (id: string) => {
        const result = await approveUser(id);
        if (!result.ok) { toast.error(`Error approving user: ${result.error}`); return; }
        toast.success("User approved successfully! They can now login.");
        void refetch();
    };

    const handleReject = async (id: string) => {
        const confirmed = confirm("Are you sure you want to reject this user? They will be moved to the rejected list.");
        if (!confirmed) return;
        const result = await rejectUser(id);
        if (!result.ok) { toast.error(`Error rejecting user: ${result.error}`); return; }
        toast("User rejected and moved to archive.");
        void refetch();
    };

    const handlePermanentDelete = async (id: string) => {
        const confirmed = confirm("⚠️ PERMANENT DELETE: This will permanently delete the user from the database. This action CANNOT be undone. Are you sure?");
        if (!confirmed) return;
        const result = await permanentlyDeleteUser(id);
        if (!result.ok) { toast.error(`Error deleting user: ${result.error}`); return; }
        toast("User permanently deleted from database.");
        void refetch();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">User Access Requests</h1>
                    <p className="text-muted-foreground mt-2">
                        Review and manage user registration requests
                    </p>
                </div>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${
                            activeTab === "pending"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-card-foreground hover:bg-accent"
                        }`}
                    >
                        Pending ({pendingUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("rejected")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${
                            activeTab === "rejected"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-card-foreground hover:bg-accent"
                        }`}
                    >
                        Rejected ({rejectedUsers.length})
                    </button>
                </div>

                {activeTab === "pending" && (
                    <UserApprovalGrid
                        users={pendingUsers}
                        variant="pending"
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
                {activeTab === "rejected" && (
                    <UserApprovalGrid
                        users={rejectedUsers}
                        variant="rejected"
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDelete={handlePermanentDelete}
                    />
                )}
            </div>
        </div>
    );
}