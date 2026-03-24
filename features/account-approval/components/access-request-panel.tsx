"use client";

import { useMemo, useState } from "react";
import { useAccessRequests } from "@/features/account-approval/hooks/use-access-request";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

import UserApprovalTable from "@/features/account-approval/components/user-approval-table";

const TABS = ["PENDING", "REJECTED"] as const;
type Tab = (typeof TABS)[number];

export default function AccessRequestPanel() {
    const {
        pendingUsers,
        rejectedUsers,
        loading,
        approve,
        reject,
        deleteForever,
    } = useAccessRequests();

    const [activeTab, setActiveTab] = useState<Tab>("PENDING");
    const [q, setQ] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    const filteredPending = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return pendingUsers;
        return pendingUsers.filter(
            (u) =>
                (u.email ?? "").toLowerCase().includes(s) ||
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
                (u.employeeId ?? "").toLowerCase().includes(s),
        );
    }, [q, pendingUsers]);

    const filteredRejected = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return rejectedUsers;
        return rejectedUsers.filter(
            (u) =>
                (u.email ?? "").toLowerCase().includes(s) ||
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
                (u.employeeId ?? "").toLowerCase().includes(s),
        );
    }, [q, rejectedUsers]);

    const activeUsers =
        activeTab === "PENDING" ? filteredPending : filteredRejected;

    return (
        <Card className="min-w-0 overflow-hidden">
            <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1 shrink-0">
                    <CardTitle className="text-base">Access requests</CardTitle>
                    <CardDescription>
                        {activeUsers.length} result
                        {activeUsers.length === 1 ? "" : "s"} •{" "}
                        {pendingUsers.length} pending, {rejectedUsers.length}{" "}
                        rejected
                    </CardDescription>
                </div>

                {/* Desktop search */}
                <div className="hidden md:block w-full md:w-[320px]">
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search name, email, employee ID..."
                    />
                </div>

                {/* Mobile search toggle */}
                <div className="flex md:hidden items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSearchOpen((v) => !v)}
                        aria-label="Search"
                    >
                        {searchOpen ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                    <AnimatePresence initial={false}>
                        {searchOpen && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{
                                    width: "min(240px, 55vw)",
                                    opacity: 1,
                                }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                            >
                                <Input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search..."
                                    className="h-9"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
                {/* Tab switcher */}
                <div className="flex rounded-lg border border-border/60 overflow-hidden bg-muted/30 p-0.5 gap-0.5">
                    {TABS.map((tab) => {
                        const count =
                            tab === "PENDING"
                                ? filteredPending.length
                                : filteredRejected.length;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                                    activeTab === tab
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                                <span
                                    className={`text-xs tabular-nums ${activeTab === tab ? "text-foreground" : "text-muted-foreground"}`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="rounded-xl border border-border/60 overflow-hidden">
                        <div className="px-5 py-4 border-b border-border/60 flex gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="p-3 space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-14 w-full rounded-lg"
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <UserApprovalTable
                        users={activeUsers}
                        variant={
                            activeTab === "PENDING" ? "pending" : "rejected"
                        }
                        onApprove={approve}
                        onReject={reject}
                        onDelete={deleteForever}
                    />
                )}
            </CardContent>
        </Card>
    );
}
