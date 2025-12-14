import TrainingsSeminars from "@/components/tables/trainings-seminars";
import ProtectedPage from "@/components/protected-page";

export default function TrainingsSeminarsPage() {
    return (
        <ProtectedPage>
            <div className="px-4">
                <div className="flex justify-center text-3xl font-semibold mt-4">
                    Training and Seminar Records
                </div>
                <TrainingsSeminars />
            </div>
        </ProtectedPage>
    );
}
