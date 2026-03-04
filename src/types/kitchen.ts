export type ItemStatus = 'pending' | 'cooking' | 'done';
export type ItemCategory = 'Khai vị' | 'Món chính' | 'Tráng miệng' | 'Đồ uống';

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    notes?: string[];
    status: ItemStatus;
    category: ItemCategory;
}

export interface OrderTicket {
    id: string;
    table: string;
    orderTime: Date;
    items: OrderItem[];
    status: 'pending' | 'completed';
    bookingStatus: 'confirmed' | 'pending' | 'new' | 'arrived';
}
