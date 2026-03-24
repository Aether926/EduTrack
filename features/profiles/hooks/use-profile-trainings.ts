import { useCallback, useState } from "react";
import { getProfileTrainings } from "@/features/profiles/actions/profile-trainings-action";
import type { TrainingRow } from "@/features/profiles/types/trainings";
import { toast } from "sonner";

export function useProfileTrainings() {
  const [trainings, setTrainings] = useState<TrainingRow[]>([]);
  const [trainingsLoading, setTrainingsLoading] = useState(false);

  const loadTrainings = useCallback(async (teacherId: string) => {
    setTrainingsLoading(true);
    try {
      const rows = await getProfileTrainings(teacherId);
      setTrainings(rows);
    } catch {
      toast.error("Failed to load trainings");
      setTrainings([]);
    } finally {
      setTrainingsLoading(false);
    }
  }, []);

  return { trainings, trainingsLoading, loadTrainings };
}