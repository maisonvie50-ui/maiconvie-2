import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, userRole, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Determine the best fallback route based on role
        let fallbackPath = '/';
        if (userRole === 'kitchen') {
            fallbackPath = '/bep';
        } else if (userRole === 'receptionist' || userRole === 'server') {
            fallbackPath = '/so-do-nha-hang';
        }

        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
}
