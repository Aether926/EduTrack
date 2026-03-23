"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "./user";

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user?.data) {
        redirect("/login");
    }

    return user.data.user;
}
