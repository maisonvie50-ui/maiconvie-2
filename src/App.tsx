/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BookingKanban from './components/booking/BookingKanban';
import RestaurantMap from './components/restaurant-map/RestaurantMap';
import KitchenDisplay from './components/kitchen/KitchenDisplay';
import BarDisplay from './components/bar/BarDisplay';
import TrainingPortal from './components/training/TrainingPortal';
import CustomerCRM from './components/crm/CustomerCRM';
import Settings from './components/settings/Settings';
import MenuManagement from './components/menu/MenuManagement';
import AdvancedAnalytics from './components/analytics/AdvancedAnalytics';
import OrderHistory from './components/analytics/OrderHistory';
import MobileCaptainApp from './components/mobile/MobileCaptainApp';
import Login from './components/auth/Login';
import UserProfile from './components/profile/UserProfile';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth, AuthProvider, UserRole } from './hooks/useAuth';
import PublicBookingForm from './components/booking/PublicBookingForm';

// ---- Role Guard Component ----
function RoleGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { userRole } = useAuth();
  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'kitchen') {
      return <Navigate to="/bep" replace />;
    }
    return <Navigate to="/so-do-nha-hang" replace />;
  }
  return <>{children}</>;
}

// ---- Desktop Layout with inner routes ----
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
            <Route path="so-do-nha-hang" element={<RoleGuard allowedRoles={['admin', 'manager', 'receptionist', 'server']}><RestaurantMap /></RoleGuard>} />
            <Route path="bao-cao" element={<RoleGuard allowedRoles={['admin', 'manager']}><AdvancedAnalytics /></RoleGuard>} />
            <Route path="lich-su-don" element={<RoleGuard allowedRoles={['admin', 'manager', 'receptionist']}><OrderHistory /></RoleGuard>} />
            <Route path="dat-ban" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'receptionist']}>
                <BookingKanban isModalOpen={isBookingModalOpen} onToggleModal={setIsBookingModalOpen} />
              </RoleGuard>
            } />
            <Route path="thuc-don" element={<RoleGuard allowedRoles={['admin', 'manager']}><MenuManagement /></RoleGuard>} />
            <Route path="bep" element={<RoleGuard allowedRoles={['admin', 'manager', 'kitchen']}><KitchenDisplay /></RoleGuard>} />
            <Route path="bar" element={<RoleGuard allowedRoles={['admin', 'manager', 'kitchen']}><BarDisplay /></RoleGuard>} />
            <Route path="dao-tao" element={<RoleGuard allowedRoles={['admin', 'manager', 'receptionist', 'kitchen', 'server']}><TrainingPortal /></RoleGuard>} />
            <Route path="khach-hang" element={<RoleGuard allowedRoles={['admin', 'manager', 'receptionist']}><CustomerCRM /></RoleGuard>} />
            <Route path="cau-hinh" element={<RoleGuard allowedRoles={['admin', 'manager']}><Settings /></RoleGuard>} />
            <Route path="ho-so" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/so-do-nha-hang" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ---- Main App ----
function MainApp() {
  const { isAuthenticated, isLoading, handleLogin, handleLogout } = useAuth();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - always available */}
      <Route path="/dat-ban-online" element={<PublicBookingForm />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
      } />

      {/* Protected routes */}
      <Route path="/*" element={
        !isAuthenticated ? (
          <Navigate to="/login" replace />
        ) : isMobile ? (
          <MobileCaptainApp onLogout={handleLogout} />
        ) : (
          <DesktopLayout />
        )
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
