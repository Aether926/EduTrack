import AddTrainingAndSeminar from "@/components/add-training-and-seminar";
import { getAllProfessionalDevelopment } from "@/lib/database/professional-development";
import { TrainingSeminarTableRow, ProfessionalDevelopment } from "@/lib/user";
import { format } from "date-fns";

export default async function AddTrainingSeminarPage() {
    const professionalDev = await getAllProfessionalDevelopment();

    const tableData: TrainingSeminarTableRow[] = professionalDev.map((item: ProfessionalDevelopment) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        level: item.level,
        date: format(new Date(item.start_date), "MMM dd, yyyy"),
        totalHours: item.total_hours,
        sponsor: item.sponsoring_agency,
        raw: item, 
    }));

    return (
        <div className="w-full p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Training & Seminar Management</h1>
                <p className="text-muted-foreground mt-2">
                    Add and manage professional development records for teachers
                </p>
            </div>
            <AddTrainingAndSeminar data={tableData} />
        </div>
    );
}