import { createClient } from "@/utils/supabase/server";

export interface Companion {
  id: string;
  name: string;
  age: number;
  bio: string;
  personality: string[];
  interests: string[];
  conversation_style: string;
  image_url: string;
  created_at: string;
}

// Server-side functions
export async function getAllCompanions(): Promise<Companion[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('companions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch companions: ${error.message}`);
  }

  return data || [];
}

export async function createCompanion(companion: Omit<Companion, 'id' | 'created_at'>): Promise<Companion> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('companions')
    .insert([companion])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create companion: ${error.message}`);
  }

  return data;
}

export async function updateCompanion(id: string, updates: Partial<Companion>): Promise<Companion> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('companions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update companion: ${error.message}`);
  }

  return data;
}

export async function deleteCompanion(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('companions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete companion: ${error.message}`);
  }
}
