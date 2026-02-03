"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, Calendar, TrendingUp } from "lucide-react";
import { User } from "@/app/generated/prisma";
import { AuthUser } from "@supabase/supabase-js";

export default function Dashboard() {
    const [userName, setUserName] = useState("User");
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    
    const [stats, setStats] = useState({
        totalProfiles: 0,
        totalTrainings: 0,
        totalSeminars: 0,
    });

    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getSession();

            const authUser = data.session?.user;
            if (!authUser) return;

            setUser(authUser);

            const { data: userRow, error } = await supabase
                .from("User")
                .select("role")
                .eq("id", authUser.id)
                .single();

            if (!error && userRow) {
                setUserRole(userRow.role);
            }

            setUserName(
                authUser.user_metadata?.name ||
                    authUser.email?.split("@")[0] ||
                    "User"
            );
        };

        loadUser();
    }, []);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const { count: profileCount } = await supabase
                    .from('Profile')
                    .select('*', { count: 'exact', head: true });

                const { count: trainingCount } = await supabase
                    .from('ProfessionalDevelopment')
                    .select('*', { count: 'exact', head: true })
                    .eq('type', 'TRAINING');

                const { count: seminarCount } = await supabase
                    .from('ProfessionalDevelopment')
                    .select('*', { count: 'exact', head: true })
                    .eq('type', 'SEMINAR');

                setStats({
                    totalProfiles: profileCount || 0,
                    totalTrainings: trainingCount || 0,
                    totalSeminars: seminarCount || 0,
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        };

        loadStats();
    }, []);

    const recentActivity = [
        {
            name: "Maria Angelica Reyes",
            position: "Senior High School Teacher II",
            action: "logged in",
            time: "2 hours ago",
            date: "Dec 12, 2025",
            type: "login",
        },
        {
            name: "John Carlo D. Santos",
            position: "ICT Coordinator",
            action: "updated profile",
            time: "3 hours ago",
            date: "Dec 12, 2025",
            type: "update",
        },
        {
            name: "Louise Anne T. Cruz",
            position: "Guidance Counselor",
            action: "logged in",
            time: "5 hours ago",
            date: "Dec 12, 2025",
            type: "login",
        },
        {
            name: "Kimberly Joy Flores",
            position: "Master Teacher I",
            action: "completed training",
            time: "8 hours ago",
            date: "Dec 12, 2025",
            type: "training",
        },
        {
            name: "Patrick Joseph Mendoza",
            position: "Administrative Assistant II",
            action: "logged in",
            time: "1 day ago",
            date: "Dec 11, 2025",
            type: "login",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background p-8">
            {/* Welcome Header */}
            <div className="max-w-6xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Welcome to EduTrack, {userName}! 👋
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Your comprehensive education management platform
                    </p>
                </div>

                {/* Stats Cards with REAL DATA */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                {stats.totalProfiles}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Total Profiles
                        </h3>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                {stats.totalTrainings}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Training Records
                        </h3>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                {stats.totalSeminars}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Seminar Records
                        </h3>
                    </div>
                </div>

                {/* Quick Actions - Only for ADMIN */}
                {userRole === "ADMIN" && (
                    <div className="bg-card border border-border rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-foreground mb-4">
                            Quick Actions
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <a
                                href="account-approval"
                                className="block p-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-left"
                            >
                                <h3 className="font-medium mb-1">
                                    Review Pending Requests
                                </h3>
                                <p className="text-sm opacity-90">
                                    Approve or deny account requests from new
                                    users
                                </p>
                            </a>

                            <a
                                href="add-training-seminar"
                                className="block p-4 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity text-left"
                            >
                                <h3 className="font-medium mb-1">
                                    Add Training / Seminar
                                </h3>
                                <p className="text-sm opacity-90">
                                    Record new training or seminar attendance
                                </p>
                            </a>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        Recent Activity
                    </h2>
                    <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between py-3 border-b border-border last:border-0"
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {activity.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.position} • {activity.action}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {activity.date} • {activity.time}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                                        activity.type === "login"
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                            : activity.type === "update"
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                    }`}
                                >
                                    {activity.type === "login"
                                        ? "Login"
                                        : activity.type === "update"
                                        ? "Update"
                                        : "Training"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}