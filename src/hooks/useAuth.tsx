import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole;
    isLoading: boolean;
    user: AuthUser | null;
    session: null; // kept for compatibility
    setUserRole: (role: UserRole) => void;
    handleLogin: (role?: UserRole, email?: string, password?: string) => Promise<void>;
    handleLogout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'maison_vie_auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<UserRole>('server');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    // Restore session from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                const parsed: AuthUser = JSON.parse(stored);
                setUser(parsed);
                setUserRole(parsed.role);
                setIsAuthenticated(true);
            }
        } catch (e) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = useCallback(async (_role?: UserRole, email?: string, password?: string) => {
        setIsLoading(true);
        try {
            if (!email || !password) {
                throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
            }

            // Query employees table to verify credentials
            const { data: employee, error } = await supabase
                .from('employees')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .eq('active', true)
                .single();

            if (error || !employee) {
                throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
            }

            // Determine role from employee flags
            let detectedRole: UserRole = 'server';
            if (employee.role_manager) detectedRole = 'admin';
            else if (employee.role_reception) detectedRole = 'receptionist';
            else if (employee.role_kitchen) detectedRole = 'kitchen';
            else if (employee.role_server) detectedRole = 'server';

            const authUser: AuthUser = {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role: detectedRole,
            };

            setUser(authUser);
            setUserRole(detectedRole);
            setIsAuthenticated(true);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));

            // Also store as currentEmployee for training portal & other features
            localStorage.setItem('currentEmployee', JSON.stringify({
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role_manager: employee.role_manager,
                role_reception: employee.role_reception,
                role_kitchen: employee.role_kitchen,
                role_server: employee.role_server,
            }));

            // Update last_active
            await supabase
                .from('employees')
                .update({ last_active: new Date().toISOString() })
                .eq('id', employee.id);
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole('server');
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem('currentEmployee');
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, isLoading, user, session: null, setUserRole, handleLogin, handleLogout }}>
            {children}
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

