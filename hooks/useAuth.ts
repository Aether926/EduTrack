// hooks/useAuth.ts
// NOTE: Prefer using getUser() from @/lib/supabase/server in server components.
// Only use this hook in client components that genuinely need the user client-side.
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export function useAuth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/signin"); // fixed typo: was "/sinin"
      else setUser(data.user);
    });
  }, [router]);

  return user;
}