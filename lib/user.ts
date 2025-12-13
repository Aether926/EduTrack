import { createClient } from "./supabase/server";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    status: string;
}

export interface UserWithProfile {
    id: string;
    firstName: string;
    lastName: string;
    middleInitial: string;
    email: string;
    role: string;
    status: string;
    contactNumber: string;
    createdAt: string;
}

export async function getUsers() {
    const supabase = await createClient();
    const { data: users } = await supabase
        .from("User")
        .select()
        .order("createdAt", { ascending: false });

    return users;
}

export async function getUsersWithPending(
    users: User[]
): Promise<UserWithProfile[]> {
    const supabase = await createClient();

    try {
        const pendingUsers = users.filter((user) => user.status === "PENDING");
        const pendingProfiles = await Promise.all(
            pendingUsers.map(async (user) => {
                const { data: profile } = await supabase
                    .from("Profile")
                    .select("firstName, lastName, middleInitial, contactNumber")
                    .eq("id", user.id)
                    .single();

                return {
                    id: user.id,
                    firstName: profile?.firstName || "",
                    lastName: profile?.lastName || "",
                    middleInitial: profile?.middleInitial || "",
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    contactNumber: profile?.contactNumber || "",
                    createdAt: user.createdAt,
                };
            })
        );

        return pendingProfiles;
    } catch (error) {
        console.error("Error fetching pending users:", error);
        return [];
    }
}

export async function getUsersWithRejected(
    users: User[]
): Promise<UserWithProfile[]> {
    const supabase = await createClient();

    try {
        const rejectedUsers = users.filter(
            (user) => user.status === "REJECTED"
        );
        const rejectedProfiles = await Promise.all(
            rejectedUsers.map(async (user) => {
                const { data: profile } = await supabase
                    .from("Profile")
                    .select("firstName, lastName, middleInitial, contactNumber")
                    .eq("id", user.id)
                    .single();

                return {
                    id: user.id,
                    firstName: profile?.firstName || "",
                    lastName: profile?.lastName || "",
                    middleInitial: profile?.middleInitial || "",
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    contactNumber: profile?.contactNumber || "",
                    createdAt: user.createdAt,
                };
            })
        );

        return rejectedProfiles;
    } catch (error) {
        console.error("Error fetching rejected users:", error);
        return [];
    }
}
