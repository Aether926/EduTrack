"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TrainingHistory from "@/components/tables/history-training-records";

export default function TrainingHistoryPage() {
    const [userRole, setUserRole] = useState<"ADMIN" | "TEACHER" | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserRole = async () => {
            const { data } = await supabase.auth.getSession();
            const authUser = data.session?.user;

            if (!authUser) {
                setLoading(false);
                return;
            }

            // Fetch role from your "User" table
            const { data: userRow, error } = await supabase
                .from("User")
                .select("role")
                .eq("id", authUser.id)
                .single();

            if (!error && userRow) {
                setUserRole(userRow.role as "ADMIN" | "TEACHER");
            }

            setLoading(false);
        };

        loadUserRole();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-6">
            <h1 className="text-3xl font-bold mb-6">
                Professional Development
            </h1>

            <TrainingHistory role={userRole || "TEACHER"} />
        </div>
    );
}
