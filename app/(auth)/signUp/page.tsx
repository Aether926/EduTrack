"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function check() {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                router.push("/dashboard");
            }
        }
        check();
    }, [router]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (cardRef.current && glowRef.current) {
                const rect = cardRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const angle =
                    Math.atan2(y - rect.height / 2, x - rect.width / 2) *
                        (180 / Math.PI) +
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/fillUp`,
            },
        });

        if (error) {
            setMessage(error.message);
            setIsSuccess(false);
            return;
        }

        setMessage("✅ Please check your email to confirm your account!");
        setIsSuccess(true);
    }

    return (
        <>
            <style>{`
                @property --angle {
                    syntax: "<angle>";
                    initial-value: 0deg;
                    inherits: false;
                }

                body {
                    background-color: #09090b;
                }

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
                        <div className="p-8">
                            {/* logo */}
                            <div className="flex items-center gap-2 mb-7">
                                <div className="w-[30px] h-[30px] bg-[#5b8dee] rounded-[7px] flex items-center justify-center text-sm">
                                    📚
                                </div>
                                <span className="text-[15px] font-bold text-[#f0f0f0]">
                                    EduTrack
                                </span>
                            </div>

                            {!isSuccess ? (
                                <>
                                    <h1 className="text-[22px] font-bold text-[#f0f0f0] mb-1">
                                        Create account
                                    </h1>
                                    <p className="text-[13px] text-[#8a8a9a] mb-7">
                                        Sign up to get started with EduTrack
                                    </p>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                                                placeholder="Enter email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-5">
                                            <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full px-3 py-2.5 bg-[#1c1c1e] border border-[#2e2e32] rounded-lg text-[13.5px] text-[#f0f0f0] placeholder-[#555560] outline-none focus:border-[#5b8dee] focus:ring-2 focus:ring-[#5b8dee]/10 transition-colors"
                                                placeholder="Enter password"
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-white text-[#0a0a0b] py-2.5 rounded-lg text-[13.5px] font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
                                        >
                                            Sign Up
                                        </button>
                                    </form>

                                    {message && !isSuccess && (
                                        <p className="mt-3 text-center text-[12.5px] text-red-400">
                                            {message}
                                        </p>
                                    )}

                                    <div className="flex items-center my-5">
                                        <span className="flex-grow h-px bg-[#2a2a2d]"></span>
                                        <span className="px-3 text-[#555560] text-[11px]">
                                            or
                                        </span>
                                        <span className="flex-grow h-px bg-[#2a2a2d]"></span>
                                    </div>

                                    <p className="text-center text-[13px] text-[#8a8a9a]">
                                        Have an account?{" "}
                                        <a
                                            href="/signin"
                                            className="text-[#f0f0f0] font-medium hover:underline"
                                        >
                                            Log In
                                        </a>
                                    </p>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 rounded-full bg-[#1c1c1e] border border-[#2e2e32] flex items-center justify-center text-xl mx-auto mb-5">
                                        ✉️
                                    </div>
                                    <h2 className="text-[18px] font-bold text-[#f0f0f0] mb-2">
                                        Check your inbox
                                    </h2>
                                    <p className="text-[13px] text-[#8a8a9a] mb-1">
                                        We sent a confirmation link to
                                    </p>
                                    <p className="text-[13px] text-[#5b8dee] font-medium mb-4">
                                        {email}
                                    </p>
                                    <p className="text-[12px] text-[#555560]">
                                        Click the link in your email to
                                        continue.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
