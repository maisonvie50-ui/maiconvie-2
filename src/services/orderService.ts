import { supabase } from '../lib/supabase';

type ItemStatus = 'pending' | 'cooking' | 'done';
type ItemCategory = string; // e.g. 'Khai vị' | 'Món chính' | 'Tráng miệng' | 'Đồ uống' | 'Set Menu' | 'Khác';

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string[];
    status: ItemStatus;
    category: ItemCategory;
}

export interface OrderTicket {
    id: string;
    table: string;
    tableId?: string;
    bookingId?: string;
    customerName?: string;
    customerPhone?: string;
    orderTime: Date;
    items: OrderItem[];
    status: 'pending' | 'completed' | 'cancelled';
    bookingStatus: 'confirmed' | 'pending' | 'new' | 'arrived';
}

export const orderService = {
    // 1. Get all active orders with their items
    async getOrders(): Promise<OrderTicket[]> {
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'pending')
            .order('order_time', { ascending: true });

        if (orderError) {
            console.error('Error fetching orders:', orderError);
            throw orderError;
        }

        if (!orders || orders.length === 0) return [];

        // Fetch all items for these orders
        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        if (itemError) {
            console.error('Error fetching order items:', itemError);
            throw itemError;
        }

        // Map to OrderTicket format
        return orders.map(order => ({
            id: order.id,
            table: order.table_name,
            tableId: order.table_id,
            bookingId: order.booking_id,
            orderTime: new Date(order.order_time),
            status: order.status,
            bookingStatus: order.booking_status || 'confirmed',
            items: (items || [])
                .filter(item => item.order_id === order.id)
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price || 0,
                    notes: item.notes || [],
                    status: item.status as ItemStatus,
                    category: item.category as ItemCategory
                }))
        }));
    },

    // Get orders by table ID (useful for billing/checkout)
    async getOrdersByTableId(tableId: string): Promise<OrderTicket[]> {
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('table_id', tableId)
            .eq('status', 'pending')
            .order('order_time', { ascending: true });

        if (orderError) {
            console.error('Error fetching orders by table:', orderError);
            throw orderError;
        }

        if (!orders || orders.length === 0) return [];

        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        if (itemError) {
            console.error('Error fetching order items:', itemError);
            throw itemError;
        }

        return orders.map(order => ({
            id: order.id,
            table: order.table_name,
            tableId: order.table_id,
            bookingId: order.booking_id,
            orderTime: new Date(order.order_time),
            status: order.status,
            bookingStatus: order.booking_status || 'confirmed',
            items: (items || [])
                .filter(item => item.order_id === order.id)
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price || 0,
                    notes: item.notes || [],
                    status: item.status as ItemStatus,
                    category: item.category as ItemCategory
                }))
        }));
    },

    // Get order by Booking Id
    async getOrdersByBookingId(bookingId: string): Promise<OrderTicket[]> {
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('booking_id', bookingId)
            .eq('status', 'pending') // Usually we bill what's pending to be closed
            .order('order_time', { ascending: true });

        if (orderError) {
            console.error('Error fetching orders by booking:', orderError);
            throw orderError;
        }

        if (!orders || orders.length === 0) return [];

        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        if (itemError) {
            console.error('Error fetching order items:', itemError);
            throw itemError;
        }

        return orders.map(order => ({
            id: order.id,
            table: order.table_name,
            tableId: order.table_id,
            bookingId: order.booking_id,
            orderTime: new Date(order.order_time),
            status: order.status,
            bookingStatus: order.booking_status || 'confirmed',
            items: (items || [])
                .filter(item => item.order_id === order.id)
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price || 0,
                    notes: item.notes || [],
                    status: item.status as ItemStatus,
                    category: item.category as ItemCategory
                }))
        }));
    },

    // 2. Update item status (pending -> cooking -> done)
    async updateItemStatus(itemId: string, status: ItemStatus) {
        const { error } = await supabase
            .from('order_items')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', itemId);

        if (error) {
            console.error('Error updating item status:', error);
            throw error;
        }
    },

    // 3. Mark all items in an order as done
    async markAllItemsDone(orderId: string) {
        const { error } = await supabase
            .from('order_items')
            .update({ status: 'done', updated_at: new Date().toISOString() })
            .eq('order_id', orderId);

        if (error) {
            console.error('Error marking all items done:', error);
            throw error;
        }
    },

    // 4. Complete an order
    async completeOrder(orderId: string) {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (error) {
            console.error('Error completing order:', error);
            throw error;
        }
    },

    // 5. Create a new order (from OrderPad)
    async createOrder(tableName: string, items: { name: string; quantity: number; price: number; notes?: string[]; category: string }[], tableId?: string, bookingId?: string) {
        // Insert the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                table_name: tableName,
                table_id: tableId || null,
                booking_id: bookingId || null,
                status: 'pending',
                booking_status: 'confirmed',
                order_time: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error('Error creating order:', orderError);
            throw orderError;
        }

        // Insert items
        const orderItems = items.map(item => ({
            order_id: order.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price || 0,
            notes: item.notes || [],
            status: 'pending',
            category: item.category
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            throw itemsError;
        }

        return order;
    },

    // 6. Update table name in all pending orders (when table is renamed)
    async updateTableNameInOrders(tableId: string, newTableName: string) {
        const { error } = await supabase
            .from('orders')
            .update({ table_name: newTableName, updated_at: new Date().toISOString() })
            .eq('table_id', tableId)
            .eq('status', 'pending');

        if (error) {
            console.error('Error updating table name in orders:', error);
            throw error;
        }
    },

    // 7. Subscribe to realtime changes on orders
    subscribeToOrders(callback: () => void) {
        return supabase
            .channel('kitchen-orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => callback()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'order_items' },
                () => callback()
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to kitchen orders realtime!');
                }
            });
    },

    // 8. Get completed orders (for Order History page)
    async getCompletedOrders(filters?: { dateFrom?: string; dateTo?: string; searchTable?: string }): Promise<OrderTicket[]> {
        let query = supabase
            .from('orders')
            .select(`
                *,
                bookings:booking_id (
                    customer_name,
                    phone
                )
            `)
            .eq('status', 'completed')
            .order('order_time', { ascending: false });

        if (filters?.dateFrom) {
            query = query.gte('order_time', filters.dateFrom);
        }
        if (filters?.dateTo) {
            // Add 1 day to include the entire "dateTo" day
            const endDate = new Date(filters.dateTo);
            endDate.setDate(endDate.getDate() + 1);
            query = query.lt('order_time', endDate.toISOString());
        }
        if (filters?.searchTable) {
            query = query.ilike('table_name', `%${filters.searchTable}%`);
        }

        const { data: orders, error: orderError } = await query;

        if (orderError) {
            console.error('Error fetching completed orders:', orderError);
            throw orderError;
        }

        if (!orders || orders.length === 0) return [];

        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        if (itemError) {
            console.error('Error fetching order items:', itemError);
            throw itemError;
        }

        return orders.map(order => ({
            id: order.id,
            table: order.table_name,
            tableId: order.table_id,
            bookingId: order.booking_id,
            customerName: order.bookings?.customer_name,
            customerPhone: order.bookings?.phone,
            orderTime: new Date(order.order_time),
            status: order.status,
            bookingStatus: order.booking_status || 'confirmed',
            items: (items || [])
                .filter(item => item.order_id === order.id)
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price || 0,
                    notes: item.notes || [],
                    status: item.status as ItemStatus,
                    category: item.category as ItemCategory
                }))
        }));
    }
};
