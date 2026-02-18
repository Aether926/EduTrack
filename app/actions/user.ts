'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteTeacher(userId: string) {
  const supabase = await createClient();
  
  try {
    // Check if current user is admin
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

    // Delete the user (Profile will cascade delete)
    const { error } = await supabase
      .from('User')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting teacher:', error);
      return { success: false, error: error.message };
    }

    // Log the activity
    await supabase.from('ActivityLog').insert({
      user_id: user.id,
      action: 'DELETE_TEACHER',
      entity_type: 'USER',
      entity_id: userId,
      details: { deleted_user_id: userId }
    });

    revalidatePath('/teacher-profiles');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteMultipleTeachers(userIds: string[]) {
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

    // Delete multiple users
    const { error } = await supabase
      .from('User')
      .delete()
      .in('id', userIds);

    if (error) {
      console.error('Error deleting teachers:', error);
      return { success: false, error: error.message };
    }

    // Log the activity
    await supabase.from('ActivityLog').insert({
      user_id: user.id,
      action: 'DELETE_MULTIPLE_TEACHERS',
      entity_type: 'USER',
      details: { deleted_user_ids: userIds, count: userIds.length }
    });

    revalidatePath('/teacher-profiles');
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
