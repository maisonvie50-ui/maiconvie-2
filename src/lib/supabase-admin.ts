/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Lưu ý: Trong một dự án thực tế, bạn NÊN sử dụng SERVICE_ROLE_KEY cho admin API.
// Tuy nhiên vì hiện tại ứng dụng chỉ có ANON_KEY ở client, ta tạm dùng ANON_KEY 
// kết hợp auth.admin hoặc signUp thông thường, nhưng tắt persistSession để 
// không đè lên session đăng nhập hiện tại.

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables!');
}

// Client thứ 2 chuyên dùng cho việc tạo tài khoản, không lưu session
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});
