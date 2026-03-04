import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CalendarDays,
  Map,
  ChefHat,
  PlaySquare,
  Users,
  Settings,
  BookOpen,
  X,
  BarChart3,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed?: boolean;
  onClose: () => void;
  onLogout: () => void;
  userRole?: 'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server';
}

export default function Sidebar({ isOpen, isCollapsed = false, onClose, onLogout, userRole = 'admin' }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const allMenuItems = [
    { path: '/bao-cao', icon: BarChart3, label: 'Báo cáo chuyên sâu', allowedRoles: ['admin', 'manager'] },
    { path: '/dat-ban', icon: CalendarDays, label: 'Lịch đặt bàn', allowedRoles: ['admin', 'manager', 'receptionist'] },
    { path: '/so-do-nha-hang', icon: Map, label: 'Sơ đồ nhà hàng', allowedRoles: ['admin', 'manager', 'receptionist', 'server'] },
    { path: '/thuc-don', icon: BookOpen, label: 'Thực đơn', allowedRoles: ['admin', 'manager'] },
    { path: '/bep', icon: ChefHat, label: 'Bếp (Order)', allowedRoles: ['admin', 'manager', 'kitchen'] },
    { path: '/dao-tao', icon: PlaySquare, label: 'Đào tạo nội bộ', allowedRoles: ['admin', 'manager', 'receptionist', 'kitchen', 'server'] },
    { path: '/khach-hang', icon: Users, label: 'Khách hàng (CRM)', allowedRoles: ['admin', 'manager', 'receptionist'] },
    { path: '/cau-hinh', icon: Settings, label: 'Cấu hình', allowedRoles: ['admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.allowedRoles.includes(userRole));

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'receptionist': return 'Lễ tân';
      case 'kitchen': return 'Bếp trưởng';
      case 'server': return 'Phục vụ';
      default: return role;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-white border-r border-gray-200 h-screen flex flex-col text-gray-600 flex-shrink-0
        transition-all duration-300 ease-in-out shadow-sm overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Logo */}
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'} border-b border-gray-100 shrink-0 transition-all duration-300`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className={`bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm transition-all ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'}`}>
              M
            </div>
            {!isCollapsed && <span className="text-gray-900 font-bold text-lg tracking-wide whitespace-nowrap">Maison Vie</span>}
          </div>
          {!isCollapsed && (
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* User Status */}
        <div className={`p-5 border-b border-gray-100 shrink-0 flex ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative shrink-0">
              <img
                src="https://picsum.photos/seed/avatar1/100/100"
                alt="User"
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 font-bold text-sm truncate">Nguyễn Văn A</div>
                <div className="text-xs text-gray-500 truncate mt-0.5">{getRoleDisplay(userRole)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <ul className="space-y-1.5 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === '/so-do-nha-hang' && currentPath === '/');
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    title={item.label}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                      ? 'bg-teal-50 text-teal-700 font-bold shadow-sm ring-1 ring-teal-100'
                      : 'font-medium hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors`}
          >
            <LogOut className="w-5 h-5 text-red-500 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Đăng xuất</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
