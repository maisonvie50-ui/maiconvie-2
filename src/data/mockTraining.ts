import type { Course, EmployeeProgress } from '../types';

export const courses: Course[] = [
    { id: '1', title: 'Giới thiệu Maison Vie', thumbnail: '🏠', duration: '15 phút', progress: 100, level: 1, youtubeId: 'dQw4w9WgXcQ' },
    { id: '2', title: 'Quy trình đón khách', thumbnail: '🤝', duration: '20 phút', progress: 100, level: 1, youtubeId: 'dQw4w9WgXcQ' },
    { id: '3', title: 'Xử lý đặt bàn', thumbnail: '📋', duration: '25 phút', progress: 60, level: 1, youtubeId: 'dQw4w9WgXcQ' },
    { id: '4', title: 'Menu & Food Knowledge', thumbnail: '🍽️', duration: '30 phút', progress: 0, level: 2, youtubeId: 'dQw4w9WgXcQ' },
    { id: '5', title: 'Wine Pairing Basics', thumbnail: '🍷', duration: '45 phút', progress: 0, level: 2, youtubeId: 'dQw4w9WgXcQ' },
    { id: '6', title: 'Upselling Techniques', thumbnail: '💰', duration: '30 phút', progress: 0, level: 3, youtubeId: 'dQw4w9WgXcQ' },
    { id: '7', title: 'Xử lý Khiếu nại', thumbnail: '🛡️', duration: '35 phút', progress: 0, level: 3, youtubeId: 'dQw4w9WgXcQ' },
    { id: '8', title: 'Quản lý ca & nhân sự', thumbnail: '👥', duration: '40 phút', progress: 0, level: 4, youtubeId: 'dQw4w9WgXcQ' },
    { id: '9', title: 'Phân tích báo cáo', thumbnail: '📊', duration: '50 phút', progress: 0, level: 5, youtubeId: 'dQw4w9WgXcQ' },
];

export const employeeProgress: EmployeeProgress[] = [
    { id: '1', name: 'Nguyễn Văn A', avatar: '👨', role: 'Phục vụ', overallProgress: 80, badges: [1, 2] },
    { id: '2', name: 'Trần Thị B', avatar: '👩', role: 'Bếp', overallProgress: 45, badges: [1] },
    { id: '3', name: 'Lê Văn C', avatar: '👨', role: 'Phục vụ', overallProgress: 100, badges: [1, 2, 3, 4] },
    { id: '4', name: 'Phạm Thị D', avatar: '👩', role: 'Quản lý', overallProgress: 60, badges: [1, 2, 3] },
];
