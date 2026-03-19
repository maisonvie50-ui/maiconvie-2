import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronLeft, ChevronRight, Plus, Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onAddBooking?: () => void;
  onMenuClick: () => void;
}

const VIEW_TITLES: Record<string, string> = {
  '/bao-cao': 'Báo cáo chuyên sâu',
  '/lich-su-don': 'Lịch sử Hoá đơn',
  '/dat-ban': 'Quản lý Đặt Bàn',
  '/so-do-nha-hang': 'Sơ đồ nhà hàng',
  '/thuc-don': 'Quản lý Thực đơn',
  '/bep': 'Bếp (Order)',
  '/dao-tao': 'Đào tạo nội bộ',
  '/khach-hang': 'Khách hàng (CRM)',
  '/cau-hinh': 'Cấu hình hệ thống',
  '/ho-so': 'Hồ sơ cá nhân',
};

export default function Header({ onAddBooking, onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const title = VIEW_TITLES[currentPath] || (currentPath === '/' ? 'Sơ đồ nhà hàng' : 'Maison Vie');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 flex flex-col">
      {/* Top Header */}
      <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-gray-200"
            >
              <img
                src="https://picsum.photos/seed/avatar1/100/100"
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{user?.name || 'Nhân viên'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/ho-so');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => {
                      // Handle logout
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>


    </header>
  );
}
