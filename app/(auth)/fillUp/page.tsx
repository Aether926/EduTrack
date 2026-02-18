"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

import {
    cleanNameInput,
    formatName,
    cleanMiddleInitial,
    calculateAge,
} from "@/app/util/helper";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FillUpPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        middleInitial: "",
        contactNumber: "",
    });

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/signin");
                return;
            }

            const { data: profile } = await supabase
                .from("User")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                router.push("/pending-approval");
                return;
            }

            setUser(user);
            setLoading(false);
        };

        checkUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        let success = false;

        try {
            const { error: userError } = await supabase.from("User").upsert({
                id: user.id,
                email: user.email,
                role: "TEACHER",
                status: "PENDING",
            });

            if (userError) {
                alert(`Error creating user: ${userError.message}`);
                return;
            }

            const { error: profileError } = await supabase
                .from("Profile")
                .upsert(
                    {
                        id: user.id,
                        email: user.email,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        middleInitial: formData.middleInitial,
                        contactNumber: formData.contactNumber,
                    },
                    { onConflict: "id" }
                );

            if (profileError) {
                alert(`Error creating profile: ${profileError.message}`);
                setSubmitting(false);
                return;
            }

            success = true;
            router.push("/pending-approval");
        } catch (error) {
            console.error("Submission error:", error);
            alert("An error occurred. Please try again.");
            setSubmitting(false);
        } finally {
            if (!success) {
                setSubmitting(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-200 flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
            <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    Complete Your Profile
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* first name */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            First Name *
                        </label>
                        <Input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => {
                                const cleaned = cleanNameInput(e.target.value);
                                setFormData({
                                    ...formData,
                                    firstName: cleaned,
                                });
                            }}
                            onBlur={() => {
                                // Format only when user finishes typing
                                setFormData({
                                    ...formData,
                                    firstName: formatName(formData.firstName),
                                });
                            }}
                            required
                            placeholder="Enter first name"
                        />
                    </div>

                    {/* last name */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Last Name *
                        </label>
                        <Input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => {
                                const cleaned = cleanNameInput(e.target.value);
                                setFormData({
                                    ...formData,
                                    lastName: cleaned,
                                });
                            }}
                            onBlur={() => {
                                // Format only when user finishes typing
                                setFormData({
                                    ...formData,
                                    lastName: formatName(formData.lastName),
                                });
                            }}
                            required
                            placeholder="Enter last name"
                        />
                    </div>

                    {/* middle initial */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Middle Initial
                        </label>
                        <Input
                            type="text"
                            maxLength={2} // <-- FIX 3: Changed from 1 to 2 to allow the dot
                            value={formData.middleInitial}
                            onChange={(e) => {
                                const cleaned = cleanMiddleInitial(
                                    e.target.value
                                );
                                setFormData({
                                    ...formData,
                                    middleInitial: cleaned,
                                });
                            }}
                            placeholder="Optional"
                        />
                    </div>

                    {/* contact number */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Contact Number *
                        </label>
                        <Input
                            type="tel"
                            value={formData.contactNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    contactNumber: e.target.value,
                                })
                            }
                            required
                            placeholder="+63 XXX XXX XXXX"
                        />
                    </div>

                    {/* email display */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Email (from account)
                        </label>
                        <Input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="bg-gray-100"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full"
                    >
                        {submitting ? "Submitting..." : "Submit for Approval"}
                    </Button>
                </form>
            </div>
        </div>
    );
}