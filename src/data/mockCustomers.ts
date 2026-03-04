import type { Customer } from '../types';

export const customers: Customer[] = [
    {
        id: '1', name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@email.com',
        group: 'VIP', lastVisit: '2024-01-15', totalSpent: '45,000,000đ', visitCount: 32, noShowRate: 0,
        tags: ['Dị ứng tôm', 'Bàn cạnh cửa sổ'],
        history: [
            { date: '2024-01-15', amount: '2,500,000đ', status: 'completed', pax: 4 },
            { date: '2024-01-08', amount: '1,800,000đ', status: 'completed', pax: 2 },
            { date: '2024-01-01', amount: '3,200,000đ', status: 'completed', pax: 6 },
        ]
    },
    {
        id: '2', name: 'Trần Thị B', phone: '0912345678', email: 'tranthib@email.com',
        group: 'Regular', lastVisit: '2024-01-10', totalSpent: '12,000,000đ', visitCount: 8, noShowRate: 5,
        tags: ['Sinh nhật T3'],
        history: [
            { date: '2024-01-10', amount: '1,200,000đ', status: 'completed', pax: 2 },
            { date: '2023-12-25', amount: '2,000,000đ', status: 'cancelled', pax: 4 },
        ]
    },
    {
        id: '3', name: 'Lê Văn C', phone: '0923456789', email: 'levanc@email.com',
        group: 'VIP', lastVisit: '2024-01-14', totalSpent: '68,000,000đ', visitCount: 45, noShowRate: 2,
        tags: ['Rượu vang đỏ', 'Phòng VIP'],
        history: [
            { date: '2024-01-14', amount: '5,500,000đ', status: 'completed', pax: 8 },
        ]
    },
    {
        id: '4', name: 'Phạm Thị D', phone: '0934567890', email: 'phamthid@email.com',
        group: 'New', lastVisit: '2024-01-12', totalSpent: '800,000đ', visitCount: 1, noShowRate: 0,
        tags: [],
        history: [
            { date: '2024-01-12', amount: '800,000đ', status: 'completed', pax: 2 },
        ]
    },
    {
        id: '5', name: 'Hoàng Văn E', phone: '0945678901', email: 'hoangvane@email.com',
        group: 'Regular', lastVisit: '2024-01-05', totalSpent: '15,500,000đ', visitCount: 12, noShowRate: 15,
        tags: ['Hay hủy', 'Nhóm lớn'],
        history: [
            { date: '2024-01-05', amount: '1,500,000đ', status: 'no-show', pax: 6 },
            { date: '2023-12-20', amount: '2,500,000đ', status: 'completed', pax: 4 },
        ]
    },
];
