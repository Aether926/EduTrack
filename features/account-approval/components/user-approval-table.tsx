"use client";

import * as React from "react";
import type { PendingUser } from "../types";
import { fmtDate, fullName } from "../lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { CheckCircle2, MoreHorizontal, Trash2, XCircle } from "lucide-react";

function statusVariant(s: string) {
  const v = (s ?? "").toUpperCase();
  if (v === "PENDING") return "secondary";
  if (v === "REJECTED") return "destructive";
  if (v === "APPROVED") return "default";
  return "outline";
}

export default function UserApprovalTable({
  users,
  variant,
  onApprove,
  onReject,
  onDelete,
}: {
  users: PendingUser[];
  variant: "pending" | "rejected";
  onApprove: (id: string) => void | Promise<void>;
  onReject: (id: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}) {
  const [confirm, setConfirm] = React.useState<
    | null
    | { type: "reject"; id: string }
    | { type: "delete"; id: string }
  >(null);

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {variant === "pending"
            ? "No pending user requests."
            : "No rejected users in archive."}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Requested</TableHead>
              <TableHead className="w-[1%]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((u) => {
              const name = fullName(u);
              const initials =
                `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();

              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{initials || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div>{name || "(no name)"}</div>
                        <div className="text-xs text-muted-foreground">
                          {u.contactNumber || "No contact number"}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm">{u.role}</TableCell>

                  <TableCell>
                    <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                  </TableCell>

                  <TableCell className="text-right text-sm text-muted-foreground">
                    {fmtDate(u.createdAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => onApprove(u.id)}
                        className="gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {variant === "pending" ? "Approve" : "Approve anyway"}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {variant === "pending" ? (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setConfirm({ type: "reject", id: u.id })}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setConfirm({ type: "delete", id: u.id })}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete permanently
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setConfirm({ type: "reject", id: u.id })}
                                className="text-muted-foreground"
                              >
                                Mark rejected again
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Reject confirm */}
      <AlertDialog open={confirm?.type === "reject"} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this user?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be moved to the rejected list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm?.type !== "reject") return;
                void onReject(confirm.id);
                setConfirm(null);
              }}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog open={confirm?.type === "delete"} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the user and profile from the database. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirm?.type !== "delete") return;
                if (!onDelete) return;
                void onDelete(confirm.id);
                setConfirm(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}