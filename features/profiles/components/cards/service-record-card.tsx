import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileState } from "@/features/profiles/types/profile";
import { calculateServiceYears } from "@/features/profiles/lib/date";

export default function ServiceRecordCard(props: { data: ProfileState }) {
    const { data } = props;

    return (
        <Card className="flex-col border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardHeader>
                <CardTitle className="text-white">
                    Service Record (Current School)
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col justify-between bg-white/10 backdrop-blur rounded-lg p-4">
                        <p className="text-sm text-blue-100 mb-2">
                            Years of Original Appointment
                        </p>
                        <div>
                            <p className="text-3xl font-bold">
                                {calculateServiceYears(
                                    data.dateOfOriginalAppointment,
                                )}
                            </p>
                            <p className="text-xs text-blue-200 mt-2">
                                Since Original Appointment
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between bg-white/10 backdrop-blur rounded-lg p-4">
                        <p className="text-sm text-blue-100 mb-2">
                            Years in Current Position
                        </p>
                        <div>
                            <p className="text-3xl font-bold">
                                {calculateServiceYears(
                                    data.dateOfLatestAppointment,
                                )}
                            </p>
                            <p className="text-xs text-blue-200 mt-2">
                                Since latest appointment
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur rounded-lg p-3 text-sm">
                    <p className="text-blue-100">
                        <span className="font-semibold">Note:</span> Date of 
                        original appointment marks when this individual first 
                        entered government service. Latest appointment updates 
                        when promoted within the school.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
