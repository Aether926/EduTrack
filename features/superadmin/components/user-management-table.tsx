"use client";

import { useMemo, useState } from "react";
import { useSuperadminUsers } from "../hooks/use-superadmin-users";
import { fetchPromotionQuota } from "../actions/fetch-actions";
import UserActionSheet from "./user-action-sheet";
import type { SuperadminUser } from "../types";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import InitialAvatar from "@/components/avatar-ui-color/avatar-color";
import { Search, Users } from "lucide-react";
import { useEffect } from "react";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fullName(u: SuperadminUser) {
    return `${u.firstName ?? ""} ${u.middleInitial ? u.middleInitial + ". " : ""}${u.lastName ?? ""}`.trim();
}

function fmtDate(dt: string) {
    try {
        return new Date(dt).toLocaleDateString("en-PH", {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch { return dt; }
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        APPROVED:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        PENDING:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
        REJECTED:  "bg-rose-500/15 text-rose-400 border-rose-500/30",
        SUSPENDED: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    };
    return (
        <Badge className={`inline-flex items-center gap-1.5 ${styles[status.toUpperCase()] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"} hover:opacity-100`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </Badge>
    );
}

// ── Role chip ──────────────────────────────────────────────────────────────────

function RoleChip({ role }: { role: string }) {
    const styles: Record<string, string> = {
        TEACHER:    "bg-teal-500/10 text-teal-400 border-teal-500/40",
        ADMIN:      "bg-violet-500/10 text-violet-400 border-violet-500/40",
        SUPERADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/40",
    };
    return (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${styles[role] ?? "bg-slate-500/10 text-slate-400 border-slate-500/40"}`}>
            {role}
        </span>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function UserManagementTable({ actorId }: { actorId: string }) {
    const { users, loading, approve, reject, suspend, unsuspend, deleteUser, changeRole } =
        useSuperadminUsers();

    const [q, setQ]                       = useState("");
    const [roleFilter, setRoleFilter]     = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedUser, setSelectedUser] = useState<SuperadminUser | null>(null);
    const [sheetOpen, setSheetOpen]       = useState(false);
    const [quota, setQuota]               = useState({
        teacherPromotionsUsed:       0,
        teacherPromotionsLeft:       3,
        superadminCooldownRemaining: null as number | null,
        superadminCount:             0,
    });

    // Fetch promotion quota
    useEffect(() => {
        fetchPromotionQuota(actorId).then(setQuota);
    }, [actorId, users]); // refetch when users change

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return users.filter((u) => {
            const matchesSearch = !s ||
                fullName(u).toLowerCase().includes(s) ||
                (u.email ?? "").toLowerCase().includes(s) ||
                (u.employeeId ?? "").toLowerCase().includes(s);

            const matchesRole   = roleFilter   === "ALL" || u.role   === roleFilter;
            const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [q, roleFilter, statusFilter, users]);

    return (
        <>
            <Card className="min-w-0 overflow-hidden">
                <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1 shrink-0">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-rose-400" />
                            User Management
                        </CardTitle>
                        <CardDescription>
                            {filtered.length} result{filtered.length === 1 ? "" : "s"} • {users.length} total users
                        </CardDescription>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search name, email, ID..."
                                className="pl-8 h-8 text-sm w-[220px]"
                            />
                        </div>

                        {/* Role filter */}
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="h-8 text-sm w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                <SelectItem value="TEACHER">Teacher</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-8 text-sm w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border/60 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground pl-5">
                                            User
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">
                                            Role
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">
                                            Registered
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="h-24 text-center text-sm text-muted-foreground"
                                            >
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((u) => {
                                            const name = fullName(u).trim() || "(no name)";
                                            return (
                                                <TableRow
                                                    key={u.id}
                                                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setSheetOpen(true);
                                                    }}
                                                >
                                                    <TableCell className="pl-5">
                                                        <div className="flex items-center gap-2.5">
                                                            <InitialAvatar
                                                                name={name}
                                                                src={u.profileImage}
                                                                className="h-8 w-8 shrink-0"
                                                            />
                                                            <div className="leading-tight">
                                                                <p className="text-sm font-medium">
                                                                    {name}
                                                                </p>
                                                                <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                                                    {u.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="hidden md:table-cell">
                                                        <RoleChip role={u.role} />
                                                    </TableCell>

                                                    <TableCell>
                                                        <StatusBadge status={u.status} />
                                                    </TableCell>

                                                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                                                        {fmtDate(u.createdAt)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action sheet */}
            <UserActionSheet
                user={selectedUser}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onApprove={approve}
                onReject={reject}
                onSuspend={suspend}
                onUnsuspend={unsuspend}
                onDelete={deleteUser}
                onRoleChange={changeRole}
                promotionQuota={quota}
            />
        </>
    );
}