import { supabase } from '../lib/supabase';
import { Booking, BookingStatus } from '../types/booking';
import { customerService } from './customerService';
import { orderService } from './orderService';
import { tableService } from './tableService';
import { settingsService } from './settingsService';
import { bookingNotifyService } from './bookingNotifyService';
export const bookingService = {
    // === CHỐNG OVERBOOKING: Kiểm tra xung đột bàn/phòng ===
    async checkTableConflict(
        tableId: string,
        date: string,
        time: string,
        excludeBookingId?: string
    ): Promise<{ hasConflict: boolean; conflictBooking?: any }> {
        if (!tableId || !date || !time) return { hasConflict: false };

        try {
            // Lấy defaultDuration từ settings
            const settings = await settingsService.getAppSettings();
            const duration = settings?.defaultDuration || 120;

            const timeToMinutes = (t: string) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + (m || 0);
            };

            const reqStart = timeToMinutes(time);
            const reqEnd = reqStart + duration;

            // Lấy tất cả booking cùng ngày, cùng bàn, trạng thái active
            let query = supabase
                .from('bookings')
                .select('*')
                .eq('booking_date', date)
                .eq('table_id', tableId)
                .not('status', 'in', '("cancelled","no_show","completed")');

            if (excludeBookingId) {
                query = query.neq('id', excludeBookingId);
            }

            const { data: conflictBookings, error } = await query;
            if (error) {
                console.error('Error checking table conflict:', error);
                return { hasConflict: false };
            }

            // Kiểm tra overlap thời gian
            for (const b of (conflictBookings || [])) {
                const bStart = timeToMinutes(b.time);
                const bEnd = bStart + duration;
                // Hai khoảng thời gian overlap nếu: start1 < end2 AND end1 > start2
                if (reqStart < bEnd && reqEnd > bStart) {
                    return {
                        hasConflict: true,
                        conflictBooking: {
                            id: b.id,
                            customerName: b.customer_name,
                            time: b.time,
                            pax: b.pax,
                            endTime: `${Math.floor(bEnd / 60)}:${(bEnd % 60).toString().padStart(2, '0')}`,
                            status: b.status
                        }
                    };
                }
            }

            return { hasConflict: false };
        } catch (err) {
            console.error('checkTableConflict error:', err);
            return { hasConflict: false };
        }
    },

    // Lấy danh sách booking active theo ngày (dùng cho UI xếp bàn)
    async getActiveBookingsForDate(date: string) {
        if (!date) return [];
        try {
            const settings = await settingsService.getAppSettings();
            const duration = settings?.defaultDuration || 120;

            const { data, error } = await supabase
                .from('bookings')
                .select('id, customer_name, phone, time, pax, status, table_id, table_name, booking_date')
                .eq('booking_date', date)
                .not('status', 'in', '("cancelled","no_show","completed")');

            if (error) throw error;

            return (data || []).map(b => {
                const timeToMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
                const startMin = timeToMinutes(b.time);
                const endMin = startMin + duration;
                return {
                    id: b.id,
                    customerName: b.customer_name,
                    phone: b.phone,
                    time: b.time,
                    endTime: `${Math.floor(endMin / 60)}:${(endMin % 60).toString().padStart(2, '0')}`,
                    pax: b.pax,
                    status: b.status,
                    tableId: b.table_id,
                    tableName: b.table_name
                };
            });
        } catch (err) {
            console.error('getActiveBookingsForDate error:', err);
            return [];
        }
    },

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
            tableName: b.table_name,
            bookingCode: b.booking_code,
            linked_table_ids: b.linked_table_ids || [],
            linked_table_names: b.linked_table_names || [],
            changeRequestData: b.change_request_data || b.changeRequestData || undefined,
            lang: b.lang || 'vi',
        })) as Booking[];
    },

    // 2. Tạo Booking mới
    async createBooking(booking: Omit<Booking, 'id'>) {

        // --- CHỐNG OVERBOOKING: Kiểm tra xung đột bàn trước khi tạo ---
        if (booking.tableId && booking.bookingDate && booking.time) {
            const conflict = await bookingService.checkTableConflict(
                booking.tableId, booking.bookingDate, booking.time
            );
            if (conflict.hasConflict) {
                const cb = conflict.conflictBooking;
                throw new Error(
                    `⚠️ Bàn này đã có booking của "${cb.customerName}" từ ${cb.time}-${cb.endTime} (${cb.pax} khách). Vui lòng chọn bàn khác hoặc thời gian khác.`
                );
            }
        }

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
                booking_code: booking.bookingCode,
                table_id: booking.tableId || null,
                table_name: booking.tableName || null,
                linked_table_ids: booking.linked_table_ids || [],
                linked_table_names: booking.linked_table_names || [],
                customer_id: customerId, // Liên kết với CRM
                lang: booking.lang || 'vi',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating booking:', error);
            throw error;
        }

        const result = {
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
            selectedMenus: data.selected_menus || [],
            tableId: data.table_id,
            tableName: data.table_name,
            bookingCode: data.booking_code,
            linked_table_ids: data.linked_table_ids || [],
            linked_table_names: data.linked_table_names || [],
            lang: data.lang || 'vi',
        } as Booking;

        // Fire-and-forget: thông báo booking mới qua webhook/email
        bookingNotifyService.notifyNewBooking(result).catch(() => {});

        return result;
    },

    // 3. Cập nhật trạng thái
    async updateBookingStatus(id: string, status: BookingStatus) {
        // Lấy trạng thái cũ trước khi cập nhật (cho notification)
        let oldStatus: BookingStatus | undefined;
        try {
            const { data: current } = await supabase
                .from('bookings')
                .select('status')
                .eq('id', id)
                .single();
            if (current) oldStatus = current.status as BookingStatus;
        } catch { /* ignore */ }

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

            // Fire-and-forget: thông báo thay đổi trạng thái qua webhook/email
            if (booking && oldStatus && oldStatus !== status) {
                // --- Enrich: lấy tên bàn từ tables nếu thiếu ---
                let resolvedTableName = booking.table_name || '';
                let resolvedArea = booking.area || '';
                if (booking.table_id && !resolvedTableName) {
                    try {
                        const { data: tbl } = await supabase
                            .from('tables')
                            .select('name, area')
                            .eq('id', booking.table_id)
                            .single();
                        if (tbl) {
                            resolvedTableName = tbl.name || '';
                            if (tbl.area && !resolvedArea) resolvedArea = tbl.area;
                        }
                    } catch { /* ignore */ }
                }

                // --- Enrich: resolve menu names nếu selected_menus chỉ chứa ID ---
                let resolvedMenus = booking.selected_menus || [];
                if (resolvedMenus.length > 0) {
                    // Nếu phần tử đầu tiên không có field name/title → cần lookup
                    const firstItem = resolvedMenus[0];
                    const hasName = typeof firstItem === 'object' && firstItem !== null && (firstItem.name || firstItem.title);
                    if (!hasName) {
                        try {
                            // selected_menus có thể là array of IDs hoặc array of {id, ...}
                            const menuIds = resolvedMenus.map((m: any) => typeof m === 'string' ? m : m?.id).filter(Boolean);
                            if (menuIds.length > 0) {
                                const { data: menus } = await supabase
                                    .from('menus')
                                    .select('id, name, title')
                                    .in('id', menuIds);
                                if (menus && menus.length > 0) {
                                    resolvedMenus = menus.map((m: any) => ({ id: m.id, name: m.name || m.title || m.id }));
                                }
                            }
                        } catch { /* ignore */ }
                    }
                }

                const bookingData = {
                    id: booking.id,
                    customerName: booking.customer_name,
                    phone: booking.phone,
                    email: booking.email,
                    time: booking.time,
                    bookingDate: booking.booking_date,
                    pax: booking.pax,
                    status: status,
                    notes: booking.notes || [],
                    area: resolvedArea,
                    source: booking.source,
                    customerType: booking.customer_type,
                    selectedMenus: resolvedMenus,
                    tableId: booking.table_id,
                    tableName: resolvedTableName,
                    lang: booking.lang || 'vi',
                } as Booking;
                bookingNotifyService.notifyStatusChange(bookingData, oldStatus, status).catch(() => {});
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

        // --- CHỐNG OVERBOOKING: Kiểm tra xung đột khi đổi bàn ---
        const newTableId = updates.tableId !== undefined ? updates.tableId : oldBooking?.table_id;
        const newDate = updates.bookingDate || oldBooking?.booking_date;
        const newTime = updates.time || oldBooking?.time;
        if (newTableId && newDate && newTime) {
            // Chỉ check nếu bàn hoặc thời gian thay đổi
            const tableChanged = updates.tableId !== undefined && updates.tableId !== oldBooking?.table_id;
            const timeChanged = (updates.time && updates.time !== oldBooking?.time) || (updates.bookingDate && updates.bookingDate !== oldBooking?.booking_date);
            if (tableChanged || timeChanged) {
                const conflict = await bookingService.checkTableConflict(
                    newTableId, newDate, newTime, id
                );
                if (conflict.hasConflict) {
                    const cb = conflict.conflictBooking;
                    throw new Error(
                        `⚠️ Bàn này đã có booking của "${cb.customerName}" từ ${cb.time}-${cb.endTime} (${cb.pax} khách). Vui lòng chọn bàn khác hoặc thời gian khác.`
                    );
                }
            }
        }

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
        if (updates.tableId !== undefined) dbUpdates.table_id = updates.tableId || null;
        if (updates.tableName !== undefined) dbUpdates.table_name = updates.tableName || null;
        if (updates.bookingCode !== undefined) dbUpdates.booking_code = updates.bookingCode;
        if (updates.linked_table_ids !== undefined) dbUpdates.linked_table_ids = updates.linked_table_ids;
        if (updates.linked_table_names !== undefined) dbUpdates.linked_table_names = updates.linked_table_names;

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

    // 5.1. Duyệt yêu cầu đổi giờ/ngày từ khách
    async approveChangeRequest(id: string) {
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching booking for change approval:', fetchError);
            throw fetchError;
        }

        const requestData = booking?.change_request_data || booking?.changeRequestData;
        if (!requestData) {
            await bookingService.updateBookingStatus(id, 'confirmed');
            return;
        }

        const updates: any = {
            status: 'confirmed',
            change_request_data: null,
            updated_at: new Date().toISOString()
        };

        if (requestData.requested_time) updates.time = requestData.requested_time;
        if (requestData.requested_date) updates.booking_date = requestData.requested_date;
        if (requestData.requested_pax) updates.pax = requestData.requested_pax;

        const { error } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error approving change request:', error);
            throw error;
        }
    },

    // 5.2. Từ chối yêu cầu đổi giờ/ngày từ khách
    async rejectChangeRequest(id: string) {
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'confirmed',
                change_request_data: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error rejecting change request:', error);
            throw error;
        }
    },

    // 5. Nghe sự kiện thay đổi Realtime
    // Counter ensures each subscriber gets a unique channel name to avoid conflicts
    _bookingsChannelCounter: 0,
    subscribeToBookings(callback: (payload: any) => void) {
        const channelName = `bookings-rt-${++this._bookingsChannelCounter}-${Date.now()}`;
        return supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => {
                    console.log(`[${channelName}] Realtime change received!`, payload);
                    callback(payload);
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[${channelName}] Successfully subscribed to bookings realtime!`);
                }
                if (err) {
                    console.error(`[${channelName}] Subscription error:`, err);
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
            .or(`customer_name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%,email.ilike.%${trimmed}%,booking_code.ilike.%${trimmed}%`)
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
            bookingCode: b.booking_code,
            linked_table_ids: b.linked_table_ids || [],
            linked_table_names: b.linked_table_names || [],
            changeRequestData: b.change_request_data || b.changeRequestData || undefined,
            createdAt: b.created_at
        })) as (Booking & { createdAt?: string })[];
    },

    async searchBookingSecure(query: string, phoneLast4: string) {
        const trimmed = query.trim();
        const last4 = phoneLast4.replace(/\D/g, '').slice(-4);
        if (!trimmed || last4.length !== 4) return [];

        const isPhoneQuery = /\d/.test(trimmed) && trimmed.replace(/\D/g, '').length >= 4;
        const phoneDigits = trimmed.replace(/\D/g, '');

        let request = supabase
            .from('bookings')
            .select('*');

        if (isPhoneQuery) {
            request = request.or(`phone.eq.${phoneDigits},phone.like.%${phoneDigits}`);
        } else {
            request = request.or(`email.eq.${trimmed},booking_code.eq.${trimmed}`);
        }

        const { data, error } = await request
            .like('phone', `%${last4}`)
            .neq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error searching bookings securely:', error);
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
            bookingCode: b.booking_code || '',
            linked_table_ids: b.linked_table_ids || [],
            linked_table_names: b.linked_table_names || [],
            createdAt: b.created_at,
            changeRequestData: b.change_request_data
        })) as (Booking & { createdAt?: string; changeRequestData?: any })[];
    },

    async submitChangeRequest(id: string, requestData: any) {
        const { error } = await supabase
            .from('bookings')
            .update({ change_request_data: requestData, status: 'change_requested' })
            .eq('id', id);
        if (error) {
            console.error('Error submitting change request:', error);
            throw error;
        }
    },

    async updateBookingMenus(id: string, selectedMenus: any[]) {
        const { error } = await supabase
            .from('bookings')
            .update({ selected_menus: selectedMenus })
            .eq('id', id);
        if (error) {
            console.error('Error updating booking menus:', error);
            throw error;
        }
    },

    async cancelBookingByCustomer(booking: Booking) {
        if (booking.status === 'arrived' || booking.status === 'completed') {
            throw new Error('Đơn đã được xử lý hoặc hoàn thành không thể hủy.');
        }

        if (booking.bookingDate && booking.time) {
            const now = new Date();
            let normalizedDate = booking.bookingDate;
            if (normalizedDate.includes('/')) {
                const parts = normalizedDate.split('/');
                if (parts.length === 3) normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            const bookingAt = new Date(`${normalizedDate}T${booking.time}:00`);
            if (!Number.isNaN(bookingAt.getTime())) {
                const hoursUntilBooking = (bookingAt.getTime() - now.getTime()) / 36e5;
                if (hoursUntilBooking < 2 && hoursUntilBooking >= 0) {
                    throw new Error('Đã quá thời hạn hệ thống (chỉ hỗ trợ ít nhất 2 giờ trước giờ đặt). Xin vui lòng liên hệ hotline.');
                }
                if (hoursUntilBooking < 0) {
                    throw new Error('Đơn đặt bàn trong quá khứ không thể hủy trên hệ thống.');
                }
            }
        }

        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', booking.id);
        if (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
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
