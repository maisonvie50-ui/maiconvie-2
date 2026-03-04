import type { Employee, ActivityLog, Area } from '../types';

export const employees: Employee[] = [
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', active: true, roles: { reception: true, kitchen: false, server: true, manager: false }, lastActive: '2 phút trước' },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@example.com', active: true, roles: { reception: false, kitchen: true, server: false, manager: false }, lastActive: '5 phút trước' },
    { id: '3', name: 'Lê Văn C', email: 'levanc@example.com', active: false, roles: { reception: false, kitchen: false, server: true, manager: false }, lastActive: '2 ngày trước' },
    { id: '4', name: 'Phạm Thị D', email: 'phamthid@example.com', active: true, roles: { reception: true, kitchen: true, server: true, manager: true }, lastActive: '1 phút trước' },
    { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@example.com', active: true, roles: { reception: false, kitchen: true, server: false, manager: false }, lastActive: '10 phút trước' },
];

export const activityLogs: ActivityLog[] = [
    { id: '1', action: 'Đăng nhập', timestamp: '14:32', details: 'Nguyễn Văn A đã đăng nhập' },
    { id: '2', action: 'Cập nhật đặt bàn', timestamp: '14:15', details: 'Trần Thị B đã cập nhật booking #B003' },
    { id: '3', action: 'Thêm nhân viên', timestamp: '13:45', details: 'Phạm Thị D đã thêm tài khoản mới' },
    { id: '4', action: 'Đổi mật khẩu', timestamp: '12:00', details: 'Hoàng Văn E đã đổi mật khẩu' },
];

export const areas: Area[] = [
    { id: '1', name: 'Tầng 1 - Sảnh chính', capacity: 60 },
    { id: '2', name: 'Tầng 2 - VIP', capacity: 40 },
    { id: '3', name: 'Tầng 3 - Sự kiện', capacity: 150 },
];
