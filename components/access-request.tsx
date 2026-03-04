"use client";

import { useState, useEffect } from "react";
import UserApprovalGrid, { PendingUser } from "@/components/user-approval-grid";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function AccessRequest() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "rejected">(
        "pending",
    );

    const fetchUsers = async () => {
        setLoading(true);

        const { data: pending, error: pendingError } = await supabase
            .from("User")
            .select("id, email, role, status, created_at")
            .eq("status", "PENDING")
            .order("created_at", { ascending: false });

        if (pendingError) {
            toast.error(
                "Failed to load pending users: " + pendingError.message,
            );
            setPendingUsers([]);
        } else {
            const pendingWithProfiles = await Promise.all(
                (pending ?? []).map(async (u) => {
                    const { data: profile, error: profileError } =
                        await supabase
                            .from("Profile")
                            .select(
                                "firstName, lastName, middleInitial, contactNumber",
                            )
                            .eq("id", u.id)
                            .single();

                    if (profileError)
                        toast.error("profileError: " + profileError.message);
                    return {
                        ...u,
                        createdAt: u.created_at, // normalize for your UI type
                        firstName: profile?.firstName || "",
                        lastName: profile?.lastName || "",
                        middleInitial: profile?.middleInitial || "",
                        contactNumber: profile?.contactNumber || "",
                    };
                }),
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPendingUsers(pendingWithProfiles as any);
        }

        const { data: rejected, error: rejectedError } = await supabase
            .from("User")
            .select("id, email, role, status, created_at")
            .eq("status", "REJECTED")
            .order("created_at", { ascending: false });

        if (rejectedError) {
            toast.error("rejectedError: " + rejectedError.message);
            setRejectedUsers([]);
        } else {
            const rejectedWithProfiles = await Promise.all(
                (rejected ?? []).map(async (u) => {
                    const { data: profile } = await supabase
                        .from("Profile")
                        .select(
                            "firstName, lastName, middleInitial, contactNumber",
                        )
                        .eq("id", u.id)
                        .single();

                    return {
                        ...u,
                        createdAt: u.created_at,
                        firstName: profile?.firstName || "",
                        lastName: profile?.lastName || "",
                        middleInitial: profile?.middleInitial || "",
                        contactNumber: profile?.contactNumber || "",
                    };
                }),
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setRejectedUsers(rejectedWithProfiles as any);
        }

        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers();
    }, []);

    const handleApprove = async (id: string) => {
        const { error } = await supabase
            .from("User")
            .update({ status: "APPROVED" })
            .eq("id", id);

        if (error) {
            toast.error(`Error approving user: ${error.message}`);
            return;
        }

        toast.success("User approved successfully! They can now login.");
        fetchUsers();
    };

    const handleReject = async (id: string) => {
        const confirmed = confirm(
            "Are you sure you want to reject this user? They will be moved to the rejected list.",
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("User")
            .update({ status: "REJECTED" })
            .eq("id", id);

        if (error) {
            toast(`Error rejecting user: ${error.message}`);
            return;
        }

        toast("User rejected and moved to archive.");
        fetchUsers();
    };

    const handlePermanentDelete = async (id: string) => {
        const confirmed = confirm(
            "⚠️ PERMANENT DELETE: This will permanently delete the user from the database. This action CANNOT be undone. Are you sure?",
        );

        if (!confirmed) return;

        const { error: profileError } = await supabase
            .from("Profile")
            .delete()
            .eq("id", id);

        if (profileError) {
            toast(`Error deleting profile: ${profileError.message}`);
            return;
        }

        const { error: userError } = await supabase
            .from("User")
            .delete()
            .eq("id", id);

        if (userError) {
            toast(`Error deleting user: ${userError.message}`);
            return;
        }

        toast("User permanently deleted from database.");
        fetchUsers();
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

                {/* Tab Navigation */}
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
