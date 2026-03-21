"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarRange, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

import TrainingCalendar from "@/features/dashboard/component/training-calendar";
import SalaryEligibilityOverview from "@/features/dashboard/component/salary-eligibility-overview";

import type { CalendarEvent } from "@/lib/database/calendar";
import type { TeacherEligibilityRow } from "@/lib/database/salary-eligibility";

interface DashboardRightPanelProps {
    events: CalendarEvent[];
    eligibilityData: TeacherEligibilityRow[];
    eligibilityCount: number;
}

export default function DashboardRightPanel({
    events,
    eligibilityData,
    eligibilityCount,
}: DashboardRightPanelProps) {
    return (
        <Tabs defaultValue="calendar">
            <div className="px-4 pt-3 pb-0 border-b border-border/60">
                <TabsList className="w-full h-9 bg-muted/40">
                    <TabsTrigger
                        value="calendar"
                        className="flex-1 gap-1.5 text-xs"
                    >
                        <CalendarRange className="h-3.5 w-3.5" />
                        Calendar
                        {events.length > 0 && (
                            <span className="inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold px-1">
                                {events.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="eligibility"
                        className="flex-1 gap-1.5 text-xs"
                    >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Eligibility
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* Strip the inner Card from TrainingCalendar by letting it render inside our Card */}
            <TabsContent value="calendar" className="mt-0">
                <TrainingCalendar events={events} />
            </TabsContent>

            <TabsContent value="eligibility" className="mt-0">
                <SalaryEligibilityOverview
                    data={eligibilityData}
                    count={eligibilityCount}
                />
            </TabsContent>
        </Tabs>
    );
}
