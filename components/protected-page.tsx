"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProtectedPage({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        async function check() {
            const { data } = await supabase.auth.getSession();
            if (!data.session) router.push("/signin");
            else setUser(data.session.user);
        }
        check();
    }, [router]);

    if (!user) return <p>Loading...</p>;

    return <>{children}</>;
}
