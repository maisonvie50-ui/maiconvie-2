import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server';

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole;
    isLoading: boolean;
    session: Session | null;
    setUserRole: (role: UserRole) => void;
    handleLogin: (role?: UserRole, email?: string, password?: string) => Promise<void>;
    handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<UserRole>('server');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsAuthenticated(!!session);
            setIsLoading(false);

            if (session?.user?.user_metadata?.role) {
                setUserRole(session.user.user_metadata.role);
            }
        });

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

    return (
        <AuthContext.Provider value= {{ isAuthenticated, userRole, isLoading, session, setUserRole, handleLogin, handleLogout }
}>
    { children }
    </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
