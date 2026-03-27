import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzqlqnmxalutgodjsmig.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Qrp4vSqhfHRd6GaKN9C4BA_ryrCFA8d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
