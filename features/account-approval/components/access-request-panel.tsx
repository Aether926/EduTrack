"use client";

import { useMemo, useState } from "react";
import { useAccessRequests } from "@/features/account-approval/hooks/use-access-request";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import UserApprovalTable from "./user-approval-table";

export default function AccessRequestPanel() {
  const { pendingUsers, rejectedUsers, loading, approve, reject, deleteForever } =
    useAccessRequests();

  const [q, setQ] = useState("");

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
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(s)
      );
    });
  }, [q, rejectedUsers]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">User Access Requests</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage user registration requests.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Search by teacher name or email.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="md:w-[260px]"
            />
            <div className="flex gap-2">
              <Badge variant="secondary">{pendingUsers.length} pending</Badge>
              <Badge variant="outline">{rejectedUsers.length} rejected</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
    </div>
  );
}