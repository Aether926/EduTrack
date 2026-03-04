"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TrainingSeminars, {
    TrainingSeminarRow,
} from "@/components/tables/trainings-seminars";

export default function TrainingSeminarsPage() {
    const [data, setData] = useState<TrainingSeminarRow[]>([]);
    const [loading, setLoading] = useState(true);

    type AttendanceRow = {
        id: string;
        status: string;
        ProfessionalDevelopment: {
            id: string;
            type: string;
            title: string;
            level: string;
            startDate: string;
            endDate: string;
            totalHours: string;
            sponsor: string;
        };
    };

    useEffect(() => {
        const loadData = async () => {
            const { data: session } = await supabase.auth.getSession();
            const authUser = session.session?.user;

            if (!authUser) {
                setLoading(false);
                return;
            }

            // Fetch attendances with related ProfessionalDevelopment data
            const { data: rows, error } = await supabase
                .from("Attendance")
                .select(
                    `
                    id,
                    status,
                    ProfessionalDevelopment (
                        id,
                        type,
                        title,
                        level,
                        startDate,
                        endDate,
                        totalHours,
                        sponsor
                    )
                `,
                )
                .eq("userId", authUser.id);

            if (!error && rows) {
                const mapped: TrainingSeminarRow[] = (
                    rows as unknown as AttendanceRow[]
                ).map((row) => ({
                    id: row.id,
                    trainingId: row.ProfessionalDevelopment.id,
                    type: row.ProfessionalDevelopment.type,
                    title: row.ProfessionalDevelopment.title,
                    level: row.ProfessionalDevelopment.level,
                    startDate: row.ProfessionalDevelopment.startDate,
                    endDate: row.ProfessionalDevelopment.endDate,
                    totalHours: row.ProfessionalDevelopment.totalHours,
                    sponsor: row.ProfessionalDevelopment.sponsor,
                    status: row.status,
                }));
                setData(mapped);
            }

            setLoading(false);
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-6">
            <h1 className="text-3xl font-bold mb-6">
                Manage Trainings and Seminars
            </h1>

            <TrainingSeminars data={data} />
        </div>
    );
}
