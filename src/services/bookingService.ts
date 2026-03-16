import { supabase } from '../lib/supabase';
import { Booking, BookingStatus } from '../types/booking';
import { customerService } from './customerService';
import { orderService } from './orderService';
import { tableService } from './tableService';

export const bookingService = {
    // 1. Lấy danh sách Booking trong ngày hoặc từ trước tới nay
    async getBookings() {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }

        // Map cột database về camelCase data model của front-end
        return (data || []).map(b => ({
            id: b.id,
            customerName: b.customer_name,
            phone: b.phone,
            email: b.email,
            time: b.time,
            bookingDate: b.booking_date,
            pax: b.pax,
            status: b.status,
            notes: b.notes || [],
            area: b.area,
            source: b.source,
            customerType: b.customer_type,
            selectedMenus: b.selected_menus || [],
            tableId: b.table_id,
            tableName: b.table_name
        })) as Booking[];
    },

    // 2. Tạo Booking mới
    async createBooking(booking: Omit<Booking, 'id'>) {

        // --- Tích hợp CRM: Thử tìm hoặc tạo mới khách hàng qua SĐT ---
        let customerId = null;
        if (booking.phone) {
            customerId = await customerService.findOrCreateCustomerByPhone(booking.phone, booking.customerName);
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                customer_name: booking.customerName,
                phone: booking.phone,
                email: booking.email,
                time: booking.time,
                booking_date: booking.bookingDate,
                pax: booking.pax,
                status: booking.status,
                notes: booking.notes,
                area: booking.area,
                source: booking.source,
                customer_type: booking.customerType || 'retail',
                selected_menus: booking.selectedMenus || [],
                customer_id: customerId // Liên kết với CRM
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating booking:', error);
            throw error;
        }

        return {
            id: data.id,
            customerName: data.customer_name,
            phone: data.phone,
            email: data.email,
            time: data.time,
            bookingDate: data.booking_date,
            pax: data.pax,
            status: data.status,
            notes: data.notes || [],
            area: data.area,
            source: data.source,
            customerType: data.customer_type,
            selectedMenus: data.selected_menus || []
        } as Booking;
    },

    // 3. Cập nhật trạng thái
    async updateBookingStatus(id: string, status: BookingStatus) {
        const { error } = await supabase
            .from('bookings')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }

        // --- Đồng bộ trạng thái sang Sơ đồ bàn ---
        try {
            const { data: booking } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', id)
                .single();

            if (booking && booking.table_id) {
                if (status === 'arrived') {
                    await tableService.updateTableStatus(booking.table_id, {
                        status: 'occupied',
                        customerName: booking.customer_name,
                        time: booking.time,
                        notes: booking.notes,
                        bookingId: booking.id
                    } as any);
                } else if (status === 'completed' || status === 'cancelled' || status === 'no_show') {
                    await tableService.updateTableStatus(booking.table_id, {
                        status: 'empty',
                        customerName: undefined,
                        time: undefined,
                        notes: undefined,
                        bookingId: null as any
                    } as any);
                } else if (status === 'confirmed' || status === 'pending' || status === 'new' || status === 'change_requested' || status === 'waiting_info') {
                    await tableService.updateTableStatus(booking.table_id, {
                        status: 'reserved',
                        customerName: booking.customer_name,
                        time: booking.time,
                        notes: booking.notes,
                        bookingId: booking.id
                    } as any);
                }
            }
        } catch (err) {
            console.error('Error syncing table status:', err);
        }

        // --- Tự động đồng bộ sang KDS Bếp khi khách đến ---
        if (status === 'arrived') {
            try {
                // Fetch the booking details to get the menus
                const { data: booking, error: fetchError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;

                if (booking && booking.selected_menus && booking.selected_menus.length > 0) {
                    // Check if an order already exists for this booking to avoid duplicates
                    const { data: existingOrders } = await supabase
                        .from('orders')
                        .select('id')
                        .eq('booking_id', id);

                    if (!existingOrders || existingOrders.length === 0) {
                        const items = booking.selected_menus.map((menu: any) => {
                            let category = 'Món chính'; // Default fallback
                            if (menu.type === 'set' || menu.type === 'tour') {
                                category = 'Món chính'; // We route Sets to principal cook
                            }
                            return {
                                name: menu.name,
                                quantity: menu.quantity,
                                notes: ['Khách đặt trước (Web)'],
                                category: category
                            };
                        });

                        const tableName = booking.table_name || `Bàn đặt (${booking.customer_name})`;
                        await orderService.createOrder(tableName, items, booking.table_id || undefined, id);
                        console.log('Automatically synced menus to Kitchen for booking:', id);
                    }
                }
            } catch (err) {
                console.error('Error auto-syncing to kitchen:', err);
                // We don't throw here so it doesn't break the status update if the sync fails
            }
        }
    },

    // 4. Update toàn bộ thông tin
    async updateBooking(id: string, updates: Partial<Booking>) {
        // Fetch old booking to check for table changes
        const { data: oldBooking } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        const dbUpdates: any = {};
        if (updates.customerName) dbUpdates.customer_name = updates.customerName;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.time) dbUpdates.time = updates.time;
        if (updates.bookingDate) dbUpdates.booking_date = updates.bookingDate;
        if (updates.pax) dbUpdates.pax = updates.pax;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.notes) dbUpdates.notes = updates.notes;
        if (updates.area) dbUpdates.area = updates.area;
        if (updates.source) dbUpdates.source = updates.source;
        if (updates.customerType) dbUpdates.customer_type = updates.customerType;
        if (updates.selectedMenus) dbUpdates.selected_menus = updates.selectedMenus;
        if (updates.tableId !== undefined) dbUpdates.table_id = updates.tableId;
        if (updates.tableName !== undefined) dbUpdates.table_name = updates.tableName;

        dbUpdates.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('bookings')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating booking:', error);
            throw error;
        }

        // --- Đồng bộ trạng thái sang Sơ đồ bàn ---
        if (oldBooking) {
            try {
                const oldTableId = oldBooking.table_id;
                const newTableId = updates.tableId !== undefined ? updates.tableId : oldTableId;
                const activeStatus = updates.status !== undefined ? updates.status : oldBooking.status;
                const customerName = updates.customerName !== undefined ? updates.customerName : oldBooking.customer_name;
                const time = updates.time !== undefined ? updates.time : oldBooking.time;
                const notes = updates.notes !== undefined ? updates.notes : oldBooking.notes;

                // If table changed, clear old table
                if (oldTableId && oldTableId !== newTableId) {
                    await tableService.updateTableStatus(oldTableId, {
                        status: 'empty',
                        customerName: undefined,
                        time: undefined,
                        notes: undefined,
                        bookingId: null as any
                    } as any);
                }

                // Sync to new/current table
                if (newTableId) {
                    let tableStatus: 'empty' | 'reserved' | 'occupied' = 'reserved';
                    if (activeStatus === 'arrived') tableStatus = 'occupied';
                    if (activeStatus === 'completed' || activeStatus === 'cancelled' || activeStatus === 'no_show') tableStatus = 'empty';

                    if (tableStatus === 'empty') {
                        await tableService.updateTableStatus(newTableId, {
                            status: 'empty',
                            customerName: undefined,
                            time: undefined,
                            notes: undefined,
                            bookingId: null as any
                        } as any);
                    } else {
                        await tableService.updateTableStatus(newTableId, {
                            status: tableStatus,
                            customerName: customerName,
                            time: time,
                            notes: notes || undefined,
                            bookingId: id
                        } as any);
                    }
                }
            } catch (err) {
                console.error('Error syncing table update:', err);
            }
        }
    },

    // 5. Nghe sự kiện thay đổi Realtime
    subscribeToBookings(callback: () => void) {
        return supabase
            .channel('public:bookings')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => {
                    console.log('Realtime change received!', payload);
                    callback();
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to bookings realtime!');
                }
            });
    },

    // 6. Tra cứu booking theo tên hoặc SĐT (Public)
    async searchBookingsByContact(query: string) {
        const trimmed = query.trim();
        if (!trimmed) return [];

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .or(`customer_name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error searching bookings:', error);
            throw error;
        }

        return (data || []).map(b => ({
            id: b.id,
            customerName: b.customer_name,
            phone: b.phone,
            email: b.email,
            time: b.time,
            bookingDate: b.booking_date,
            pax: b.pax,
            status: b.status,
            notes: b.notes || [],
            area: b.area,
            source: b.source,
            customerType: b.customer_type,
            selectedMenus: b.selected_menus || [],
            tableId: b.table_id,
            tableName: b.table_name,
            createdAt: b.created_at
        })) as (Booking & { createdAt?: string })[];
    }
};
