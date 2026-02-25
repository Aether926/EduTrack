/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState("");
  const [message, setMessage]     = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cardRef      = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm) return setMessage("Email is required.");
    setSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(emailNorm, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Always show success — don't reveal if email exists or not
    if (error && !error.message.toLowerCase().includes("rate")) {
      setIsSuccess(true);
    } else if (error?.message.toLowerCase().includes("rate")) {
      setMessage("Too many attempts. Please wait a few minutes and try again.");
    } else {
      setIsSuccess(true);
    }

    setSubmitting(false);
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

              {!isSuccess ? (
                <>
                  <h1 className="text-[22px] font-bold text-[#f0f0f0] mb-1">Forgot password?</h1>
                  <p className="text-[13px] text-[#8a8a9a] mb-7">
                    Enter your email and we'll send you a reset link.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                      <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777786]" />
                        <input
                          type="email"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                          placeholder="teacher@school.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-white text-[#0a0a0b] py-2.5 rounded-lg text-[13.5px] font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {submitting ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>

                  {message && (
                    <p className="mt-3 text-center text-[12.5px] text-red-400">{message}</p>
                  )}
                </>
              ) : (
                /* Success state */
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-[#1c1c1e] border border-[#2e2e32] flex items-center justify-center text-xl mx-auto mb-5">
                    ✉️
                  </div>
                  <h2 className="text-[18px] font-bold text-[#f0f0f0] mb-2">Check your inbox</h2>
                  <p className="text-[13px] text-[#8a8a9a] mb-1">
                    If an account exists for
                  </p>
                  <p className="text-[13px] text-[#5b8dee] font-medium mb-3">
                    {email.trim()}
                  </p>
                  <p className="text-[13px] text-[#8a8a9a] mb-6">
                    you'll receive a password reset link shortly.
                  </p>
                  <p className="text-[11px] text-[#555560]">
                    Didn't receive it? Check your spam folder or{" "}
                    <button
                      onClick={() => { setIsSuccess(false); setMessage(""); }}
                      className="text-[#8a8a9a] underline hover:text-[#f0f0f0] transition-colors"
                    >
                      try again
                    </button>.
                  </p>
                </div>
              )}

              {/* Back to sign in */}
              <div className="mt-6 flex justify-center">
                <Link
                  href="/signin"
                  className="flex items-center gap-1.5 text-[12.5px] text-[#8a8a9a] hover:text-[#f0f0f0] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}