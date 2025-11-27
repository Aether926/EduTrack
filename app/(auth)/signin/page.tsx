"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        const {
            data: { session },
        } = await supabase.auth.getSession();

        console.log(session);

        setMessage("Login successful!");
        router.push("/dashboard");
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
            <div className="w-full max-w-sm bg-neutral-300 p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4 text-gray-800">
                    Log In
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-500 rounded"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-500 rounded"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        Submit
                    </button>
                </form>

                {message && (
                    <p className="mt-3 text-center text-sm text-gray-800">
                        {message}
                    </p>
                )}

                <div className="flex items-center my-4">
                    <span className="flex-grow h-px bg-gray-500"></span>
                    <span className="px-2 text-gray-700 text-sm">or</span>
                    <span className="flex-grow h-px bg-gray-500"></span>
                </div>

                <p className="text-center text-sm text-gray-700">
                    No Account?{" "}
                    <a href="/signUp" className="text-blue-600">
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
}
