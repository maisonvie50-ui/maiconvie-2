/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
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
import { useAuth } from './hooks/useAuth';
import PublicBookingForm from './components/booking/PublicBookingForm';
import ProtectedRoute from './components/layout/ProtectedRoute';

function MainApp() {
  const { isAuthenticated, userRole, isLoading, handleLogin, handleLogout } = useAuth();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
      {/* Public Routes */}
      <Route path="/dat-ban-online" element={<PublicBookingForm />} />

      {/* Protected Routes */}
      {!isAuthenticated ? (
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      ) : isMobile ? (
        <Route path="*" element={<MobileCaptainApp onLogout={handleLogout} />} />
      ) : (
        <Route element={
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
                onMenuClick={() => isMobile ? setIsSidebarOpen(true) : setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
              <main className="flex-1 relative overflow-hidden">
                <Outlet context={{ isSidebarCollapsed }} />
              </main>
            </div>
          </div>
        }>
          <Route path="/" element={<Navigate to="/so-do-nha-hang" replace />} />
          <Route path="/so-do-nha-hang" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'server']}><RestaurantMap /></ProtectedRoute>} />
          <Route path="/bao-cao" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdvancedAnalytics /></ProtectedRoute>} />
          <Route path="/dat-ban" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist']}>
              <BookingKanban
                isModalOpen={isBookingModalOpen}
                onToggleModal={setIsBookingModalOpen}
              />
            </ProtectedRoute>
          } />
          <Route path="/thuc-don" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><MenuManagement /></ProtectedRoute>} />
          <Route path="/bep" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}><KitchenDisplay /></ProtectedRoute>} />
          <Route path="/dao-tao" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><TrainingPortal /></ProtectedRoute>} />
          <Route path="/khach-hang" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist']}><CustomerCRM /></ProtectedRoute>} />
          <Route path="/cau-hinh" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Settings /></ProtectedRoute>} />
          <Route path="/ho-so" element={<UserProfile />} />
        </Route>
      )}
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
