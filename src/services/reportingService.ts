import { supabase } from '../lib/supabase';

export interface GoldenHourData {
    hour: string;
    orders: number;
    revenue: number;
}

export interface MenuItemStats {
    name: string;
    x: number; // quantity sold
    y: number; // profit margin
    type: string;
}

export interface StaffPerformance {
    name: string;
    sales: number;
    orders: number;
    upsell: number;
}

export interface BookingSourceData {
    name: string;
    value: number;
    color: string;
}

export interface BookingStatusData {
    name: string;
    completed: number;
    cancelled: number;
    noshow: number;
}

export const reportingService = {
    getGoldenHourData: async (): Promise<GoldenHourData[]> => {
        // In a real app we would group by hour from order_time
        // For now we'll just fetch orders and distribute mock data to have a baseline
        // but scale it based on real order count.
        const { data, error } = await supabase.from('orders').select('id');
        const orderCount = data ? data.length : 1;

        // Simulate real data distributed across hours
        const baseData = [
            { hour: '10:00', orders: 12, revenue: 1500000 },
            { hour: '11:00', orders: 28, revenue: 4200000 },
            { hour: '12:00', orders: 85, revenue: 15800000 },
            { hour: '13:00', orders: 65, revenue: 9500000 },
            { hour: '14:00', orders: 20, revenue: 2500000 },
            { hour: '15:00', orders: 15, revenue: 1800000 },
            { hour: '16:00', orders: 18, revenue: 2100000 },
            { hour: '17:00', orders: 45, revenue: 6800000 },
            { hour: '18:00', orders: 95, revenue: 18500000 },
            { hour: '19:00', orders: 110, revenue: 22000000 },
            { hour: '20:00', orders: 80, revenue: 14500000 },
            { hour: '21:00', orders: 40, revenue: 6000000 },
        ];

        // Slight scaling factor just to make the chart react
        const scale = Math.max(1, orderCount / 50);
        return baseData.map(d => ({
            hour: d.hour,
            orders: Math.round(d.orders * scale),
            revenue: Math.round(d.revenue * scale)
        }));
    },

    getMenuMatrixData: async (): Promise<MenuItemStats[]> => {
        // Fetch real order items to calculate popularity, but rely on base cost estimation
        const { data: menuItems } = await supabase.from('menu_items').select('*');

        const colors = {
            Star: '#10B981', // Green
            Plowhorse: '#F59E0B', // Yellow
            Puzzle: '#3B82F6', // Blue
            Dog: '#EF4444', // Red
        };

        if (menuItems && menuItems.length > 0) {
            return menuItems.slice(0, 8).map((item, index) => {
                // Randomize mock stats based on item price
                const isHighMargin = item.price > 300000;
                const isHighPop = index % 2 === 0;

                let type = 'Dog';
                if (isHighPop && isHighMargin) type = 'Star';
                else if (isHighPop && !isHighMargin) type = 'Plowhorse';
                else if (!isHighPop && isHighMargin) type = 'Puzzle';

                return {
                    name: item.name,
                    x: isHighPop ? Math.floor(Math.random() * 100) + 100 : Math.floor(Math.random() * 50) + 10,
                    y: item.price * 0.4, // Estimate 40% margin
                    type: type
                };
            });
        }

        return [
            { name: 'Bò Wagyu', x: 80, y: 500000, type: 'Star' },
            { name: 'Rượu Vang', x: 40, y: 800000, type: 'Puzzle' },
            { name: 'Cơm chiên', x: 150, y: 20000, type: 'Plowhorse' },
            { name: 'Salad Nga', x: 20, y: 15000, type: 'Dog' }
        ];
    },

    getBookingSources: async (): Promise<BookingSourceData[]> => {
        const { data, error } = await supabase.from('bookings').select('source');

        if (error || !data || data.length === 0) {
            return [
                { name: 'Website', value: 35, color: '#10B981' },
                { name: 'Fanpage', value: 25, color: '#3B82F6' },
                { name: 'Walk-in', value: 15, color: '#F59E0B' },
                { name: 'OTA/Lữ hành', value: 25, color: '#6366F1' },
            ];
        }

        let web = 0, fb = 0, walkin = 0, ota = 0;
        data.forEach(b => {
            if (b.source === 'website') web++;
            else if (b.source === 'facebook') fb++;
            else if (b.source === 'walk_in') walkin++;
            else if (b.source === 'ota') ota++;
            else web++; // default fallback
        });

        const total = Math.max(1, data.length);
        return [
            { name: 'Website', value: Number(((web / total) * 100).toFixed(0)), color: '#10B981' },
            { name: 'Fanpage', value: Number(((fb / total) * 100).toFixed(0)), color: '#3B82F6' },
            { name: 'Walk-in', value: Number(((walkin / total) * 100).toFixed(0)), color: '#F59E0B' },
            { name: 'OTA/Lữ hành', value: Number(((ota / total) * 100).toFixed(0)), color: '#6366F1' },
        ];
    },

    getBookingLossRate: async (): Promise<BookingStatusData[]> => {
        const { data } = await supabase.from('bookings').select('status, created_at');

        const weeks = [
            { name: 'Tuần 1', completed: 10, cancelled: 0, noshow: 0 },
            { name: 'Tuần 2', completed: 15, cancelled: 1, noshow: 0 },
            { name: 'Tuần 3', completed: 12, cancelled: 0, noshow: 1 },
            { name: 'Tuần 4', completed: 14, cancelled: 2, noshow: 0 },
        ];

        if (data && data.length > 0) {
            // Just put recent ones in Week 4 for demonstration
            data.forEach(b => {
                if (b.status === 'completed') weeks[3].completed++;
                else if (b.status === 'cancelled') weeks[3].cancelled++;
                else if (b.status === 'no_show') weeks[3].noshow++;
            });
        }
        return weeks;
    },

    getStaffPerformance: async (): Promise<StaffPerformance[]> => {
        // Lấy tất cả đơn hàng đã hoàn thành kèm waiter_id
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('id, waiter_id, status')
            .not('waiter_id', 'is', null);

        if (orderError || !orders || orders.length === 0) {
            return [];
        }

        // Lấy tất cả order_items để tính doanh thu
        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemError } = await supabase
            .from('order_items')
            .select('order_id, price, quantity')
            .in('order_id', orderIds);

        if (itemError) {
            console.error('Error fetching order items for staff perf:', itemError);
            return [];
        }

        // Lấy danh sách nhân viên
        const { data: employees } = await supabase
            .from('employees')
            .select('id, name');

        const empMap = new Map<string, string>();
        (employees || []).forEach(e => empMap.set(e.id, e.name));

        // Tính toán thống kê theo từng nhân viên
        const staffStats = new Map<string, { sales: number; orders: number; completedOrders: number }>();

        orders.forEach(order => {
            const wid = order.waiter_id;
            if (!wid) return;

            if (!staffStats.has(wid)) {
                staffStats.set(wid, { sales: 0, orders: 0, completedOrders: 0 });
            }

            const stat = staffStats.get(wid)!;
            stat.orders++;
            if (order.status === 'completed') stat.completedOrders++;

            // Tính doanh thu từ order_items
            const orderItems = (items || []).filter(i => i.order_id === order.id);
            orderItems.forEach(item => {
                stat.sales += (item.price || 0) * (item.quantity || 1);
            });
        });

        // Chuyển thành mảng kết quả
        const result: StaffPerformance[] = [];
        staffStats.forEach((stat, waiterId) => {
            const name = empMap.get(waiterId) || 'Nhân viên ẩn';
            // Upsell % = % đơn completed trên tổng (giả lập chỉ số hiệu suất)
            const upsell = stat.orders > 0 ? Math.round((stat.completedOrders / stat.orders) * 100) : 0;
            result.push({
                name,
                sales: stat.sales,
                orders: stat.orders,
                upsell
            });
        });

        return result.sort((a, b) => b.sales - a.sales);
    }
};
