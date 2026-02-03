import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  const supabase = await createClient();
  
  try {
    // Get total profiles
    const { count: profileCount } = await supabase
      .from('Profile')
      .select('*', { count: 'exact', head: true });

    // Get total trainings
    const { count: trainingCount } = await supabase
      .from('ProfessionalDevelopment')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'TRAINING');

    // Get total seminars
    const { count: seminarCount } = await supabase
      .from('ProfessionalDevelopment')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'SEMINAR');

    return {
      totalProfiles: profileCount || 0,
      totalTrainings: trainingCount || 0,
      totalSeminars: seminarCount || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProfiles: 0,
      totalTrainings: 0,
      totalSeminars: 0,
    };
    }
}