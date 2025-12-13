"use client";

import { useState } from "react";
import UserApprovalGrid from "@/components/user-approval-grid";
import { supabase } from "@/lib/supabaseClient";
import { UserWithProfile } from "@/lib/user";

interface Props {
    pendingUsers: UserWithProfile[];
    rejectedUsers: UserWithProfile[];
}

export default function AccessRequest({ pendingUsers, rejectedUsers }: Props) {
    const [activeTab, setActiveTab] = useState<"pending" | "rejected">(
        "pending"
    );

    const handleApprove = async (id: string) => {
        const { error } = await supabase
            .from("User")
            .update({ status: "APPROVED" })
            .eq("id", id);

        if (error) {
            alert(`Error approving user: ${error.message}`);
            return;
        }

        alert("User approved successfully! They can now login.");
    };

    const handleReject = async (id: string) => {
        const confirmed = confirm(
            "Are you sure you want to reject this user? They will be moved to the rejected list."
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("User")
            .update({ status: "REJECTED" })
            .eq("id", id);

        if (error) {
            alert(`Error rejecting user: ${error.message}`);
            return;
        }

        alert("User rejected and moved to archive.");
    };

    const handlePermanentDelete = async (id: string) => {
        const confirmed = confirm(
            "⚠️ PERMANENT DELETE: This will permanently delete the user from the database. This action CANNOT be undone. Are you sure?"
        );

        if (!confirmed) return;

        const { error: profileError } = await supabase
            .from("Profile")
            .delete()
            .eq("id", id);

        if (profileError) {
            alert(`Error deleting profile: ${profileError.message}`);
            return;
        }

        const { error: userError } = await supabase
            .from("User")
            .delete()
            .eq("id", id);

        if (userError) {
            alert(`Error deleting user: ${userError.message}`);
            return;
        }

        alert("User permanently deleted from database.");
    };

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
