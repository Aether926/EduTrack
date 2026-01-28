"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FillUpPage() {
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
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.push("/signin");
                return;
            }
            
        
            const { data: profile } = await supabase    
                .from("User")
                .upsert("*")
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

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.contactNumber.trim()) {
        toast.error("Please fill in all required fields.");
        setSubmitting(false);
        return;
    }

    try {
     
        const { data: existingUser } = await supabase
            .from("User")
            .select("id, status")
            .eq("id", user.id)
            .single();

       
        if (!existingUser) {
            const { error: userError } = await supabase
                .from("User")
                .insert({
                    id: user.id,
                    email: user.email,
                    role: "TEACHER",
                    status: "PENDING",
                });

            if (userError) {
                toast.error(`Error creating user: ${userError.message}`);
                setSubmitting(false);
                return;
            }
        }

        
        const { error: profileError } = await supabase
            .from("Profile")
            .upsert({
                id: user.id,
                email: user.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleInitial: formData.middleInitial,
                contactNumber: formData.contactNumber,
            }, { onConflict: "id" });

        if (profileError) {
            toast.error(`Error saving profile: ${profileError.message}`);
            setSubmitting(false);
            return;
        }

        
        if (existingUser?.status === "APPROVED") {
            router.push("/dashboard");
        } else {
            router.push("/pending-approval");
        }
    } catch (error) {
        console.error("Submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
        setSubmitting(false);
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
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            First Name *
                        </label>
                        <Input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            required
                            placeholder="Enter first name"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Last Name *
                        </label>
                        <Input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            required
                            placeholder="Enter last name"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Middle Initial
                        </label>
                        <Input
                            type="text"
                            maxLength={1}
                            value={formData.middleInitial}
                            onChange={(e) => setFormData({...formData, middleInitial: e.target.value.toUpperCase()})}
                            placeholder="Optional"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Contact Number *
                        </label>
                        <Input
                            type="tel"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                            required
                            placeholder="+63 XXX XXX XXXX"
                        />
                    </div>

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
