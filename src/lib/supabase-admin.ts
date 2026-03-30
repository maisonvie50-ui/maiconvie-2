/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzqlqnmxalutgodjsmig.supabase.co';
// We MUST use the service role key to perform admin operations like fetching/updating users
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Service Role Key! Admin operations will fail.');
}

// Client chuyên dùng cho server-side / admin. Tuyệt đối không để lộ key này ra client side trong môi trường thật (đang dùng VITE_ để test tạm)
// Lưu ý: Nếu key undefined, dùng key ảo để tránh crash web phía Frontend.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'dummy_key_to_prevent_client_crash', {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});
