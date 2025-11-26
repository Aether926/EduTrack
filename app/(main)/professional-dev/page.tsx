import TrainingsSeminars from "@/components/trainings-seminars";
import ProtectedPage from "@/components/protected-page";

export default function TrainingsSeminarsPage() {
    return (
        <ProtectedPage>
        <div className="px-4">
            <div className="flex justify-center text-3xl font-semibold mt-4">
                Trainings and Seminars
            </div>
            <TrainingsSeminars />
        </div>
        </ProtectedPage>
    );
}
