/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BookingKanban from './components/booking/BookingKanban';
import RestaurantMap from './components/restaurant-map/RestaurantMap';
import KitchenDisplay from './components/kitchen/KitchenDisplay';
import TrainingPortal from './components/training/TrainingPortal';
import CustomerCRM from './components/crm/CustomerCRM';
import Settings from './components/settings/Settings';
import MenuManagement from './components/menu/MenuManagement';
import AdvancedAnalytics from './components/analytics/AdvancedAnalytics';
import MobileCaptainApp from './components/mobile/MobileCaptainApp';
import Login from './components/auth/Login';
import UserProfile from './components/profile/UserProfile';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth, UserRole } from './hooks/useAuth';
import PublicBookingForm from './components/booking/PublicBookingForm';

// ---- Auth Guard Component ----
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ---- Role Guard Component ----
function RoleGuard({ children, allowedRoles, userRole }: { children: React.ReactNode; allowedRoles: UserRole[]; userRole: UserRole }) {
  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'kitchen') {
      return <Navigate to="/bep" replace />;
    }
    return <Navigate to="/so-do-nha-hang" replace />;
  }
  return <>{children}</>;
}

// ---- Desktop Layout ----
function DesktopLayout() {
  const { userRole, handleLogout } = useAuth();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onAddBooking={() => setIsBookingModalOpen(true)}
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 relative overflow-hidden">
          <Routes>
            <Route index element={<Navigate to="/so-do-nha-hang" replace />} />
            <Route path="so-do-nha-hang" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'manager', 'receptionist', 'server']}><RestaurantMap /></RoleGuard>} />
            <Route path="bao-cao" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'manager']}><AdvancedAnalytics /></RoleGuard>} />
            <Route path="dat-ban" element={
              <RoleGuard userRole={userRole} allowedRoles={['admin', 'manager', 'receptionist']}>
                <BookingKanban isModalOpen={isBookingModalOpen} onToggleModal={setIsBookingModalOpen} />
              </RoleGuard>
            } />
            <Route path="thuc-don" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'manager']}><MenuManagement /></RoleGuard>} />
            <Route path="bep" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'manager', 'kitchen']}><KitchenDisplay /></RoleGuard>} />
            <Route path="dao-tao" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'manager']}><TrainingPortal /></RoleGuard>} />
            <Route path="khach-hang" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'manager', 'receptionist']}><CustomerCRM /></RoleGuard>} />
            <Route path="cau-hinh" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'manager']}><Settings /></RoleGuard>} />
            <Route path="ho-so" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/so-do-nha-hang" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ---- App Shell: handles mobile vs desktop ----
function AppShell() {
  const { handleLogout } = useAuth();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileCaptainApp onLogout={handleLogout} />;
  }

  return <DesktopLayout />;
}

// ---- Main App with Top-Level Routes ----
function MainApp() {
  const { isAuthenticated, isLoading, handleLogin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/dat-ban-online" element={<PublicBookingForm />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
      } />

      {/* All other routes require authentication */}
      <Route path="/*" element={
        <RequireAuth>
          <AppShell />
        </RequireAuth>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
