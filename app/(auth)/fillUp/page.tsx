"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    cleanNameInput,
    formatName,
    cleanMiddleInitial,
} from "@/app/util/helper";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logSignUp } from "@/app/actions/auth-log-actions";

export default function FillUpPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        middleInitial: "",
        contactNumber: "",
        employeeId: "",
        position: "",
        customPosition: ""
    });

    const [dateOfOriginalAppointment, setDateOfOriginalAppointment] = useState<Date | undefined>();
    const [dateOfOriginalDeployment, setDateOfOriginalDeployment] = useState<Date | undefined>();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

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
                router.push("/status");
                return;
            }

            setUser(user);
            setLoading(false);
        };

        checkUser();
    }, [router]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (cardRef.current && glowRef.current) {
                const rect = cardRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const angle =
                    Math.atan2(y - rect.height / 2, x - rect.width / 2) *
                        (180 / Math.PI) + 90 + 180;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate dates
        if (!dateOfOriginalAppointment) {
            toast.error("Please select your Date of Original Appointment.");
            return;
        }
        if (!dateOfOriginalDeployment) {
            toast.error("Please select your Date of Original Deployment.");
            return;
        }
        if (dateOfOriginalDeployment < dateOfOriginalAppointment) {
            toast.error("Date of Original Deployment cannot be earlier than Date of Original Appointment.");
            return;
        }

        setSubmitting(true);
        let success = false;

        try {
            // 1. Create User row
            const { error: userError } = await supabase.from("User").upsert({
                id: user.id,
                auth_id: user.id,
                email: user.email,
                role: "TEACHER",
                status: "PENDING",
            });

            if (userError) {
                toast.error(`Error creating user: ${userError.message}`);
                setSubmitting(false);
                return;
            }

            // 2. Create Profile row
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
                    { onConflict: "id" },
                );

            if (profileError) {
                toast.error(`Error creating profile: ${profileError.message}`);
                setSubmitting(false);
                return;
            }

            // 3. Ensure ProfileHR row exists
            await supabase.rpc("ensure_profile_hr_exists", { p_user_id: user.id });

            // 4. Update ProfileHR with employment details
            const { error: hrError } = await supabase
                .from("ProfileHR")
                .update({
                    employeeId: formData.employeeId,
                    position: formData.position === "Other" ? formData.customPosition : formData.position,
                    dateOfOriginalAppointment: format(dateOfOriginalAppointment, "yyyy-MM-dd"),
                    dateOfOriginalDeployment: format(dateOfOriginalDeployment, "yyyy-MM-dd"),
                })
                .eq("id", user.id);

            if (hrError) {
                toast.error(`Error saving employment details: ${hrError.message}`);
                setSubmitting(false);
                return;
            }

            success = true;
            try {
            await logSignUp(user.id, user.email ?? "")
            } catch {

            }
            router.push("/status");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            if (!success) setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <style>{`body { background-color: #09090b; }`}</style>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-[#555560] text-sm">Loading...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{`
                @property --angle {
                    syntax: "<angle>";
                    initial-value: 0deg;
                    inherits: false;
                }
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
                .dark-input {
                    background-color: #1c1c1e !important;
                    border-color: #2e2e32 !important;
                    color: #f0f0f0 !important;
                    font-size: 13.5px !important;
                    border-radius: 8px !important;
                }
                .dark-input::placeholder { color: #555560 !important; }
                .dark-input:focus {
                    border-color: #5b8dee !important;
                    box-shadow: 0 0 0 2px rgba(91,141,238,0.1) !important;
                    outline: none !important;
                }
                .dark-input:disabled { opacity: 0.4 !important; cursor: not-allowed !important; }
            `}</style>

            <div className="bg-dots" />
            <div className="spotlight" ref={spotlightRef} />

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
                <div className="relative w-full max-w-md" ref={cardRef}>
                    <div className="glow-ring" ref={glowRef} />
                    <div className="relative bg-[#141415] border border-[#2a2a2d] rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-8">
                            {/* Logo */}
                            <div className="flex items-center gap-2 mb-7">
                                <div className="w-[30px] h-[30px] bg-[#5b8dee] rounded-[7px] flex items-center justify-center text-sm">📚</div>
                                <span className="text-[15px] font-bold text-[#f0f0f0]">EduTrack</span>
                            </div>

                            <h1 className="text-[22px] font-bold text-[#f0f0f0] mb-1">Complete your profile</h1>
                            <p className="text-[13px] text-[#8a8a9a] mb-7">
                                Fill in your details before your account is reviewed
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* ── Personal Info Section ── */}
                                <p className="text-[11px] font-semibold text-[#5b8dee] uppercase tracking-widest">
                                    Personal Information
                                </p>

                                {/* First Name */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">First Name *</label>
                                    <Input
                                        type="text"
                                        className="dark-input"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: cleanNameInput(e.target.value) })}
                                        onBlur={() => setFormData({ ...formData, firstName: formatName(formData.firstName) })}
                                        required
                                        placeholder="Enter first name"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">Last Name *</label>
                                    <Input
                                        type="text"
                                        className="dark-input"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: cleanNameInput(e.target.value) })}
                                        onBlur={() => setFormData({ ...formData, lastName: formatName(formData.lastName) })}
                                        required
                                        placeholder="Enter last name"
                                    />
                                </div>

                                {/* Middle Initial */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Middle Initial <span className="text-[#555560] font-normal">(optional)</span>
                                    </label>
                                    <Input
                                        type="text"
                                        className="dark-input"
                                        maxLength={2}
                                        value={formData.middleInitial}
                                        onChange={(e) => setFormData({ ...formData, middleInitial: cleanMiddleInitial(e.target.value) })}
                                        placeholder="Optional"
                                    />
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">Contact Number *</label>
                                    <Input
                                        type="tel"
                                        className="dark-input"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        required
                                        placeholder="+63 XXX XXX XXXX"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Email <span className="text-[#555560] font-normal">(from account)</span>
                                    </label>
                                    <Input type="email" className="dark-input" value={user?.email || ""} disabled />
                                </div>

                                {/* ── Employment Info Section ── */}
                                <p className="text-[11px] font-semibold text-[#5b8dee] uppercase tracking-widest pt-2">
                                    Employment Information
                                </p>

                                {/* Employee ID */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">Employee ID *</label>
                                    <Input
                                        type="text"
                                        className="dark-input"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                        required
                                        placeholder="Enter employee ID"
                                    />
                                </div>

                                {/* Position */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Position *
                                    </label>
                                    <Select
                                        value={formData.position}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            position: value,
                                            customPosition: "",
                                        })}
                                        required
                                    >
                                        <SelectTrigger className="w-full bg-[#1c1c1e] border-[#2e2e32] text-[13.5px] text-[#f0f0f0] focus:ring-[#5b8dee]/20 focus:border-[#5b8dee] rounded-lg">
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1c1c1e] border-[#2e2e32] text-[#f0f0f0]">
                                            {[
                                                "Teacher I", "Teacher II", "Teacher III",
                                                "Teacher IV", "Teacher V", "Teacher VI", "Teacher VII",
                                                "Master Teacher I", "Master Teacher II",
                                                "Master Teacher III", "Master Teacher IV",
                                                "School Principal I", "School Principal II",
                                                "School Principal III", "School Principal IV",
                                                "Administrative Staff",
                                            ].map((pos) => (
                                                <SelectItem
                                                    key={pos}
                                                    value={pos}
                                                    className="text-[13px] focus:bg-[#2e2e32] focus:text-[#f0f0f0] cursor-pointer"
                                                >
                                                    {pos}
                                                </SelectItem>
                                            ))}
                                            <SelectItem
                                                value="Other"
                                                className="text-[13px] text-[#8a8a9a] focus:bg-[#2e2e32] focus:text-[#f0f0f0] cursor-pointer"
                                            >
                                                Other (not listed)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Custom position input */}
                                    {formData.position === "Other" && (
                                        <div className="mt-2">
                                            <Input
                                                type="text"
                                                className="dark-input"
                                                value={formData.customPosition}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    customPosition: e.target.value,
                                                })}
                                                required
                                                placeholder="Enter your position"
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Date of Original Appointment */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Date of Original Appointment *
                                    </label>
                                    <p className="text-[11px] text-[#555560] mb-2">First day as a DepEd employee</p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13.5px] transition-colors",
                                                    "bg-[#1c1c1e] border-[#2e2e32] hover:border-[#5b8dee]",
                                                    dateOfOriginalAppointment ? "text-[#f0f0f0]" : "text-[#555560]"
                                                )}
                                            >
                                                <CalendarIcon className="h-4 w-4 text-[#777786] shrink-0" />
                                                {dateOfOriginalAppointment
                                                    ? format(dateOfOriginalAppointment, "MMMM d, yyyy")
                                                    : "Select date"}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#1c1c1e] border-[#2e2e32]" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateOfOriginalAppointment}
                                                onSelect={setDateOfOriginalAppointment}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                                captionLayout="dropdown"
                                                fromYear={1970}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Date of Original Deployment */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Date of Original Deployment *
                                    </label>
                                    <p className="text-[11px] text-[#555560] mb-2">First day at Valencia National High School</p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13.5px] transition-colors",
                                                    "bg-[#1c1c1e] border-[#2e2e32] hover:border-[#5b8dee]",
                                                    dateOfOriginalDeployment ? "text-[#f0f0f0]" : "text-[#555560]"
                                                )}
                                            >
                                                <CalendarIcon className="h-4 w-4 text-[#777786] shrink-0" />
                                                {dateOfOriginalDeployment
                                                    ? format(dateOfOriginalDeployment, "MMMM d, yyyy")
                                                    : "Select date"}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#1c1c1e] border-[#2e2e32]" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateOfOriginalDeployment}
                                                onSelect={setDateOfOriginalDeployment}
                                                disabled={(date) =>
                                                    date > new Date() ||
                                                    (dateOfOriginalAppointment ? date < dateOfOriginalAppointment : false)
                                                }
                                                initialFocus
                                                captionLayout="dropdown"
                                                fromYear={1970}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-white text-[#0a0a0b] hover:opacity-90 rounded-lg text-[13.5px] font-semibold py-2.5 mt-2 transition-all active:scale-[0.99]"
                                >
                                    {submitting ? "Submitting..." : "Submit for Approval"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}