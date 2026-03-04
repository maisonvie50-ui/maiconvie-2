import { useState, useCallback } from 'react';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    // Add default role as Admin for mockup
    const [userRole, setUserRole] = useState<'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server'>(() => {
        return (localStorage.getItem('userRole') as any) || 'admin';
    });

    const handleLogin = useCallback((role: 'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server' = 'admin') => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        setIsAuthenticated(true);
        setUserRole(role);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
    }, []);

    return { isAuthenticated, userRole, setUserRole, handleLogin, handleLogout };
}
