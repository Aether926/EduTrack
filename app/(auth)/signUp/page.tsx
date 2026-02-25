"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, BookOpen, Users, Award, ClipboardList } from "lucide-react";

const FEATURES = [
  { icon: BookOpen,      label: "Digital 201 Files",      desc: "Paperless teacher records, always up to date"   },
  { icon: Users,         label: "Appointment Tracking",   desc: "Full appointment history at a glance"           },
  { icon: Award,         label: "Training & Compliance",  desc: "Monitor L&D attendance and compliance reports"  },
  { icon: ClipboardList, label: "Personal Information",   desc: "Complete personal information in one place"      },
];

export default function SignUpPage() {
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage]               = useState("");
  const [isSuccess, setIsSuccess]           = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router       = useRouter();
  const cardRef      = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.push("/dashboard");
    }
    check();
  }, [router]);

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
    if (pw.length < 8) issues.push("at least 8 characters");
    if (!/[A-Z]/.test(pw)) issues.push("at least 1 uppercase letter");
    if ((pw.match(/\d/g) || []).length < 3) issues.push("at least 3 numbers");
    return issues;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const emailNorm = email.trim().toLowerCase();
    const issues    = getPasswordIssues(password);
    if (!emailNorm && !password) return setMessage("Invalid credentials.");
    if (!emailNorm)              return setMessage("Email is required.");
    if (!password)               return setMessage("Password is required.");
    if (!confirmPassword)        return setMessage("Please confirm your password.");
    if (password !== confirmPassword) return setMessage("Passwords don't match.");
    if (issues.length) return setMessage(`Password is too weak. Use ${issues.join(", ")}.`);
    setSubmitting(true);

    // const res = await fetch("/api/auth/check-email", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: emailNorm }),
    // });
    // const { exists } = await res.json().catch(() => ({ exists: false }));
    // if (exists) { setMessage("Email already exists."); setSubmitting(false); return; }

    const { error } = await supabase.auth.signUp({
      email: emailNorm,
      password,
      options: { emailRedirectTo: `${window.location.origin}/fillUp` },
    });

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("already registered") || msg.includes("already in use")) setMessage("Email is already taken.");
      else if (msg.includes("invalid email"))  setMessage("Invalid email.");
      else if (msg.includes("password"))       setMessage("Password is too weak.");
      else if (msg.includes("rate") || msg.includes("too many")) setMessage("Too many attempts. Try again later.");
      else setMessage("Something went wrong. Try again.");
      setIsSuccess(false);
      setSubmitting(false);
      return;
    }

    setMessage("Please check your email to confirm your account!");
    setIsSuccess(true);
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.55s ease both; }
        .fu-1 { animation-delay: 0.05s; }
        .fu-2 { animation-delay: 0.12s; }
        .fu-3 { animation-delay: 0.20s; }
        .fu-4 { animation-delay: 0.28s; }
        .fu-5 { animation-delay: 0.36s; }
        .feature-pill:hover .f-icon { background: rgba(91,141,238,0.15); }
      `}</style>

      <div className="bg-dots" />
      <div className="spotlight" ref={spotlightRef} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* ── LEFT: Hero ── */}
          <div className="flex-1 w-full text-center lg:text-left">

            <div className="fu fu-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2a2a2d] bg-[#141415] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5b8dee] animate-pulse" />
              <span className="text-[11px] text-[#8a8a9a] font-medium tracking-widest uppercase">
                Valencia National High School
              </span>
            </div>

            <h1 className="fu fu-2 text-[38px] lg:text-[48px] font-bold text-[#f0f0f0] leading-[1.15] mb-4">
              Teacher Records,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5b8dee] to-[#a78bfa]">
                Simplified.
              </span>
            </h1>

            <p className="fu fu-3 text-[13.5px] text-[#8a8a9a] leading-relaxed mb-8 max-w-[340px] mx-auto lg:mx-0">
              EduTrack is the all-in-one faculty management system for Valencia NHS —
              managing 201 files, appointments, trainings, and compliance in one place.
            </p>

            <div className="fu fu-4 flex flex-col gap-2.5 max-w-[340px] mx-auto lg:mx-0">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="feature-pill flex items-center gap-3 px-4 py-3 rounded-xl border border-[#222225] bg-[#141415]/70 backdrop-blur-sm transition-colors">
                  <div className="f-icon w-8 h-8 rounded-lg bg-[#1c1c1e] border border-[#2e2e32] flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon size={14} className="text-[#5b8dee]" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[12.5px] font-semibold text-[#e8e8e8]">{label}</p>
                    <p className="text-[11px] text-[#555560] truncate">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="fu fu-5 mt-7 text-[11px] text-[#3a3a42]">
              Division of Ormoc · DepEd Region VIII · Philippines
            </p>
          </div>

          {/* ── RIGHT: Signup Card (unchanged internals) ── */}
          <div className="w-full max-w-sm flex-shrink-0">
            <div className="relative w-full" ref={cardRef}>
              <div className="glow-ring" ref={glowRef} />
              <div className="relative bg-[#141415] border border-[#2a2a2d] rounded-2xl overflow-hidden shadow-xl">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-7">
                    <div className="w-[30px] h-[30px] bg-[#5b8dee] rounded-[7px] flex items-center justify-center text-sm">📚</div>
                    <span className="text-[15px] font-bold text-[#f0f0f0]">EduTrack</span>
                  </div>

                  {!isSuccess ? (
                    <>
                      <h1 className="text-[22px] font-bold text-[#f0f0f0] mb-1">Create account</h1>
                      <p className="text-[13px] text-[#8a8a9a] mb-7">Sign up to get started with EduTrack</p>

                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777786]" />
                            <input type="email"
                              className="w-full pl-9 pr-3 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                              placeholder="Enter email" value={email}
                              onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777786]" />
                            <input type={showPassword ? "text" : "password"}
                              className="w-full pl-9 pr-14 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                              placeholder="Enter password" value={password}
                              onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a9a] hover:text-[#f0f0f0]"
                              aria-label={showPassword ? "Hide password" : "Show password"}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="mb-5">
                          <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777786]" />
                            <input type={showConfirmPassword ? "text" : "password"}
                              className="w-full pl-9 pr-14 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                              placeholder="Confirm password" value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                            <button type="button" onClick={() => setShowConfirmPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a9a] hover:text-[#f0f0f0]"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <button type="submit" disabled={submitting}
                          className="w-full bg-white text-[#0a0a0b] py-2.5 rounded-lg text-[13.5px] font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {submitting ? "Signing up..." : "Sign Up"}
                        </button>
                      </form>

                      {message && !isSuccess && (
                        <p className="mt-3 text-center text-[12.5px] text-red-400">{message}</p>
                      )}

                      <div className="flex items-center my-5">
                        <span className="flex-grow h-px bg-[#2a2a2d]" />
                        <span className="px-3 text-[#555560] text-[11px]">or</span>
                        <span className="flex-grow h-px bg-[#2a2a2d]" />
                      </div>

                      <p className="text-center text-[13px] text-[#8a8a9a]">
                        Have an account?{" "}
                        <a href="/signin" className="text-[#f0f0f0] font-medium hover:underline">Log In</a>
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-[#1c1c1e] border border-[#2e2e32] flex items-center justify-center text-xl mx-auto mb-5">✉️</div>
                      <h2 className="text-[18px] font-bold text-[#f0f0f0] mb-2">Check your inbox</h2>
                      <p className="text-[13px] text-[#8a8a9a] mb-1">We sent a confirmation link to</p>
                      <p className="text-[13px] text-[#5b8dee] font-medium mb-4">{email.trim()}</p>
                      <p className="text-[12px] text-[#555560]">Click the link in your email to continue.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}