import type { OrderTicket, ItemCategory } from '../types';

export const categoryOrder: ItemCategory[] = ['Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống'];

export const initialOrders: OrderTicket[] = [
    {
        id: 'ORD-001',
        table: 'Bàn 3',
        orderTime: new Date(Date.now() - 15 * 60000),
        status: 'pending',
        bookingStatus: 'confirmed',
        items: [
            { id: 'i1', name: 'Bò Wagyu A5', quantity: 2, status: 'cooking', category: 'Món chính', notes: ['Medium rare'] },
            { id: 'i2', name: 'Súp bí đỏ', quantity: 1, status: 'done', category: 'Khai vị' },
            { id: 'i3', name: 'Salad Caesar', quantity: 1, status: 'pending', category: 'Khai vị' },
        ]
    },
    {
        id: 'ORD-002',
        table: 'VIP 2 (Orchid)',
        orderTime: new Date(Date.now() - 8 * 60000),
        status: 'pending',
        bookingStatus: 'confirmed',
        items: [
            { id: 'i4', name: 'Tôm hùm nướng', quantity: 1, status: 'cooking', category: 'Món chính' },
            { id: 'i5', name: 'Mỳ Ý Carbonara', quantity: 2, status: 'pending', category: 'Món chính' },
            { id: 'i6', name: 'Tiramisu', quantity: 3, status: 'pending', category: 'Tráng miệng' },
            { id: 'i7', name: 'Rượu vang đỏ', quantity: 1, status: 'done', category: 'Đồ uống' },
        ]
    },
    {
        id: 'ORD-003',
        table: 'Bàn 7',
        orderTime: new Date(Date.now() - 25 * 60000),
        status: 'pending',
        bookingStatus: 'new',
        items: [
            { id: 'i8', name: 'Cá hồi áp chảo', quantity: 3, status: 'done', category: 'Món chính' },
            { id: 'i9', name: 'Khoai tây chiên', quantity: 2, status: 'done', category: 'Khai vị' },
            { id: 'i10', name: 'Trà đào', quantity: 3, status: 'cooking', category: 'Đồ uống' },
        ]
    },
    {
        id: 'ORD-004',
        table: 'Bàn 1',
        orderTime: new Date(Date.now() - 3 * 60000),
        status: 'pending',
        bookingStatus: 'arrived',
        items: [
            { id: 'i11', name: 'Pizza Hải sản', quantity: 1, status: 'pending', category: 'Món chính' },
            { id: 'i12', name: 'Nước suối', quantity: 4, status: 'pending', category: 'Đồ uống' },
        ]
    },
];
