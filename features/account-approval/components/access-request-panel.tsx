"use client";

import { useMemo, useState } from "react";
import { useAccessRequests } from "@/features/account-approval/hooks/use-access-request";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Search, X } from "lucide-react";

import UserApprovalTable from "./user-approval-table";

export default function AccessRequestPanel() {
  const { pendingUsers, rejectedUsers, loading, approve, reject, deleteForever } =
    useAccessRequests();

  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredPending = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pendingUsers;
    return pendingUsers.filter((u) => {
      return (
        (u.email ?? "").toLowerCase().includes(s) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
        (u.employeeId ?? "").toLowerCase().includes(s)
      );
    });
  }, [q, pendingUsers]);

  const filteredRejected = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rejectedUsers;
    return rejectedUsers.filter((u) => {
      return (
        (u.email ?? "").toLowerCase().includes(s) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
        (u.employeeId ?? "").toLowerCase().includes(s)
      );
    });
  }, [q, rejectedUsers]);

  const pendingCount = pendingUsers.length;
  const rejectedCount = rejectedUsers.length;

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Access requests</CardTitle>
          <CardDescription>Review and manage user registration requests.</CardDescription>
        </div>

        {/* desktop search */}
        <div className="hidden md:flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, employee ID..."
            className="w-[320px]"
          />

          <Badge variant="secondary">{pendingCount} pending</Badge>
          <Badge variant="outline">{rejectedCount} rejected</Badge>
        </div>

        {/* mobile search toggle */}
        <div className="flex md:hidden items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{pendingCount} pending</Badge>
            <Badge variant="outline">{rejectedCount} rejected</Badge>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* mobile inline search */}
        {searchOpen ? (
          <div className="md:hidden">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, employee ID..."
            />
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="rounded-lg border overflow-hidden">
              <div className="p-3 border-b flex gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24 hidden sm:block" />
                <Skeleton className="h-4 w-24 hidden sm:block" />
              </div>

              <div className="p-3 space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="gap-2">
                Pending
                <Badge variant="secondary">{filteredPending.length}</Badge>
              </TabsTrigger>

              <TabsTrigger value="rejected" className="gap-2">
                Rejected
                <Badge variant="secondary">{filteredRejected.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <UserApprovalTable
                users={filteredPending}
                variant="pending"
                onApprove={approve}
                onReject={reject}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              <UserApprovalTable
                users={filteredRejected}
                variant="rejected"
                onApprove={approve}
                onReject={reject}
                onDelete={deleteForever}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}