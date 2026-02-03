// app/(main)/teacher-profiles/page.tsx

"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TeacherTable from "@/components/teacher-table";
import { TeacherTableRow } from "@/lib/user";

export default function TeacherProfilesPage() {
    const [userRole, setUserRole] = useState<"ADMIN" | "TEACHER" | null>(null);
    const [teachers, setTeachers] = useState<TeacherTableRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            // Get user role
            const { data } = await supabase.auth.getSession();
            const authUser = data.session?.user;
            
            if (!authUser) {
                setLoading(false);
                return;
            }

            // Fetch role from User table
            const { data: userRow } = await supabase
                .from("User")
                .select("role")
                .eq("id", authUser.id)
                .single();

            if (userRow) {
                setUserRole(userRow.role as "ADMIN" | "TEACHER");
            }

            // Fetch approved teachers
            const { data: profiles, error } = await supabase
                .from('Profile')
                .select(`
                    *,
                    User!inner (
                        status,
                        role
                    )
                `)
                .eq('User.status', 'APPROVED')
                .order('lastName', { ascending: true });

            if (error) {
                console.error('Error fetching teachers:', error);
                setLoading(false);
                return;
            }

            // Transform data for table
            const tableData: TeacherTableRow[] = profiles.map(profile => ({
                id: profile.id,
                employeeid: profile.employeeId || 'N/A',
                fullname: `${profile.firstName} ${profile.middleInitial ? profile.middleInitial + '. ' : ''}${profile.lastName}`,
                position: profile.position || 'N/A',
                contact: profile.contactNumber || 'N/A',
                email: profile.email,
                profileImage: profile.profileImage || null,
                status: profile.User.status,
            }));

            setTeachers(tableData);
            setLoading(false);
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (teachers.length === 0) {
        return (
            <div className="w-full p-6">
                <h1 className="text-3xl font-bold mb-6">Teacher Profiles</h1>
                <div className="text-center py-12 border rounded-lg">
                    <p className="text-muted-foreground">No approved teachers found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-6">
            <h1 className="text-3xl font-bold mb-6">Teacher Profiles</h1>
            <TeacherTable data={teachers} />
        </div>
    );
}