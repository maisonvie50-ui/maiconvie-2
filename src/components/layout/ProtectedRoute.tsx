import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    userRole: UserRole;
}

export default function ProtectedRoute({ children, allowedRoles, userRole }: ProtectedRouteProps) {
    // App.tsx already handles isAuthenticated check, so we only check role here
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        let fallbackPath = '/so-do-nha-hang';
        if (userRole === 'kitchen') {
            fallbackPath = '/bep';
        }
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
}
