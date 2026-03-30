'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CreateProfessionalDevelopmentInput } from '@/lib/user';
import { toast } from 'sonner';
import { TrainingLevel } from '@/enums/level';

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;

type UpdatePayload = {
  id: string;
  title: string;
  type: "TRAINING" | "SEMINAR";
  level: keyof typeof TrainingLevel;
  sponsoring_agency: string;
  total_hours: number;
  start_date: string;
  end_date?: string;
  venue?: string;
  description?: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated", userId: null as string | null };

  const { data: profile } = await supabase.from("User").select("role").eq("id", user.id).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!ADMIN_ROLES.includes(profile?.role as any)) return { ok: false as const, error: "Unauthorized", userId: user.id };

  return { ok: true as const, error: null as string | null, userId: user.id };
}

export async function updateProfessionalDevelopment(payload: UpdatePayload) {
  const check = await requireAdmin();
  if (!check.ok) return { success: false, error: check.error };

  const adminSupabase = createAdminClient();
  const { id, ...update } = payload;
  const { error } = await adminSupabase.from("ProfessionalDevelopment").update(update).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/add-training-seminar");
  return { success: true };
}

export async function createProfessionalDevelopment(input: CreateProfessionalDevelopmentInput) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };

    const adminSupabase = createAdminClient();

    const { data: training, error: trainingError } = await adminSupabase
      .from('ProfessionalDevelopment')
      .insert({
        title: input.title,
        type: input.type,
        level: input.level,
        sponsoring_agency: input.sponsoring_agency,
        total_hours: input.total_hours,
        start_date: input.start_date,
        end_date: input.end_date || null,
        venue: input.venue || null,
        description: input.description || null,
        created_by: check.userId,
      })
      .select()
      .single();

    if (trainingError) {
      toast.error('Error creating training');
      return { success: false, error: trainingError.message };
    }

    if (input.teacher_ids && input.teacher_ids.length > 0 && training) {
      const attendanceRecords = input.teacher_ids.map(teacherId => ({
        teacher_id: teacherId,
        training_id: training.id,
        status: 'ENROLLED',
      }));
      await adminSupabase.from('Attendance').insert(attendanceRecords);
    }

    await adminSupabase.from('ActivityLog').insert({
      user_id: check.userId,
      action: 'CREATE_TRAINING',
      entity_type: 'PROFESSIONAL_DEVELOPMENT',
      entity_id: training.id,
      details: { title: input.title, type: input.type }
    });

    revalidatePath('/add-training-seminar');
    revalidatePath('/dashboard');
    return { success: true, data: training };
  } catch {
    toast.error('Unexpected error creating training');
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteProfessionalDevelopment(id: string) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from('ProfessionalDevelopment').delete().eq('id', id);

    if (error) {
      toast.error('Error deleting');
      return { success: false, error: error.message };
    }

    await adminSupabase.from('ActivityLog').insert({
      user_id: check.userId,
      action: 'DELETE_TRAINING',
      entity_type: 'PROFESSIONAL_DEVELOPMENT',
      entity_id: id,
    });

    revalidatePath('/add-training-seminar');
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    toast.error('Unexpected error');
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteMultipleProfessionalDevelopment(ids: string[]) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from('ProfessionalDevelopment').delete().in('id', ids);

    if (error) {
      toast.error('Error deleting');
      return { success: false, error: error.message };
    }

    await adminSupabase.from('ActivityLog').insert({
      user_id: check.userId,
      action: 'DELETE_MULTIPLE_TRAININGS',
      entity_type: 'PROFESSIONAL_DEVELOPMENT',
      details: { count: ids.length, ids }
    });

    revalidatePath('/add-training-seminar');
    revalidatePath('/dashboard');
    return { success: true, count: ids.length };
  } catch {
    toast.error('Unexpected error');
    return { success: false, error: 'An unexpected error occurred' };
  }
}