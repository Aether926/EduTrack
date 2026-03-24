// import { useState, useCallback } from "react";
// import { toast } from "sonner";

// import {
//   fetchEducationBackgroundToState,
//   saveEducationBackgroundFromState,
// } from "@/features/profiles/actions/education-background-action";

// import type {
//   EducationByLevel,
//   EducationLevel,
//   ProfileEducation,
// } from "@/features/profiles/types/education-background";
// import { getInitialEducationByLevel } from "@/features/profiles/types/education-background";

// export function useEducationBackground(profileId: string) {
//   const [education, setEducation] = useState<EducationByLevel>(
//     getInitialEducationByLevel(profileId)
//   );
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const fetchData = useCallback(async () => {
//     if (!profileId) return;
//     setLoading(true);
//     try {
//       const result = await fetchEducationBackgroundToState(profileId);
//       setEducation(result);
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to load education background."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [profileId]);

//   const handleChange = useCallback(
//     (level: EducationLevel, field: keyof ProfileEducation, value: string) => {
//       setEducation((prev) => ({
//         ...prev,
//         [level]: { ...prev[level], [field]: value },
//       }));
//     },
//     []
//   );

//   const saveData = useCallback(async (): Promise<boolean> => {
//     if (!profileId) return false;
//     setSaving(true);
//     try {
//       await saveEducationBackground(profileId, education);
//       toast.success("Education background saved successfully.");
//       await fetchData();
//       return true;
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to save education background."
//       );
//       return false;
//     } finally {
//       setSaving(false);
//     }
//   }, [profileId, education, fetchData]);

//   return {
//     education,
//     loading,
//     saving,
//     fetchData,
//     handleChange,
//     saveData,
//   };
// }