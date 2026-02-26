import { createClient, createAdminClient } from '@/lib/supabase/server';
import { ProfessionalDevelopment } from '@/lib/user';
import { toast } from 'sonner';

export async function getAllProfessionalDevelopment() {
  const supabase = await createAdminClient();
  
  
  try {
    const { data, error } = await supabase
      .from('ProfessionalDevelopment')
      .select('*')
      .order('start_date', { ascending: false });
      

    if (error) {
      toast.error( 'Error fetching professional development');
      return [];
    }

    return data as ProfessionalDevelopment[];
  } catch (error) {
    toast.error('Unexpected error');
    return [];
  }
}

export async function getTrainings() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('ProfessionalDevelopment')
      .select('*')
      .eq('type', 'TRAINING')
      .order('start_date', { ascending: false });

    if (error) {
      toast.error('Error fetching trainings');
      return [];
    }

    return data as ProfessionalDevelopment[];
  } catch (error) {
    toast.error('Unexpected error');
    return [];
  }
}

export async function getSeminars() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('ProfessionalDevelopment')
      .select('*')
      .eq('type', 'SEMINAR')
      .order('start_date', { ascending: false });

    if (error) {
      toast.error('Error fetching seminars');
      return [];
    }

    return data as ProfessionalDevelopment[];
  } catch (error) {
    toast.error('Unexpected error');
    return [];
  }
}

export async function getProfessionalDevelopmentById(id: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('ProfessionalDevelopment')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Error fetching professional development');
      return null;
    }

    return data as ProfessionalDevelopment;
  } catch (error) {
    toast.error('Unexpected error');
    return null;
  }
}