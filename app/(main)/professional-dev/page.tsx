import TrainingsSeminars from "@/components/trainings-seminars";
import { getMyTrainingSeminars } from "@/lib/database/trainings";

export default async function TrainingsSeminarsPage() {
  const rows = await getMyTrainingSeminars();

  return (
    <div className="px-4">
      <div className="flex justify-center text-3xl font-semibold mt-4">
        Trainings and Seminars
      </div>

      <TrainingsSeminars data={rows} />
    </div>
  );
}
