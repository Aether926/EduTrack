'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CreateProfessionalDevelopmentInput } from '@/lib/user';
import { toast } from 'sonner';

type UpdatePayload = {
  id: string;
  title: string;
  type: "TRAINING" | "SEMINAR";
  level: "REGIONAL" | "NATIONAL" | "INTERNATIONAL";
  sponsoring_agency: string;
  total_hours: number;
  start_date: string;
  end_date?: string;
  venue?: string;
  description?: string;
};

export async function updateProfessionalDevelopment(payload: UpdatePayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("User").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const adminSupabase = createAdminClient();
  const { id, ...update } = payload;
  const { error } = await adminSupabase
    .from("ProfessionalDevelopment").update(update).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/add-training-seminar");
  return { success: true };
}

export async function createProfessionalDevelopment(input: CreateProfessionalDevelopmentInput) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized. Only admins can create trainings.' };
    }
    // Use ADMIN CLIENT to bypass RLS
    const adminSupabase = await createAdminClient();

    // Create the professional development record
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
        created_by: user.id,
      })
      .select()
      .single();

    if (trainingError) {
      toast.error('Error creating training');
      return { success: false, error: trainingError.message };
    }

    // If teachers are assigned, create attendance records
    if (input.teacher_ids && input.teacher_ids.length > 0 && training) {
      const attendanceRecords = input.teacher_ids.map(teacherId => ({
        teacher_id: teacherId,
        training_id: training.id,
        status: 'ENROLLED',
      }));

      await adminSupabase
        .from('Attendance')
        .insert(attendanceRecords);
    }

    // Log activity
    await adminSupabase.from('ActivityLog').insert({
      user_id: user.id,
      action: 'CREATE_TRAINING',
      entity_type: 'PROFESSIONAL_DEVELOPMENT',
      entity_id: training.id,
      details: { title: input.title, type: input.type }
    });

    revalidatePath('/add-training-seminar');
    revalidatePath('/dashboard');
    
    return { success: true, data: training };
  } catch (error) {
    toast.error('Unexpected error creating training');
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteProfessionalDevelopment(id: string) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: adminProfile } = await supabase
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    // Use admin client
    const adminSupabase = await createAdminClient();

    const { error } = await adminSupabase
      .from('ProfessionalDevelopment')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting');
      return { success: false, error: error.message };
    }

    await adminSupabase.from('ActivityLog').insert({
      user_id: user.id,
      action: 'DELETE_TRAINING',
      entity_type: 'PROFESSIONAL_DEVELOPMENT',
      entity_id: id,
    });

    revalidatePath('/add-training-seminar');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    toast.error('Unexpected error');
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteMultipleProfessionalDevelopment(ids: string[]) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: adminProfile } = await supabase
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    // Use admin client
    const adminSupabase = await createAdminClient();

    const { error } = await adminSupabase
      .from('ProfessionalDevelopment')
      .delete()
      .in('id', ids);

    if (error) {
      toast.error('Error deleting');
      return { success: false, error: error.message };
    }

    await adminSupabase.from('ActivityLog').insert({
      user_id: user.id,
      action: 'DELETE_MULTIPLE_TRAININGS',
      entity_type: 'PROFESSIONAL_DEVELOPMENT',
      details: { count: ids.length, ids }
    });

    revalidatePath('/add-training-seminar');
    revalidatePath('/dashboard');
    
    return { success: true, count: ids.length };
  } catch (error) {
    toast.error('Unexpected error');
    return { success: false, error: 'An unexpected error occurred' };
  }
}