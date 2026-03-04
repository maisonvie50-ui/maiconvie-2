import type { BookingStatus } from '@/src/types';

// Booking source badge colors (used in BookingKanban)
export const SOURCE_COLORS: Record<string, string> = {
    website: 'bg-blue-100 text-blue-700',
    facebook: 'bg-indigo-100 text-indigo-700',
    hotline: 'bg-green-100 text-green-700',
    walk_in: 'bg-orange-100 text-orange-700',
    ota: 'bg-purple-100 text-purple-700',
};

// Kanban column configuration
export const BOOKING_COLUMNS: { id: BookingStatus; label: string; color: string; borderColor: string }[] = [
    { id: 'new', label: 'Mới nhận', color: 'bg-blue-50', borderColor: 'border-blue-500' },
    { id: 'waiting_info', label: 'Chờ thông tin', color: 'bg-yellow-50', borderColor: 'border-yellow-400' },
    { id: 'confirmed', label: 'Đã xác nhận', color: 'bg-green-50', borderColor: 'border-green-500' },
    { id: 'change_requested', label: 'Yêu cầu đổi', color: 'bg-purple-50', borderColor: 'border-purple-400' },
    { id: 'arrived', label: 'Đã đến', color: 'bg-teal-50', borderColor: 'border-teal-500' },
    { id: 'completed', label: 'Hoàn thành', color: 'bg-emerald-50', borderColor: 'border-emerald-400' },
    { id: 'no_show', label: 'Không đến (No-show)', color: 'bg-red-50', borderColor: 'border-red-400' },
    { id: 'cancelled', label: 'Đã hủy', color: 'bg-gray-100', borderColor: 'border-gray-400' },
];

// Analytics chart colors (used in AdvancedAnalytics)
export const ANALYTICS_COLORS = {
    Star: '#10B981',
    Plowhorse: '#F59E0B',
    Puzzle: '#3B82F6',
    Dog: '#EF4444',
};

// Training levels
export const TRAINING_LEVELS = [
    { id: 1, name: 'Level 1: Nhập môn', color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 2, name: 'Level 2: Cơ bản', color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 3, name: 'Level 3: Nâng cao', color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 4, name: 'Level 4: Chuyên sâu', color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 5, name: 'Level 5: Quản lý', color: 'text-red-500', bg: 'bg-red-100' },
];
