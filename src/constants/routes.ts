import {
    CalendarDays,
    Map,
    ChefHat,
    PlaySquare,
    Users,
    Settings,
    BookOpen,
    BarChart3,
} from 'lucide-react';

export interface RouteConfig {
    path: string;
    icon: typeof CalendarDays;
    label: string;
    title: string;
}

export const ROUTES: RouteConfig[] = [
    { path: '/bao-cao', icon: BarChart3, label: 'Báo cáo chuyên sâu', title: 'Báo cáo chuyên sâu' },
    { path: '/dat-ban', icon: CalendarDays, label: 'Lịch đặt bàn', title: 'Quản lý Đặt Bàn' },
    { path: '/so-do-nha-hang', icon: Map, label: 'Sơ đồ nhà hàng', title: 'Sơ đồ nhà hàng' },
    { path: '/thuc-don', icon: BookOpen, label: 'Thực đơn', title: 'Quản lý Thực đơn' },
    { path: '/bep', icon: ChefHat, label: 'Bếp (Order)', title: 'Bếp (Order)' },
    { path: '/dao-tao', icon: PlaySquare, label: 'Đào tạo nội bộ', title: 'Đào tạo nội bộ' },
    { path: '/khach-hang', icon: Users, label: 'Khách hàng (CRM)', title: 'Khách hàng (CRM)' },
    { path: '/cau-hinh', icon: Settings, label: 'Cấu hình', title: 'Cấu hình hệ thống' },
];

export const VIEW_TITLES: Record<string, string> = Object.fromEntries(
    ROUTES.map(r => [r.path, r.title])
);
// Add extra mappings
VIEW_TITLES['/ho-so'] = 'Hồ sơ cá nhân';
