'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionResult<T = null> =
  | { success: true; data?: T }
  | { success: false; error: string; existingId?: string };

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Something went wrong';
}

type TeacherSelfReportInput = {
  title: string;
  type: 'TRAINING' | 'SEMINAR';
  level: 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
  sponsoring_agency: string;
  total_hours: number;
  start_date: string;
  end_date?: string;
  venue?: string;
  description?: string;

};

export async function teacherSelfReportTraining(
  input: TeacherSelfReportInput,
  fd: FormData
): Promise<ActionResult<{ attendanceId: string }>> {
  const proof = fd.get('proof') as File | null;
  if (!proof || proof.size === 0) return { success: false, error: 'Proof file is required.' };
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { success: false, error: 'Not authenticated' };

    const userId = authData.user.id;

    const { data: userRow } = await supabase
      .from('User')
      .select('role')
      .eq('id', userId)
      .single();
    if (userRow?.role !== 'TEACHER') {
      return { success: false, error: 'Unauthorized. Teachers only.' };
    }

    const admin = createAdminClient();
    const { data: duplicate } = await admin
      .from('ProfessionalDevelopment')
      .select('id')
      .eq('title', input.title.trim())
      .eq('total_hours', input.total_hours)
      .eq('start_date', input.start_date)
      .maybeSingle();

    if (duplicate) {
      return {
        success: false,
        error: 'This training already exists in the system. Search for it and enroll yourself instead.',
        existingId: duplicate.id,
      };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count } = await admin
      .from('ProfessionalDevelopment')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId)
      .eq('source', 'SELF_REPORTED')
      .gte('created_at', startOfToday.toISOString());

    if ((count ?? 0) >= 5) {
      return {
        success: false,
        error: 'You can only self-report up to 5 trainings per day. Try again tomorrow.',
      };
    }

    const { data: training, error: pdErr } = await admin
      .from('ProfessionalDevelopment')
      .insert({
        title: input.title.trim(),
        type: input.type,
        level: input.level,
        sponsoring_agency: input.sponsoring_agency.trim(),
        total_hours: input.total_hours,
        start_date: input.start_date,
        end_date: input.end_date || null,
        venue: input.venue?.trim() || null,
        description: input.description?.trim() || null,
        created_by: userId,
        source: 'SELF_REPORTED',
      })
      .select('id')
      .single();

    if (pdErr || !training) {
      return { success: false, error: pdErr?.message ?? 'Failed to create training record' };
    }

    const safeName = proof.name.replace(/[^\w.\-]+/g, '_');
    const proofPath = `attendance/${userId}/self-report/${training.id}/${Date.now()}_${safeName}`;

    const { error: uploadErr } = await admin.storage
      .from('certificates')
      .upload(proofPath, proof, { upsert: true });

    if (uploadErr) {
      await admin.from('ProfessionalDevelopment').delete().eq('id', training.id);
      return { success: false, error: uploadErr.message };
    }

    const { data: pub } = admin.storage.from('certificates').getPublicUrl(proofPath);
    const now = new Date().toISOString();

    const { data: attendance, error: attErr } = await admin
      .from('Attendance')
      .insert({
        teacher_id: userId,
        training_id: training.id,
        status: 'SUBMITTED',
        proof_url: pub.publicUrl,
        proof_path: proofPath,
        proof_submitted_at: now,
      })
      .select('id')
      .single();

    if (attErr || !attendance) {
      await admin.from('ProfessionalDevelopment').delete().eq('id', training.id);
      await admin.storage.from('certificates').remove([proofPath]);
      return { success: false, error: attErr?.message ?? 'Failed to create attendance record' };
    }

    await admin.from('ActivityLog').insert({
      actor_id: userId,
      target_user_id: userId,
      action: 'SELF_REPORTED_TRAINING',
      entity_type: 'ATTENDANCE',
      entity_id: attendance.id,
      message: `You self-reported attendance for "${input.title.trim()}".`,
      meta: { trainingId: training.id, attendanceId: attendance.id },
    });

    revalidatePath('/professional-dev');

    return { success: true, data: { attendanceId: attendance.id } };
  } catch (e) {
    return { success: false, error: errMsg(e) };
  }
}

export async function selfEnrollExistingTraining(
  trainingId: string,
  fd: FormData
): Promise<ActionResult<{ attendanceId: string }>> {
  const proof = fd.get('proof') as File | null;
  if (!proof || proof.size === 0) return { success: false, error: 'Proof file is required.' };
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { success: false, error: 'Not authenticated' };

    const userId = authData.user.id;

    const { data: userRow } = await supabase
      .from('User')
      .select('role')
      .eq('id', userId)
      .single();
    if (userRow?.role !== 'TEACHER') {
      return { success: false, error: 'Unauthorized. Teachers only.' };
    }

    const admin = createAdminClient();

    const { data: training } = await admin
      .from('ProfessionalDevelopment')
      .select('id, title, total_hours')
      .eq('id', trainingId)
      .single();

    if (!training) return { success: false, error: 'Training not found' };

    const { data: existing } = await admin
      .from('Attendance')
      .select('id, status')
      .eq('training_id', trainingId)
      .eq('teacher_id', userId)
      .maybeSingle();

    if (existing) {
      const s = existing.status?.toUpperCase();
      if (s === 'ENROLLED')
        return { success: false, error: 'You are already enrolled — go to your records and upload your proof.' };
      if (s === 'SUBMITTED')
        return { success: false, error: 'You already submitted proof for this training — waiting for admin review.' };
      if (s === 'APPROVED')
        return { success: false, error: 'You have already completed this training.' };
      if (s === 'REJECTED')
        return { success: false, error: 'Your previous proof was rejected — resubmit from your training records.' };
      return { success: false, error: 'You already have a record for this training.' };
    }

    const safeName = proof.name.replace(/[^\w.\-]+/g, '_');
    const proofPath = `attendance/${userId}/self-enroll/${trainingId}/${Date.now()}_${safeName}`;

    const { error: uploadErr } = await admin.storage
      .from('certificates')
      .upload(proofPath, proof, { upsert: true });

    if (uploadErr) return { success: false, error: uploadErr.message };

    const { data: pub } = admin.storage.from('certificates').getPublicUrl(proofPath);
    const now = new Date().toISOString();

    const { data: attendance, error: attErr } = await admin
      .from('Attendance')
      .insert({
        teacher_id: userId,
        training_id: trainingId,
        status: 'SUBMITTED',
        proof_url: pub.publicUrl,
        proof_path: proofPath,
        proof_submitted_at: now,
      })
      .select('id')
      .single();

    if (attErr || !attendance) {
      await admin.storage.from('certificates').remove([proofPath]);
      return { success: false, error: attErr?.message ?? 'Failed to create attendance record' };
    }

    await admin.from('ActivityLog').insert({
      actor_id: userId,
      target_user_id: userId,
      action: 'SELF_ENROLLED_TRAINING',
      entity_type: 'ATTENDANCE',
      entity_id: attendance.id,
      message: `You self-enrolled and submitted proof for "${training.title}".`,
      meta: { trainingId, attendanceId: attendance.id },
    });

    revalidatePath('/professional-dev');

    return { success: true, data: { attendanceId: attendance.id } };
  } catch (e) {
    return { success: false, error: errMsg(e) };
  }
}

export async function getBrowsableTrainings(
  search: string = '',
  page: number = 1,
  pageSize: number = 10
): Promise<{
  data: {
    id: string;
    title: string;
    type: string;
    level: string;
    sponsoring_agency: string;
    total_hours: number;
    start_date: string;
    end_date: string | null;
    source: string;
  }[];
  count: number;
}> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { data: [], count: 0 };

    const userId = authData.user.id;
    const admin = createAdminClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: enrolled } = await admin
      .from('Attendance')
      .select('training_id')
      .eq('teacher_id', userId);

    const enrolledIds = (enrolled ?? []).map((r) => r.training_id);

    let query = admin
      .from('ProfessionalDevelopment')
      .select('id, title, type, level, sponsoring_agency, total_hours, start_date, end_date, source', { count: 'exact' })
      .order('start_date', { ascending: false })
      .range(from, to);

    if (enrolledIds.length > 0) {
      query = query.not('id', 'in', `(${enrolledIds.join(',')})`);
    }

    if (search.trim()) {
      query = query.or(
        `title.ilike.%${search.trim()}%,sponsoring_agency.ilike.%${search.trim()}%,level.ilike.%${search.trim()}%,type.ilike.%${search.trim()}%`
      );
    }

    const { data, count, error } = await query;
    if (error) return { data: [], count: 0 };

    return { data: data ?? [], count: count ?? 0 };
  } catch {
    return { data: [], count: 0 };
  }
}