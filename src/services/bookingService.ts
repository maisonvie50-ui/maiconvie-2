import { supabase } from '../lib/supabase';
import { Booking, BookingStatus } from '../types/booking';
import { customerService } from './customerService';
import { orderService } from './orderService';
import { tableService } from './tableService';
import { settingsService } from './settingsService';
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
                        // Fetch all set and tour menus to get their courses
                        const { data: setMenusData } = await supabase.from('set_menus').select('name, courses');
                        const { data: tourMenusData } = await supabase.from('tour_menus').select('name, courses');

                        const allSets = [...(setMenusData || []), ...(tourMenusData || [])];

                        const items = booking.selected_menus.flatMap((menu: any) => {
                            let category = 'Món chính'; // Default fallback

                            if (menu.type === 'set' || menu.type === 'tour') {
                                // 1. Parent Combo item for billing
                                const comboItem = {
                                    name: menu.name,
                                    quantity: menu.quantity,
                                    price: menu.price || 0,
                                    notes: ['Khách đặt trước (Web)'],
                                    category: 'Combo'
                                };

                                // Find courses
                                const matchedSet = allSets.find(s => s.name === menu.name);

                                if (matchedSet && matchedSet.courses) {
                                    // 2. Individual courses
                                    const courseItems = matchedSet.courses.map((course: any) => {
                                        const titleLower = course.title.toLowerCase();
                                        let courseCat = 'Món chính';
                                        if (titleLower.includes('starter') || titleLower.includes('soup') || titleLower.includes('appetizer') || titleLower.includes('khai vị') || titleLower.includes('salad') || titleLower.includes('súp')) {
                                            courseCat = 'Khai vị';
                                        } else if (titleLower.includes('dessert') || titleLower.includes('tráng miệng')) {
                                            courseCat = 'Tráng miệng';
                                        }

                                        // Since they haven't explicitly chosen an option, we just use the first option
                                        const firstOption = course.options && course.options.length > 0 ? course.options[0] : null;
                                        const courseName = firstOption ? (firstOption.nameVn || firstOption.nameEn) : course.title.split('|')[0].trim();

                                        const hasMultipleOptions = course.options && course.options.length > 1;

                                        return {
                                            name: courseName,
                                            quantity: menu.quantity,
                                            price: 0,
                                            notes: [`Thuộc ${menu.name}`, hasMultipleOptions ? 'Khách chọn tại bàn' : 'Khách đặt trước (Web)'],
                                            category: courseCat
                                        };
                                    });
                                    return [comboItem, ...courseItems];
                                }

                                return [comboItem];
                            }

                            return [{
                                name: menu.name,
                                quantity: menu.quantity,
                                price: menu.price || 0,
                                notes: ['Khách đặt trước (Web)'],
                                category: category
                            }];
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
    },

    // 6. Kiểm tra chỗ trống và gợi ý giờ
    async checkAvailability(date: string, time: string, pax: number): Promise<{ isAvailable: boolean, suggestedSlots: string[] }> {
        try {
            // Lấy danh sách booking trong ngày (chưa hủy)
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('*')
                .eq('booking_date', date)
                .neq('status', 'cancelled')
                .neq('status', 'no_show');

            if (bookingsError) throw bookingsError;

            // Lấy settings để biết sức chứa và thời lượng mặc định
            const settings = await settingsService.getAppSettings();
            const totalCapacity = settings?.areas?.reduce((sum: number, area: any) => sum + area.capacity, 0) || 150; // Fallback
            const defaultDuration = settings?.defaultDuration || 120; // phút

            // Hàm chuyển đổi giờ "HH:mm" sang số phút từ 00:00
            const timeToMinutes = (t: string) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
            };

            const reqStart = timeToMinutes(time);
            const reqEnd = reqStart + defaultDuration;

            // Tính tổng số khách đang chiếm chỗ tại thời điểm yêu cầu
            let occupiedPaxAtReqTime = 0;
            (bookings || []).forEach(b => {
                const bStart = timeToMinutes(b.time);
                const bEnd = bStart + defaultDuration;
                // Kiểm tra xem thời gian có giao nhau không
                if (reqStart < bEnd && reqEnd > bStart) {
                    occupiedPaxAtReqTime += b.pax;
                }
            });

            if (occupiedPaxAtReqTime + pax <= totalCapacity) {
                return { isAvailable: true, suggestedSlots: [] };
            }

            // Nếu hết chỗ, tìm các slot gần nhất
            // Khởi tạo các slot hợp lệ trong ngày (VD: 11:00 đến 22:00, mỗi 30 phút)
            const allSlots = [];
            for (let i = 11; i <= 22; i++) {
                allSlots.push(`${i}:00`);
                if (i !== 22) allSlots.push(`${i}:30`);
            }

            const getOccupiedAtTime = (testTimeMinutes: number) => {
                const testEnd = testTimeMinutes + defaultDuration;
                let occ = 0;
                (bookings || []).forEach(b => {
                    const bStart = timeToMinutes(b.time);
                    const bEnd = bStart + defaultDuration;
                    if (testTimeMinutes < bEnd && testEnd > bStart) {
                        occ += b.pax;
                    }
                });
                return occ;
            };

            const availableSlots = allSlots.filter(slot => {
                const slotMins = timeToMinutes(slot);
                // Bỏ qua thời gian trong quá khứ nếu là hôm nay
                if (date === new Date().toISOString().split('T')[0]) {
                    const now = new Date();
                    const nowMins = now.getHours() * 60 + now.getMinutes();
                    if (slotMins <= nowMins) return false;
                }
                const occ = getOccupiedAtTime(slotMins);
                return occ + pax <= totalCapacity;
            });

            // Tìm 3 slot gần với thời gian yêu cầu nhất
            availableSlots.sort((a, b) => {
                const distA = Math.abs(timeToMinutes(a) - reqStart);
                const distB = Math.abs(timeToMinutes(b) - reqStart);
                return distA - distB;
            });

            const topSuggestions = availableSlots.slice(0, 3).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

            return { isAvailable: false, suggestedSlots: topSuggestions };

        } catch (error) {
            console.error('Error checking availability:', error);
            // Default to true if calculation fails to not block users, but log error
            return { isAvailable: true, suggestedSlots: [] };
        }
    }
};
