"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, CheckCircle, XCircle, Archive } from "lucide-react";

export type PendingUser = {
    id: string;
    firstName: string;
    lastName: string;
    middleInitial: string;
    email: string;
    role: string;
    status: string;
    contactNumber: string;
    createdAt: string;
};

interface UserApprovalGridProps {
    users: PendingUser[];
    variant: "pending" | "rejected";
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onDelete?: (id: string) => void;
}

export default function UserApprovalGrid({
    users,
    variant,
    onApprove,
    onReject,
    onDelete,
}: UserApprovalGridProps) {
    if (users.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    {variant === "pending"
                        ? "No pending user requests at this time."
                        : "No rejected users in archive."}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {users.map((user) => (
                <Card
                    key={user.id}
                    className={`hover:shadow-lg transition ${
                        variant === "rejected" ? "border-red-200" : ""
                    }`}
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                {variant === "pending" ? (
                                    <User className="text-blue-600" size={20} />
                                ) : (
                                    <Archive
                                        className="text-red-600"
                                        size={20}
                                    />
                                )}
                                {user.firstName}{" "}
                                {user.middleInitial &&
                                    `${user.middleInitial.replace(/\.+$/, "")}. `}
                                {user.lastName}
                            </CardTitle>
                            <Badge
                                className={
                                    variant === "pending"
                                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                        : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                            >
                                {user.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-foreground">
                                <Mail
                                    min-size={16}
                                    className="text-muted-foreground"
                                />
                                <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground">
                                <Phone
                                    size={16}
                                    className="text-muted-foreground"
                                />
                                <span className="text-sm">
                                    {user.contactNumber || "N/A"}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <strong>Role:</strong> {user.role}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <strong>
                                    {variant === "pending"
                                        ? "Requested:"
                                        : "Rejected on:"}
                                </strong>{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => onApprove(user.id)}
                                className={
                                    variant === "pending"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                }
                            >
                                <CheckCircle size={16} className="mr-2" />
                                {variant === "pending"
                                    ? "Approve"
                                    : "Approve Anyway"}
                            </Button>
                            {variant === "pending" ? (
                                <Button
                                    onClick={() => onReject(user.id)}
                                    variant="destructive"
                                >
                                    <XCircle size={16} className="mr-2" />
                                    Reject
                                </Button>
                            ) : (
                                onDelete && (
                                    <Button
                                        onClick={() => onDelete(user.id)}
                                        variant="destructive"
                                        className="bg-red-700 hover:bg-red-800"
                                    >
                                        <XCircle size={16} className="mr-2" />
                                        Delete Permanently
                                    </Button>
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
