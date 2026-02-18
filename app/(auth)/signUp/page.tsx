"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function check() {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                router.push("/dashboard");
            }
        }
        check();
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/fillUp`,
            }
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
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
            <div className="w-full max-w-sm bg-neutral-300 p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4 text-gray-800">
                    Sign Up
                </h1>

                {!isSuccess ? (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1 text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                            >
                                Submit
                            </button>
                        </form>

                        <div className="flex items-center my-4">
                            <span className="flex-grow h-px bg-gray-500"></span>
                            <span className="px-2 text-gray-700 text-sm">or</span>
                            <span className="flex-grow h-px bg-gray-500"></span>
                        </div>

                        <p className="text-center text-sm text-gray-700">
                            Have an account?{" "}
                            <a
                                href="/signin"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Log In
                            </a>
                        </p>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="mb-4 text-green-600 text-lg">
                            📧 Email Confirmation Sent!
                        </div>
                        <p className="text-gray-700 mb-4">
                            We sent a confirmation email to <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-gray-600">
                            Please check your inbox and click the confirmation link to continue.
                        </p>
                    </div>
                )}

                {message && !isSuccess && (
                    <p className="mt-3 text-center text-sm text-red-600">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}