"use client";
import { use, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Hourglass, XCircle, LogOut, Loader2 } from "lucide-react";

export default function PendingApproval({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status: statusParam } = use(params);
  const router = useRouter();

  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current && glowRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const angle =
          (Math.atan2(y - rect.height / 2, x - rect.width / 2) *
            (180 / Math.PI)) +
          90 +
          180;
        glowRef.current.style.setProperty("--angle", `${angle}deg`);
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${e.clientX}px`;
        spotlightRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // auto-check status and redirect
  useEffect(() => {
    let alive = true;

    const tick = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!alive) return;

      if (!user) {
        router.replace("/signin");
        return;
      }

      const { data: urow, error } = await supabase
        .from("User")
        .select("status")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;

      // if query fails, just stop showing "checking" spinner
      if (error) {
        setChecking(false);
        return;
      }

      if (!urow) {
        router.replace("/fillUp");
        return;
      }

      setChecking(false);

      if (urow.status === "APPROVED") {
        router.replace("/dashboard");
        return;
      }

      // if url doesn't match the real status, correct it
      if (`/status/${urow.status}` !== `/status/${statusParam}`) {
        router.replace(`/status/${urow.status}`);
      }
    };

    tick();
    const t = setInterval(tick, 3000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [router, statusParam]);

  const isRejected = statusParam === "REJECTED";

  return (
    <>
      <style>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        body { background-color: #09090b; }

        .bg-dots {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, #2a2a35 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        .spotlight {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(91,141,238,0.09) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
          transition: left 0.08s ease, top 0.08s ease;
        }

        .glow-ring {
          --angle: 0deg;
          position: absolute;
          inset: -1.5px;
          border-radius: 17px;
          background: conic-gradient(
            from var(--angle),
            transparent 0deg,
            transparent 55deg,
            #5b8dee 100deg,
            #a78bfa 160deg,
            #5b8dee 220deg,
            transparent 265deg,
            transparent 360deg
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          padding: 1.5px;
          pointer-events: none;
          filter: blur(0.4px);
        }
      `}</style>

      <div className="bg-dots" />
      <div className="spotlight" ref={spotlightRef} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm" ref={cardRef}>
          <div className="glow-ring" ref={glowRef} />

          <div className="relative bg-[#141415] border border-[#2a2a2d] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-8 text-center">
              {/* logo */}
              <div className="flex items-center gap-2 mb-7 justify-center">
                <div className="w-[30px] h-[30px] bg-[#5b8dee] rounded-[7px] flex items-center justify-center text-sm">
                  📚
                </div>
                <span className="text-[15px] font-bold text-[#f0f0f0]">
                  EduTrack
                </span>
              </div>

              {isRejected ? (
                <>
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#1c1c1e] border border-[#2e2e32] flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-400" />
                  </div>

                  <h1 className="text-[20px] font-bold text-[#f0f0f0] mb-2">
                    Account Rejected
                  </h1>

                  <p className="text-[13px] text-[#8a8a9a] leading-relaxed">
                    Your account has been reviewed and was not approved. Please
                    contact the administrator for more information.
                  </p>

                  <div className="mt-6 text-[12px] text-[#555560]">
                    Status:{" "}
                    <span className="text-red-400 font-medium">REJECTED</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#1c1c1e] border border-[#2e2e32] flex items-center justify-center">
                    <Hourglass className="h-6 w-6 text-[#a78bfa]" />
                  </div>

                  <h1 className="text-[20px] font-bold text-[#f0f0f0] mb-2">
                    Waiting for Admin Approval
                  </h1>

                  <p className="text-[13px] text-[#8a8a9a] leading-relaxed">
                    Your profile has been submitted successfully. An
                    administrator will review your information shortly.
                  </p>

                  <p className="mt-3 text-[12px] text-[#555560] flex items-center justify-center gap-2">
                    {checking ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Checking status...
                      </>
                    ) : (
                      "You’ll be redirected once approved."
                    )}
                  </p>

                  <button
                    onClick={() =>
                      supabase.auth.signOut().then(() => router.push("/signin"))
                    }
                    className="mt-6 w-full bg-white text-[#0a0a0b] py-2.5 rounded-lg text-[13.5px] font-semibold hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>

                  <div className="mt-4 text-[12px] text-[#555560]">
                    Status:{" "}
                    <span className="text-[#f0f0f0] font-medium">
                      {statusParam}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}