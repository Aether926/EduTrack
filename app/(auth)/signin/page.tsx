"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, BookOpen, Users, Award, ClipboardList } from "lucide-react";
import { logSignIn } from "@/app/actions/auth-log-actions";

const FEATURES = [
  { icon: BookOpen,      label: "Digital 201 Files",      desc: "Paperless teacher records, always up to date"   },
  { icon: Users,         label: "Appointment Tracking",   desc: "Full appointment history at a glance"           },
  { icon: Award,         label: "Training & Compliance",  desc: "Monitor L&D attendance and compliance reports"  },
  { icon: ClipboardList, label: "Personal Information",   desc: "Complete personal information in one place"      },
];

export default function LogIn() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [message, setMessage]           = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router       = useRouter();
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

  async function emailExistsInUserTable(emailNorm: string) {
    const { data, error } = await supabase
      .from("User")
      .select("id")
      .eq("email", emailNorm).maybeSingle();

    if (error) return null;
    return !!data;
  }

  async function handleSubmit(e: React.FormEvent) {
    
    e.preventDefault();
    setMessage("");
    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm && !password) return setMessage("Invalid credentials.");
    if (!emailNorm) return setMessage("Email is required.");
    if (!password)  return setMessage("Password is required.");
    
    setSubmitting(true);

    const { error, data } = await supabase.auth.signInWithPassword({ email: emailNorm, password });

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("invalid login credentials")) {
        const exists = await emailExistsInUserTable(emailNorm);
        if (exists === false)     setMessage("Email doesn't exist.");
        else if (exists === true) setMessage("Wrong password.");
        else                      setMessage("Invalid credentials.");
      } else if (msg.includes("email not confirmed")) {
        setMessage("Please confirm your email first.");
      } else if (msg.includes("too many requests") || msg.includes("rate")) {
        setMessage("Too many attempts. Try again later.");
      } else {
        setMessage("Something went wrong. Try again.");
      }
      setSubmitting(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) { setMessage("Something went wrong. Try again."); setSubmitting(false); return; }
    await logSignIn(userId, emailNorm);

    const { data: profile, error: profErr } = await 
    supabase
      .from("User")
      .select("status")
      .eq("id", userId)
      .maybeSingle();
    if (profErr) { setMessage("Something went wrong. Try again."); setSubmitting(false); return; }

    if (!profile)                           router.push("/fillUp");
    else if (profile.status === "PENDING")  router.push("/status");
    else if (profile.status === "APPROVED") router.push("/dashboard");
    else { 
        setMessage("Your account status is unclear. Please contact support.");
        setSubmitting(false);
    }
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

          {/* ── RIGHT: Login Card ── */}
          <div className="w-full max-w-sm flex-shrink-0">
            <div className="relative w-full" ref={cardRef}>
              <div className="glow-ring" ref={glowRef} />
              <div className="relative bg-[#141415] border border-[#2a2a2d] rounded-2xl overflow-hidden shadow-xl">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-7">
                    <div className="w-[30px] h-[30px] bg-[#5b8dee] rounded-[7px] flex items-center justify-center text-sm">📚</div>
                    <span className="text-[15px] font-bold text-[#f0f0f0]">EduTrack</span>
                  </div>

                  <h1 className="text-[22px] font-bold text-[#f0f0f0] mb-1">Welcome back</h1>
                  <p className="text-[13px] text-[#8a8a9a] mb-7">Sign in to your EduTrack account</p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
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
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      {/* ── Forgot password link added here ── */}
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[12.5px] font-medium text-[#8a8a9a]">Password</label>
                        <a href="/forgot-password" className="text-[12px] text-[#5b8dee] hover:underline transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777786]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full pl-9 pr-14 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                          placeholder="••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a9a] hover:text-[#f0f0f0]"
                          aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={submitting}
                      className="w-full bg-white text-[#0a0a0b] py-2.5 rounded-lg text-[13.5px] font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {submitting ? "Signing in..." : "Sign In"}
                    </button>
                  </form>

                  {message && <p className="mt-3 text-center text-[12.5px] text-red-400">{message}</p>}

                  <div className="flex items-center my-5">
                    <span className="flex-grow h-px bg-[#2a2a2d]" />
                    <span className="px-3 text-[#555560] text-[11px]">or</span>
                    <span className="flex-grow h-px bg-[#2a2a2d]" />
                  </div>

                  <p className="text-center text-[13px] text-[#8a8a9a]">
                    No account?{" "}
                    <a href="/signUp" className="text-[#f0f0f0] font-medium hover:underline">Sign Up</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}