"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [message, setMessage]               = useState("");
  const [isSuccess, setIsSuccess]           = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [sessionReady, setSessionReady]     = useState(false);
  const [sessionError, setSessionError]     = useState(false);

  const router       = useRouter();
  const cardRef      = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Supabase sends the token via URL hash — we need to detect the session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if already in recovery session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
      else {
        // Give it 2 seconds for the hash to be processed
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d }) => {
            if (d.session) setSessionReady(true);
            else setSessionError(true);
          });
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current && glowRef.current) {
        const rect  = cardRef.current.getBoundingClientRect();
        const x     = e.clientX - rect.left;
        const y     = e.clientY - rect.top;
        const angle = (Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI)) + 90 + 180;
        glowRef.current.style.setProperty("--angle", `${angle}deg`);
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${e.clientX}px`;
        spotlightRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  function getPasswordIssues(pw: string) {
    const issues: string[] = [];
    if (pw.length < 8)             issues.push("at least 8 characters");
    if (!/[A-Z]/.test(pw))        issues.push("at least 1 uppercase letter");
    if ((pw.match(/\d/g) ?? []).length < 3) issues.push("at least 3 numbers");
    return issues;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const issues = getPasswordIssues(password);
    if (!password)                    return setMessage("Password is required.");
    if (issues.length)                return setMessage(`Password too weak. Use ${issues.join(", ")}.`);
    if (password !== confirmPassword) return setMessage("Passwords don't match.");

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("same password")) {
        setMessage("New password must be different from your current password.");
      } else {
        setMessage("Failed to reset password. Please try again.");
      }
      setSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setSubmitting(false);

    // Sign out and redirect after short delay
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/signin");
    }, 3000);
  }

  return (
    <>
      <style>{`
        @property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        body { background-color: #09090b; }
        .bg-dots {
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, #2a2a35 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none; z-index: 0; opacity: 0.5;
        }
        .spotlight {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(91,141,238,0.09) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none; z-index: 1;
          transition: left 0.08s ease, top 0.08s ease;
        }
        .glow-ring {
          --angle: 0deg;
          position: absolute; inset: -1.5px; border-radius: 17px;
          background: conic-gradient(
            from var(--angle),
            transparent 0deg, transparent 55deg,
            #5b8dee 100deg, #a78bfa 160deg, #5b8dee 220deg,
            transparent 265deg, transparent 360deg
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          padding: 1.5px; pointer-events: none; filter: blur(0.4px);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div className="bg-dots" />
      <div className="spotlight" ref={spotlightRef} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm" ref={cardRef}>
          <div className="glow-ring" ref={glowRef} />

          <div className="relative bg-[#141415] border border-[#2a2a2d] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-8">

              {/* Logo */}
              <div className="flex items-center gap-2 mb-7">
                <div className="w-[30px] h-[30px] bg-[#5b8dee] rounded-[7px] flex items-center justify-center text-sm">📚</div>
                <span className="text-[15px] font-bold text-[#f0f0f0]">EduTrack</span>
              </div>

              {/* Loading state — waiting for session */}
              {!sessionReady && !sessionError && (
                <div className="text-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-[#5b8dee] mx-auto mb-4" />
                  <p className="text-[13px] text-[#8a8a9a]">Verifying reset link...</p>
                </div>
              )}

              {/* Invalid/expired link */}
              {sessionError && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[#1c1c1e] border border-[#2e2e32] flex items-center justify-center text-xl mx-auto mb-5">
                    ⚠️
                  </div>
                  <h2 className="text-[18px] font-bold text-[#f0f0f0] mb-2">Link expired</h2>
                  <p className="text-[13px] text-[#8a8a9a] mb-6">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                  <a
                    href="/forgot-password"
                    className="inline-block w-full bg-white text-[#0a0a0b] py-2.5 rounded-lg text-[13.5px] font-semibold hover:opacity-90 transition-all text-center"
                  >
                    Request New Link
                  </a>
                </div>
              )}

              {/* Success state */}
              {isSuccess && (
                <div className="text-center py-4 fade-up">
                  <div className="w-12 h-12 rounded-full bg-[#1c1c1e] border border-[#2e2e32] flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-[18px] font-bold text-[#f0f0f0] mb-2">Password updated</h2>
                  <p className="text-[13px] text-[#8a8a9a] mb-1">Your password has been changed successfully.</p>
                  <p className="text-[12px] text-[#555560] mt-3">Redirecting to sign in...</p>
                </div>
              )}

              {/* Reset form */}
              {sessionReady && !isSuccess && (
                <div className="fade-up">
                  <h1 className="text-[22px] font-bold text-[#f0f0f0] mb-1">Set new password</h1>
                  <p className="text-[13px] text-[#8a8a9a] mb-7">
                    Must be at least 8 characters with 1 uppercase and 3 numbers.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777786]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full pl-9 pr-14 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a9a] hover:text-[#f0f0f0]"
                          aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777786]" />
                        <input
                          type={showConfirm ? "text" : "password"}
                          className="w-full pl-9 pr-14 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a9a] hover:text-[#f0f0f0]"
                          aria-label={showConfirm ? "Hide password" : "Show password"}>
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-white text-[#0a0a0b] py-2.5 rounded-lg text-[13.5px] font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {submitting ? "Updating..." : "Update Password"}
                    </button>
                  </form>

                  {message && (
                    <p className="mt-3 text-center text-[12.5px] text-red-400">{message}</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}