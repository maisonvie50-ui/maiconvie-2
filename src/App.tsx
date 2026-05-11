/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import logoImg from './assets/logo.jpg';
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
const PublicMenuPdfPage = lazy(() => import('./components/menu/PublicMenuPdfPage'));

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
    <div className="absolute inset-0 flex items-center justify-center bg-[#f7faf9] z-[9999]">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-24 md:w-32 h-12 md:h-14 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm px-2 py-1 flex items-center justify-center">
          <img src={logoImg} alt="Maison Vie Logo" className="w-full h-full object-contain" />
        </div>
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

  useEffect(() => {
    const applyDesktopSystemZoom = () => {
      const isDesktop = window.innerWidth > 768;
      const zoomValue = isDesktop ? '90%' : '100%';
      const zoomScale = isDesktop ? 0.9 : 1;

      document.body.style.zoom = zoomValue;
      document.documentElement.style.setProperty('--ui-zoom', String(zoomScale));
    };

    applyDesktopSystemZoom();
    window.addEventListener('resize', applyDesktopSystemZoom);

    return () => {
      window.removeEventListener('resize', applyDesktopSystemZoom);
      document.body.style.zoom = '100%';
      document.documentElement.style.setProperty('--ui-zoom', '1');
    };
  }, []);

  useEffect(() => {
    const autoCollapseTimer = window.setTimeout(() => {
      setIsSidebarCollapsed(true);
    }, 8000);

    return () => window.clearTimeout(autoCollapseTimer);
  }, []);

  return (
    <div className="flex h-[calc(100vh/var(--ui-zoom,1))] w-[calc(100vw/var(--ui-zoom,1))] bg-gray-50 overflow-hidden font-sans">
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
        <Route path="/thuc-don-pdf" element={<PublicMenuPdfPage />} />
        <Route path="/menu-khach-le" element={<PublicMenuPdfPage />} />
        <Route path="/menu-lu-hanh" element={<PublicMenuPdfPage />} />
        <Route path="/menu-doi-tac" element={<PublicMenuPdfPage />} />
        <Route path="/menu-su-kien" element={<PublicMenuPdfPage />} />
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
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
