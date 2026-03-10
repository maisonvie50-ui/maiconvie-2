import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<UserRole>('server');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        // Lấy session hiện tại
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsAuthenticated(!!session);
            setIsLoading(false);

            if (session?.user?.user_metadata?.role) {
                setUserRole(session.user.user_metadata.role);
            }
        });

        // Lắng nghe sự kiện thay đổi đăng nhập/đăng xuất
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsAuthenticated(!!session);
            setIsLoading(false);

            if (session?.user?.user_metadata?.role) {
                setUserRole(session.user.user_metadata.role);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Giữ lại hàm handleLogin để tích hợp với component Login (sẽ update sau)
    const handleLogin = useCallback(async (role: UserRole = 'admin', email?: string, password?: string) => {
        setIsLoading(true);
        try {
            if (email && password) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    throw error;
                }

                if (data.user) {
                    setIsAuthenticated(true);
                    setUserRole(data.user.user_metadata?.role || role);
                }
            } else {
                // Tạm thời nếu ko truyền email/pass thì vờ như mock login thành công
                // (sẽ gỡ bỏ sau khi hoàn tất Update Login component)
                setIsAuthenticated(true);
                setUserRole(role);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setSession(null);
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isAuthenticated, userRole, isLoading, session, setUserRole, handleLogin, handleLogout };
}
