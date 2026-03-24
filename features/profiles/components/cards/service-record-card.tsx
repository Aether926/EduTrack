import React from "react";
import { Clock, CalendarDays, MapPin, Award, BadgeCheck } from "lucide-react";
import type { ProfileState } from "@/features/profiles/types/profile";
import { calculateServiceYears } from "@/features/profiles/lib/date";
import LoyaltyServiceCard from "@/components/loyalty-service-card";

export default function ServiceRecordCard(props: { data: ProfileState }) {
    const { data } = props;

    return (
        <div className="border border-border/60 shadow-lg w-full overflow-hidden rounded-xl bg-card">
            {/* Header band */}
            <div className="relative px-6 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                <div className="relative flex items-center gap-2.5">
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-base font-semibold text-foreground">
                        Service Record (Current School)
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-5 space-y-4">
                <div className="flex flex-col gap-3">
                    {/* Original Appointment — Amber */}
                    <div className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-amber-500/8 px-4 py-3.5">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none" />
                        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-1.5 shrink-0">
                                    <Award className="h-3.5 w-3.5 text-amber-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-widest">
                                        Original Appointment
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        First day as a DepEd employee
                                    </p>
                                </div>
                            </div>
                            <div className="sm:text-right shrink-0 pl-9 sm:pl-0">
                                <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">
                                    {calculateServiceYears(
                                        data.dateOfOriginalAppointment,
                                    )}
                                </p>
                                <p className="text-[10px] text-muted-foreground flex items-center sm:justify-end gap-1 mt-0.5">
                                    <CalendarDays
                                        size={9}
                                        className="shrink-0"
                                    />
                                    in service
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Original Deployment — Emerald */}
                    <div className="relative overflow-hidden rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3.5">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
                        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5 shrink-0">
                                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-widest">
                                        Original Deployment
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        First assigned to this school
                                    </p>
                                </div>
                            </div>
                            <div className="sm:text-right shrink-0 pl-9 sm:pl-0">
                                <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">
                                    {calculateServiceYears(
                                        data.dateOfOriginalDeployment,
                                    )}
                                </p>
                                <p className="text-[10px] text-muted-foreground flex items-center sm:justify-end gap-1 mt-0.5">
                                    <CalendarDays
                                        size={9}
                                        className="shrink-0"
                                    />
                                    at this school
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Current Position — Violet */}
                    <div className="relative overflow-hidden rounded-lg border border-violet-500/20 bg-violet-500/8 px-4 py-3.5">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent pointer-events-none" />
                        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="rounded-md border border-violet-500/20 bg-violet-500/10 p-1.5 shrink-0">
                                    <BadgeCheck className="h-3.5 w-3.5 text-violet-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-violet-400/80 uppercase tracking-widest">
                                        Current Position
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Time held since last promotion
                                    </p>
                                </div>
                            </div>
                            <div className="sm:text-right shrink-0 pl-9 sm:pl-0">
                                <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">
                                    {calculateServiceYears(
                                        data.dateOfLatestAppointment,
                                    )}
                                </p>
                                <p className="text-[10px] text-muted-foreground flex items-center sm:justify-end gap-1 mt-0.5">
                                    <CalendarDays
                                        size={9}
                                        className="shrink-0"
                                    />
                                    in position
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Award — Rose (NEW) */}
                    <LoyaltyServiceCard
                        dateOfOriginalAppointment={
                            data.dateOfOriginalAppointment
                        }
                    />
                </div>

                {/* Note */}
                <div className="rounded-md border border-border/40 bg-muted/30 px-4 py-3 text-[11.5px] text-muted-foreground leading-relaxed space-y-1">
                    <p>
                        <span className="text-amber-400/90 font-semibold">
                            Original Appointment
                        </span>{" "}
                        — the date this individual officially became a DepEd
                        employee, regardless of school.
                    </p>
                    <p>
                        <span className="text-emerald-400/90 font-semibold">
                            Original Deployment
                        </span>{" "}
                        — the date they were first stationed at this specific
                        school.
                    </p>
                    <p>
                        <span className="text-violet-400/90 font-semibold">
                            Current Position
                        </span>{" "}
                        — how long they have held their present role since their
                        most recent promotion.
                    </p>
                    <p>
                        <span className="text-rose-400/90 font-semibold">
                            Loyalty Award
                        </span>{" "}
                        — countdown to the next loyalty milestone (10 years
                        first; every 5 years after), based on the original DepEd
                        appointment date.
                    </p>
                </div>
            </div>
        </div>
    );
}
