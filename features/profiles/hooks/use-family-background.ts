import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchFamilyBackground,
  saveFamilyBackground,
  saveChildren,
} from "@/features/profiles/actions/family-background-action";
import type {
  ProfileFamily,
  ProfileChild,
  FamilyBackgroundState,
} from "@/features/profiles/types/family-background";
import {
  getInitialFamily,
  getInitialChild,
} from "@/features/profiles/types/family-background";

export function useFamilyBackground(profileId: string) {
  const [family, setFamily] = useState<ProfileFamily>(getInitialFamily(profileId));
  const [children, setChildren] = useState<ProfileChild[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    
    setLoading(true);
    try {
      const result = await fetchFamilyBackground(profileId);

      if (result.family) {
        setFamily({
          ...getInitialFamily(profileId),
          ...result.family,
          // Nullish fallbacks so inputs are never uncontrolled
          spouseSurname: result.family.spouseSurname ?? "",
          spouseFirstName: result.family.spouseFirstName ?? "",
          spouseMiddleName: result.family.spouseMiddleName ?? "",
          spouseNameExtension: result.family.spouseNameExtension ?? "",
          spouseOccupation: result.family.spouseOccupation ?? "",
          spouseEmployerName: result.family.spouseEmployerName ?? "",
          spouseBusinessAddress: result.family.spouseBusinessAddress ?? "",
          spouseTelephoneNo: result.family.spouseTelephoneNo ?? "",
          fatherSurname: result.family.fatherSurname ?? "",
          fatherFirstName: result.family.fatherFirstName ?? "",
          fatherMiddleName: result.family.fatherMiddleName ?? "",
          fatherNameExtension: result.family.fatherNameExtension ?? "",
          motherSurname: result.family.motherSurname ?? "",
          motherFirstName: result.family.motherFirstName ?? "",
          motherMiddleName: result.family.motherMiddleName ?? "",
        });
      }

      setChildren(
        result.children.map((c) => ({
          ...c,
          dateOfBirth: c.dateOfBirth ?? "",
        }))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load family background.");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // ─── Family field change ─────────────────────────────────────────────────────

  const handleFamilyChange = useCallback(
    (field: keyof ProfileFamily, value: string) => {
      setFamily((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // ─── Children CRUD ───────────────────────────────────────────────────────────

  const addChild = useCallback(() => {
    setChildren((prev) => [...prev, getInitialChild(profileId)]);
  }, [profileId]);

  const updateChild = useCallback(
    (index: number, field: keyof ProfileChild, value: string) => {
      setChildren((prev) =>
        prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
      );
    },
    []
  );

  const removeChild = useCallback((index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ─── Save ────────────────────────────────────────────────────────────────────

  const saveData = async (): Promise<boolean> => {
    setSaving(true);
    try {
      await Promise.all([
        saveFamilyBackground(profileId, family),
        saveChildren(profileId, children),
      ]);
      toast.success("Family background saved successfully.");
      // Re-fetch so family.id is populated for future updates
      await fetchData();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save family background.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    family,
    children,
    loading,
    saving,
    fetchData,
    handleFamilyChange,
    addChild,
    updateChild,
    removeChild,
    saveData,
  };
}