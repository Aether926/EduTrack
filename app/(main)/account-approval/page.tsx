"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, CheckCircle, XCircle, Archive } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface PendingUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleInitial: string;
    contactNumber: string;
    role: string;
    status: string;
    createdAt: string;
}

export default function AccountApproval() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "rejected">("pending");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);

       
        const { data: pending } = await supabase
            .from("User")
            .select(`
                id,
                
                email,
                role,
                status,
                createdAt
            `)
            .eq("status", "PENDING")
            .order("createdAt", { ascending: false });

       
        const { data: rejected } = await supabase
            .from("User")
            .select(`
                id,
                
                email,
                role,
                status,
                createdAt
            `)
            .eq("status", "REJECTED")
            .order("createdAt", { ascending: false });

       
        if (pending) {
            const pendingWithProfiles = await Promise.all(
                pending.map(async (user) => {
                    const { data: profile } = await supabase
                        .from("Profile")
                        .select("firstName, lastName, middleInitial, contactNumber")
                        .eq("id", user.id)
                        .single();

                    return {
                        ...user,
                        firstName: profile?.firstName || "",
                        lastName: profile?.lastName || "",
                        middleInitial: profile?.middleInitial || "",
                        contactNumber: profile?.contactNumber || "",
                    };
                })
            );
            setPendingUsers(pendingWithProfiles);
        }

        if (rejected) {
            const rejectedWithProfiles = await Promise.all(
                rejected.map(async (user) => {
                    const { data: profile } = await supabase
                        .from("Profile")
                        .select("firstName, lastName, middleInitial, contactNumber")
                        .eq("id", user.id)
                        .single();

                    return {
                        ...user,
                        firstName: profile?.firstName || "",
                        lastName: profile?.lastName || "",
                        middleInitial: profile?.middleInitial || "",
                        contactNumber: profile?.contactNumber || "",
                    };
                })
            );
            setRejectedUsers(rejectedWithProfiles);
        }

        setLoading(false);
    };

    const handleApprove = async (id: string) => {
        const { error } = await supabase
            .from("User")
            .update({ status: "APPROVED" })
            .eq("id", id);

        if (error) {
            toast.error(`Error approving user: ${error.message}`);
            return;
        }

        toast.success("User approved successfully.");
        fetchUsers();
    };

    const handleReject = async (id: string) => {
        
        const { error } = await supabase
            .from("User")
            .update({ status: "REJECTED" })
            .eq("id", id);

        if (error) {
            toast.error(`Error rejecting user: ${error.message}`);
            return;
        }

        toast.success("User rejected successfully.");
        fetchUsers();
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
            toast.error(`Error deleting profile: ${profileError.message}`);
            return;
        }

        const { error: userError } = await supabase
            .from("User")
            .delete()
            .eq("id", id);

        if (userError) {
            toast.error(`Error deleting user: ${userError.message}`);
            return;
        }

        toast.success("User permanently deleted."); 
        fetchUsers();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">User Access Requests</h1>
                    <p className="text-gray-600 mt-2">Review and manage user registration requests</p>
                </div>

                {}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${
                            activeTab === "pending"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Pending ({pendingUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("rejected")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${
                            activeTab === "rejected"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Rejected ({rejectedUsers.length})
                    </button>
                </div>

                {}
                {activeTab === "pending" && (
                    <div>
                        {pendingUsers.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-gray-500">
                                    No pending user requests at this time.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {pendingUsers.map((user) => (
                                    <Card key={user.id} className="hover:shadow-lg transition">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="text-blue-600" size={20} />
                                                    {user.firstName} {user.middleInitial && `${user.middleInitial}.`} {user.lastName}
                                                </CardTitle>
                                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                    PENDING
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Mail size={16} className="text-gray-400" />
                                                    <span className="text-sm">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Phone size={16} className="text-gray-400" />
                                                    <span className="text-sm">{user.contactNumber || "N/A"}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <strong>Role:</strong> {user.role}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <strong>Requested:</strong> {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => handleApprove(user.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle size={16} className="mr-2" />
                                                    Approve
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive">
                                                            <XCircle size={16} className="mr-2" />
                                                            Reject
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Reject this user?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This user will be moved to the rejected list. You can still approve them later from the archive.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={() => handleReject(user.id)}
                                                                className="bg-red-200 hover:bg-red-200"
                                                            >
                                                                Reject User
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {}
                {activeTab === "rejected" && (
                    <div>
                        {rejectedUsers.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-gray-500">
                                    No rejected users in archive.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {rejectedUsers.map((user) => (
                                    <Card key={user.id} className="hover:shadow-lg transition border-red-200">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Archive className="text-red-600" size={20} />
                                                    {user.firstName} {user.middleInitial && `${user.middleInitial}.`} {user.lastName}
                                                </CardTitle>
                                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                                    REJECTED
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Mail size={16} className="text-gray-400" />
                                                    <span className="text-sm">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Phone size={16} className="text-gray-400" />
                                                    <span className="text-sm">{user.contactNumber || "N/A"}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <strong>Role:</strong> {user.role}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <strong>Rejected on:</strong> {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => handleApprove(user.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <CheckCircle size={16} className="mr-2" />
                                                    Approve Anyway
                                                </Button>
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button 
                                                            variant="destructive" 
                                                            className="bg-red-700 hover:bg-red-800"
                                                        >
                                                            <XCircle size={16} className="mr-2" />
                                                            Delete Permanently
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>⚠️ Permanently delete user?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-red-600 font-semibold">
                                                                This action CANNOT be undone. This will permanently delete the user and their profile from the database.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={() => handlePermanentDelete(user.id)}
                                                                className="bg-red-700 hover:bg-red-800"
                                                            >
                                                                Yes, Delete Permanently
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}