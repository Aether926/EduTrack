"use client";

import ProfileForm from "@/components/profile-form";
import { redirect } from "next/navigation";

export default function fillUp() {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
            <div className="w-full max-w-lg p-6">
                <ProfileForm submitHandler={handleSubmit} />
            </div>
        </div>
    );
}
