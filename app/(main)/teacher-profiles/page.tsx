/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TeacherTable from "@/components/teacher-table";
import type { TeacherTableRow } from "@/lib/user";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function TeacherProfilesPage() {
  const [userRole, setUserRole] = useState<"ADMIN" | "TEACHER" | null>(null);
  const [teachers, setTeachers] = useState<TeacherTableRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;

      if (!authUser) {
        setTeachers([]);
        setLoading(false);
        return;
      }

      // get current user's role + status
      const { data: userRow, error: userErr } = await supabase
        .from("User")
        .select("role,status")
        .eq("id", authUser.id)
        .maybeSingle();

      if (userErr) {
        toast.error("Error loading user session.");
        setTeachers([]);
        setLoading(false);
        return;
      }

      if (userRow) setUserRole(userRow.role as "ADMIN" | "TEACHER");

      // if current user is PENDING (or not approved), don't fetch teacher rows at all
      if (!userRow || userRow.status !== "APPROVED") {
        setTeachers([]);
        setLoading(false);
        return;
      }

      // fetch approved TEACHER profiles only, exclude own profile row
      const { data: profiles, error } = await supabase
        .from("Profile")
        .select(
          `
          *,
          User!inner (
            status,
            role
          )
        `
        )
        .eq("User.status", "APPROVED")
        .eq("User.role", "TEACHER") // don't include ADMIN in table
        .neq("id", authUser.id) // don't include own profile row
        .order("lastName", { ascending: true });

      if (error) {
        toast.error("Error fetching teachers.");
        setTeachers([]);
        setLoading(false);
        return;
      }

      const tableData: TeacherTableRow[] = (profiles ?? []).map(
        (profile: any) => ({
          id: profile.id,
          employeeid: profile.employeeId || "N/A",
          fullname: `${profile.firstName} ${
            profile.middleInitial ? profile.middleInitial + ". " : ""
          }${profile.lastName}`,
          position: profile.position || "N/A",
          contact: profile.contactNumber || "N/A",
          email: profile.email,
          profileImage: profile.profileImage || null,
          status: profile.User.status,
        })
      );

      setTeachers(tableData);
      setLoading(false);
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = teachers.length;
    const approved = teachers.filter((t) => t.status === "APPROVED").length;
    return { total, approved };
  }, [teachers]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6">
      {/* Header */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{userRole ?? "USER"}</Badge>
              <Badge variant="outline">Teacher Profiles</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              {loading ? "—" : `${stats.total} teachers`}
            </Badge>
            <Badge variant="outline" className="gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {loading ? "—" : `${stats.approved} approved`}
            </Badge>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 min-w-0">
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teachers</CardTitle>
              <CardDescription>Loading directory…</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : teachers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No approved teachers found.
            </CardContent>
          </Card>
        ) : (
          <TeacherTable data={teachers} />
        )}
      </div>
    </div>
  );
}