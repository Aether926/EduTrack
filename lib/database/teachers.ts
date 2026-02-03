
import { createClient } from '@/lib/supabase/server';

export async function getApprovedTeachers() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('Profile')
      .select(`
        *,
        User!inner (
          status,
          role
        )
      `)
      .eq('User.status', 'APPROVED')
      .eq("User.role", "TEACHER")
      .order('lastName', { ascending: true });

    if (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }

    return data.map(profile => ({
      id: profile.id, 
      user_id: profile.id, 
      employee_id: profile.employee_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      middle_initial: profile.middle_initial,
      email: profile.email,
      contact_number: profile.contact_number,
      position: profile.position || 'N/A',
      profile_image: profile.profile_image,
      status: profile.User.status,
      created_at: profile.created_at,
    }));
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}
