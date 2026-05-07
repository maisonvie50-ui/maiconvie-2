/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Login from './components/auth/Login';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth, AuthProvider, UserRole } from './hooks/useAuth';

const BookingKanban = lazy(() => import('./components/booking/BookingKanban'));
const RestaurantMap = lazy(() => import('./components/restaurant-map/RestaurantMap'));
const KitchenDisplay = lazy(() => import('./components/kitchen/KitchenDisplay'));
const BarDisplay = lazy(() => import('./components/kitchen/BarDisplay'));
const TrainingPortal = lazy(() => import('./components/training/TrainingPortal'));
const CustomerCRM = lazy(() => import('./components/crm/CustomerCRM'));
const Settings = lazy(() => import('./components/settings/Settings'));
const MenuManagement = lazy(() => import('./components/menu/MenuManagement'));
const AdvancedAnalytics = lazy(() => import('./components/analytics/AdvancedAnalytics'));
const OrderHistory = lazy(() => import('./components/analytics/OrderHistory'));
const MobileCaptainApp = lazy(() => import('./components/mobile/MobileCaptainApp'));
const UserProfile = lazy(() => import('./components/profile/UserProfile'));
const PublicBookingForm = lazy(() => import('./components/booking/PublicBookingForm'));

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

function RouteLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-teal-700">
        <div className="w-9 h-9 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
        <div className="text-sm font-semibold">Đang tải dữ liệu...</div>
      </div>
    </div>
  );
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
          <Suspense fallback={<RouteLoader />}>
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
          </Suspense>
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
    <Suspense fallback={<RouteLoader />}>
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
    </Suspense>
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
