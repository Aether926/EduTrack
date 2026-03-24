"use server";

import { logSecurityEvent } from "@/lib/database/security-log";
import { createClient } from "@/lib/supabase/server";

export async function logSignIn(userId: string, email: string) {
    await logSecurityEvent({
        userId,
        actorId: userId,
        email,
        action: "SIGNED_IN",
    });
}

export async function logSignOut() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await logSecurityEvent({
        userId:  user.id,
        actorId: user.id,
        email:   user.email,
        action:  "SIGNED_OUT",
    });
}

export async function logSignUp(userId: string, email: string) {
    await logSecurityEvent({
        userId,
        actorId: userId,
        email,
        action:  "SIGNED_UP",
    });
}