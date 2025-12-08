"use client";
import { use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PendingApproval({
    params,
}: {
    params: Promise<{ status: string }>;
}) {
    const { status: statusParam } = use(params);
    const router = useRouter();

    console.log(statusParam);

    return (
        <div className="min-h-screen bg-black-200 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow text-center">
                {statusParam === "REJECTED" ? (
                    <>
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold mb-4 text-red-800">
                            Account Rejected
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Your account has been reviewed and was not approved.
                            Please contact the administrator for more
                            information.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-6xl mb-4">⏳</div>
                        <h1 className="text-2xl font-bold mb-4 text-gray-800">
                            Waiting for Admin Approval
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Your profile has been submitted successfully. An
                            administrator will review your information shortly.
                        </p>
                        <p className="text-sm text-gray-500">
                            You&apos;ll receive an email notification once your
                            account is approved.
                        </p>
                        <button
                            onClick={() =>
                                supabase.auth
                                    .signOut()
                                    .then(() => router.push("/signin"))
                            }
                            className="mt-6 text-blue-600 hover:underline"
                        >
                            Sign Out
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
