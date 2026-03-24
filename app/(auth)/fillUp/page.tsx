"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import {
    NameInput,
    MiddleInitialInput,
} from "@/components/formatter/name-format";
import {
    ContactInput,
    isValidContact,
} from "@/components/formatter/contact-format";
import {
    EmployeeIdInput,
    isValidEmployeeId,
} from "@/components/formatter/employee-id-format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logSignUp } from "@/app/actions/auth-log-actions";

// ── Calendar constants ─────────────────────────────────────────────────────────
const CAL_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const CAL_MONTHS_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
const CAL_YEAR_BACK = 60;
const CAL_YEAR_FORWARD = 2;
function pad2(n: number) {
    return n < 10 ? `0${n}` : String(n);
}

function MiniCalendar({
    value,
    onChange,
    maxDate,
    minDate,
}: {
    value: Date | undefined;
    onChange: (d: Date) => void;
    maxDate?: Date;
    minDate?: Date;
}) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(
        value?.getFullYear() ?? today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = useState(
        value?.getMonth() ?? today.getMonth(),
    );
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(
        value?.getFullYear() ?? today.getFullYear(),
    );
    const yearListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pickerOpen) return;
        const el = yearListRef.current?.querySelector(
            `[data-year="${pickerYear}"]`,
        ) as HTMLElement | null;
        if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
    }, [pickerOpen, pickerYear]);

    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();
    const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
    const selectedKey = value
        ? `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`
        : null;
    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewYear((y) => y - 1);
            setViewMonth(11);
        } else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewYear((y) => y + 1);
            setViewMonth(0);
        } else setViewMonth((m) => m + 1);
    };

    const years = Array.from(
        { length: CAL_YEAR_BACK + CAL_YEAR_FORWARD + 1 },
        (_, i) => today.getFullYear() - CAL_YEAR_BACK + i,
    );

    return (
        <div className="rounded-lg border border-[#2e2e32] bg-[#1c1c1e] p-3 relative select-none">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-3 px-1">
                <button
                    type="button"
                    onClick={prevMonth}
                    className="rounded-md p-1 hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 text-[#8a8a9a]" />
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setPickerYear(viewYear);
                        setPickerOpen((v) => !v);
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-[#f0f0f0] hover:bg-white/10 transition-colors"
                >
                    {CAL_MONTHS_SHORT[viewMonth]} {viewYear}
                    {pickerOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-[#8a8a9a]" />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-[#8a8a9a]" />
                    )}
                </button>
                <button
                    type="button"
                    onClick={nextMonth}
                    className="rounded-md p-1 hover:bg-white/10 transition-colors"
                >
                    <ChevronRight className="h-4 w-4 text-[#8a8a9a]" />
                </button>
            </div>

            {/* Picker overlay */}
            <AnimatePresence>
                {pickerOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-x-0 top-[2.75rem] z-10 mx-3 rounded-lg border border-[#2e2e32] bg-[#1c1c1e] shadow-lg p-3"
                    >
                        <div className="flex gap-3">
                            {/* Year column */}
                            <div className="flex flex-col gap-0.5 w-16 shrink-0">
                                <p className="text-[10px] font-semibold text-[#555560] uppercase tracking-wide mb-1 text-center">
                                    Year
                                </p>
                                <div
                                    ref={yearListRef}
                                    className="overflow-y-auto max-h-[168px] flex flex-col gap-0.5"
                                    style={{ scrollbarWidth: "none" }}
                                >
                                    {years.map((y) => (
                                        <button
                                            key={y}
                                            type="button"
                                            data-year={y}
                                            onClick={() => setPickerYear(y)}
                                            className={[
                                                "rounded-md py-1.5 text-sm w-full transition-colors",
                                                y === pickerYear
                                                    ? "bg-[#5b8dee]/20 text-[#5b8dee] font-semibold"
                                                    : y === viewYear
                                                      ? "bg-white/10 text-[#f0f0f0] font-semibold"
                                                      : y ===
                                                          today.getFullYear()
                                                        ? "border border-[#5b8dee]/30 text-[#5b8dee] hover:bg-white/10"
                                                        : "hover:bg-white/10 text-[#8a8a9a]",
                                            ].join(" ")}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Divider */}
                            <div className="w-px bg-[#2e2e32] self-stretch" />
                            {/* Month grid */}
                            <div className="flex-1">
                                <p className="text-[10px] font-semibold text-[#555560] uppercase tracking-wide mb-1 text-center">
                                    Month
                                </p>
                                <div className="grid grid-cols-3 gap-1">
                                    {CAL_MONTHS_SHORT.map((m, i) => {
                                        const isCurrent =
                                            i === viewMonth &&
                                            pickerYear === viewYear;
                                        const isNow =
                                            i === today.getMonth() &&
                                            pickerYear === today.getFullYear();
                                        return (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => {
                                                    setViewMonth(i);
                                                    setViewYear(pickerYear);
                                                    setPickerOpen(false);
                                                }}
                                                className={[
                                                    "rounded-md py-2 text-sm transition-colors",
                                                    isCurrent
                                                        ? "bg-[#5b8dee]/20 text-[#5b8dee] font-semibold"
                                                        : isNow
                                                          ? "border border-amber-500/40 text-amber-300 font-semibold hover:bg-white/10"
                                                          : "hover:bg-white/10 text-[#8a8a9a]",
                                                ].join(" ")}
                                            >
                                                {m}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {CAL_DAYS.map((d) => (
                    <div
                        key={d}
                        className="text-center text-[0.72rem] text-[#555560] py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} />;
                    const key = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
                    const isToday = key === todayKey;
                    const isSelected = key === selectedKey;
                    const date = new Date(viewYear, viewMonth, day);
                    const isDisabled =
                        (maxDate && date > maxDate) ||
                        (minDate && date < minDate);
                    return (
                        <button
                            key={key}
                            type="button"
                            disabled={!!isDisabled}
                            onClick={() => onChange(date)}
                            className={[
                                "mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                                isDisabled
                                    ? "opacity-25 cursor-not-allowed"
                                    : isSelected
                                      ? "bg-[#5b8dee] text-white font-semibold"
                                      : isToday
                                        ? "border border-[#5b8dee]/60 text-[#5b8dee] font-semibold hover:bg-white/10"
                                        : "text-[#f0f0f0] hover:bg-white/10",
                            ].join(" ")}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

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
        customPosition: "",
    });

    const [dateOfOriginalAppointment, setDateOfOriginalAppointment] = useState<
        Date | undefined
    >();
    const [dateOfOriginalDeployment, setDateOfOriginalDeployment] = useState<
        Date | undefined
    >();
    const [dateOflatestAppointment, setDateOfLatestAppointment] = useState<
        Date | undefined
    >();

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

    // Generate username client-side to avoid server action auth issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateUsernameClient = async (
        firstName: string,
        lastName: string,
    ): Promise<string> => {
        const base =
            `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}`
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9.]/g, "");

        const { data } = await supabase
            .from("Profile")
            .select("username")
            .ilike("username", `${base}%`);

        const taken = (data ?? []).map((r: any) => r.username); // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!taken.includes(base)) return base;

        let i = 1;
        while (taken.includes(`${base}${i}`)) i++;
        return `${base}${i}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidContact(formData.contactNumber)) {
            toast.error(
                "Contact number must be 11 digits (e.g. 0917-123-4567).",
            );
            return;
        }
        if (!isValidEmployeeId(formData.employeeId)) {
            toast.error("Employee ID must be exactly 7 digits.");
            return;
        }
        if (!dateOfOriginalAppointment) {
            toast.error("Please select your Date of Original Appointment.");
            return;
        }
        if (!dateOfOriginalDeployment) {
            toast.error("Please select your Date of Original Deployment.");
            return;
        }
        if (dateOfOriginalDeployment < dateOfOriginalAppointment) {
            toast.error(
                "Date of Original Deployment cannot be earlier than Date of Original Appointment.",
            );
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
                return;
            }

            // 2. Generate username client-side
            const autoUsername = await generateUsernameClient(
                formData.firstName,
                formData.lastName,
            );

            // 3. Create Profile row
            const { error: profileError } = await supabase
                .from("Profile")
                .upsert(
                    {
                        id: user.id,
                        email: user.email,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        middleInitial: formData.middleInitial.replace(
                            /\.{2,}/g,
                            ".",
                        ),
                        contactNumber: formData.contactNumber,
                        username: autoUsername,
                    },
                    { onConflict: "id" },
                );
            if (profileError) {
                toast.error(`Error creating profile: ${profileError.message}`);
                return;
            }

            // 4. Ensure ProfileHR row exists
            const { error: rpcError } = await supabase.rpc(
                "ensure_profile_hr_exists",
                { p_user_id: user.id },
            );
            if (rpcError) {
                toast.error(
                    `Error initializing HR record: ${rpcError.message}`,
                );
                return;
            }

            // 5. Update ProfileHR with employment details
            const { data: hrData, error: hrError } = await supabase
                .from("ProfileHR")
                .update({
                    employeeId: formData.employeeId,
                    position:
                        formData.position === "Other"
                            ? formData.customPosition
                            : formData.position,
                    dateOfOriginalAppointment: format(
                        dateOfOriginalAppointment,
                        "yyyy-MM-dd",
                    ),
                    dateOfOriginalDeployment: format(
                        dateOfOriginalDeployment,
                        "yyyy-MM-dd",
                    ),
                    dateOfLatestAppointment: format(
                        dateOfOriginalAppointment,
                        "yyyy-MM-dd",
                    ),
                })
                .eq("id", user.id)
                .select();
            if (hrError) {
                toast.error(
                    `Error saving employment details: ${hrError.message}`,
                );
                return;
            }
            if (!hrData || hrData.length === 0) {
                toast.error("HR record not found. Please try again.");
                return;
            }

            // 6. Log signup (non-fatal)
            try {
                await logSignUp(user.id, user.email ?? "");
            } catch {
                // ignore log errors
            }

            success = true;
            router.push("/status");
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
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
                                <div className="w-[30px] h-[30px] bg-[#5b8dee] rounded-[7px] flex items-center justify-center text-sm">
                                    📚
                                </div>
                                <span className="text-[15px] font-bold text-[#f0f0f0]">
                                    EduTrack
                                </span>
                            </div>

                            <h1 className="text-[22px] font-bold text-[#f0f0f0] mb-1">
                                Complete your profile
                            </h1>
                            <p className="text-[13px] text-[#8a8a9a] mb-7">
                                Fill in your details before your account is
                                reviewed
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* ── Personal Info Section ── */}
                                <p className="text-[11px] font-semibold text-[#5b8dee] uppercase tracking-widest">
                                    Personal Information
                                </p>

                                {/* First Name */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        First Name{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <NameInput
                                        className="dark-input"
                                        value={formData.firstName}
                                        onChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                firstName: v,
                                            })
                                        }
                                        required
                                        placeholder="Enter first name"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Last Name{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <NameInput
                                        className="dark-input"
                                        value={formData.lastName}
                                        onChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                lastName: v,
                                            })
                                        }
                                        required
                                        placeholder="Enter last name"
                                    />
                                </div>

                                {/* Middle Initial */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Middle Initial{" "}
                                        <span className="text-[#555560] font-normal">
                                            (optional)
                                        </span>
                                    </label>
                                    <MiddleInitialInput
                                        className="dark-input"
                                        value={formData.middleInitial}
                                        onChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                middleInitial: v,
                                            })
                                        }
                                        placeholder="Optional"
                                    />
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Contact Number{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <ContactInput
                                        className="dark-input"
                                        value={formData.contactNumber}
                                        onChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                contactNumber: v,
                                            })
                                        }
                                        required
                                        placeholder="+63 XXX XXX XXXX"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Email{" "}
                                        <span className="text-[#555560] font-normal">
                                            (from account)
                                        </span>
                                    </label>
                                    <Input
                                        type="email"
                                        className="dark-input"
                                        value={user?.email || ""}
                                        disabled
                                    />
                                </div>

                                {/* ── Employment Info Section ── */}
                                <p className="text-[11px] font-semibold text-[#5b8dee] uppercase tracking-widest pt-2">
                                    Employment Information
                                </p>

                                {/* Employee ID */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Employee ID{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <EmployeeIdInput
                                        className="dark-input"
                                        value={formData.employeeId}
                                        onChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                employeeId: v,
                                            })
                                        }
                                        required
                                        placeholder="Enter employee ID"
                                    />
                                </div>

                                {/* Position */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Position{" "}
                                        <span className="text-[#555560] font-normal">
                                            (optional)
                                        </span>
                                    </label>
                                    <Select
                                        value={formData.position}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                position: value,
                                                customPosition: "",
                                            })
                                        }
                                        required
                                    >
                                        <SelectTrigger className="w-full bg-[#1c1c1e] border-[#2e2e32] text-[13.5px] text-[#f0f0f0] focus:ring-[#5b8dee]/20 focus:border-[#5b8dee] rounded-lg">
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1c1c1e] border-[#2e2e32] text-[#f0f0f0]">
                                            {[
                                                "Teacher I",
                                                "Teacher II",
                                                "Teacher III",
                                                "Teacher IV",
                                                "Teacher V",
                                                "Teacher VI",
                                                "Teacher VII",
                                                "Master Teacher I",
                                                "Master Teacher II",
                                                "Master Teacher III",
                                                "Master Teacher IV",
                                                "Master Teacher V",
                                                "Head Teacher I",
                                                "Head Teacher II",
                                                "Head Teacher III",
                                                "Head Teacher IV",
                                                "Head Teacher V",
                                                "Head Teacher VI",
                                                "Assistant School Principal I",
                                                "Assistant School Principal II",
                                                "Assistant School Principal III",
                                                "Assistant School Principal IV",
                                                "School Principal I",
                                                "School Principal II",
                                                "School Principal III",
                                                "School Principal IV",
                                                "School Principal V",
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

                                    {formData.position === "Other" && (
                                        <div className="mt-2">
                                            <Input
                                                type="text"
                                                className="dark-input"
                                                value={formData.customPosition}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        customPosition:
                                                            e.target.value,
                                                    })
                                                }
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
                                        Date of Original Appointment{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <p className="text-[11px] text-[#555560] mb-2">
                                        First day as a DepEd employee
                                    </p>
                                    <MiniCalendar
                                        value={dateOfOriginalAppointment}
                                        onChange={setDateOfOriginalAppointment}
                                        maxDate={new Date()}
                                    />
                                </div>

                                {/* Date of Original Deployment */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Date of Original Deployment{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <p className="text-[11px] text-[#555560] mb-2">
                                        First day at Valencia National High
                                        School
                                    </p>
                                    <MiniCalendar
                                        value={dateOfOriginalDeployment}
                                        onChange={setDateOfOriginalDeployment}
                                        maxDate={new Date()}
                                        minDate={dateOfOriginalAppointment}
                                    />
                                </div>

                                {/* Latest Appointment */}
                                <div>
                                    <label className="block mb-1.5 text-[12.5px] font-medium text-[#8a8a9a]">
                                        Date of Latest Appointment{" "}
                                        <span className="text-[#555560] font-normal">
                                            (optional)
                                        </span>
                                    </label>
                                    <p className="text-[11px] text-[#555560] mb-2">
                                        Most recent promotion date, if
                                        applicable
                                    </p>
                                    <MiniCalendar
                                        value={dateOflatestAppointment}
                                        onChange={setDateOfLatestAppointment}
                                        maxDate={new Date()}
                                    />
                                    {dateOflatestAppointment && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDateOfLatestAppointment(undefined)
                                            }
                                            className="mt-1.5 text-[11px] text-[#555560] hover:text-[#8a8a9a] transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-white text-[#0a0a0b] hover:opacity-90 rounded-lg text-[13.5px] font-semibold py-2.5 mt-2 transition-all active:scale-[0.99]"
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit for Approval"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
