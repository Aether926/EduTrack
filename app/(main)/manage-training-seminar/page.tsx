import { redirect } from "next/navigation";
import { getUser, createClient } from "@/lib/supabase/server";
import TrainingSeminars, { TrainingSeminarRow } from "@/components/tables/trainings-seminars";

export const revalidate = 60;

export default async function TrainingSeminarsPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const supabase = await createClient();

    const { data: rows } = await supabase
        .from("Attendance")
        .select(`
            id,
            status,
            ProfessionalDevelopment (
                id, type, title, level,
                startDate, endDate, totalHours, sponsor
            )
        `)
        .eq("userId", user.id);

    type AttendanceRow = {
        id: string;
        status: string;
        ProfessionalDevelopment: {
            id: string; type: string; title: string; level: string;
            startDate: string; endDate: string; totalHours: string; sponsor: string;
        };
    };

    const data: TrainingSeminarRow[] = ((rows ?? []) as unknown as AttendanceRow[]).map((row) => ({
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

    return (
        <div className="w-full p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Trainings and Seminars</h1>
            <TrainingSeminars data={data} />
        </div>
    );
}