import { createClient } from '@supabase/supabase-js';

const supabaseUrl = localStorage.getItem('supabase_url') || '';
const supabaseAnonKey = localStorage.getItem('supabase_anon_key') || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};