import { createClient as createClientClient } from "@/utils/supabase/client";

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

// Type alias for compatibility
export type AICompanion = Companion;

// Client-side functions only (to avoid server import issues)
export async function getCompanionsClient(): Promise<Companion[]> {
  const supabase = createClientClient();
  
  const { data, error } = await supabase
    .from('companions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch companions: ${error.message}`);
  }

  return data || [];
}

export async function createCompanionClient(companion: Omit<Companion, 'id' | 'created_at'>): Promise<Companion> {
  const supabase = createClientClient();
  
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

export async function updateCompanionClient(id: string, updates: Partial<Companion>): Promise<Companion> {
  const supabase = createClientClient();
  
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

export async function deleteCompanionClient(id: string): Promise<void> {
  const supabase = createClientClient();
  
  const { error } = await supabase
    .from('companions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete companion: ${error.message}`);
  }
}

export const getAllCompanionsClient = getCompanionsClient;

// ---- Compatibility export for companion fetch ----
export const getAllCompanions = getCompanionsClient;