import { supabase } from '../lib/supabase';
import { Table, FloorZone } from '../types';

export const tableService = {
    // 1. Get all tables
    async getTables() {
        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching tables:', error);
            throw error;
        }

        return (data || []).map(t => ({
            id: t.id,
            name: t.name,
            type: t.type,
            status: t.status,
            pax: t.pax,
            floor: t.floor,
            x: t.x || 0,
            y: t.y || 0,
            customerName: t.customer_name,
            time: t.time,
            duration: t.duration,
            notes: t.notes,
            bookingId: t.booking_id
        })) as Table[];
    },

    // 2. Get floor zones
    async getFloorZones() {
        const { data, error } = await supabase
            .from('floor_zones')
            .select('*');

        if (error) {
            console.error('Error fetching floor zones:', error);
            throw error;
        }

        return (data || []).map(z => ({
            id: z.id,
            name: z.name,
            floor: z.floor,
            type: z.type,
            x: z.x || '0',
            y: z.y || '0'
        })) as FloorZone[];
    },

    // 3. Update table status
    async updateTableStatus(id: string, updates: Partial<Table>) {
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
        if (updates.time !== undefined) dbUpdates.time = updates.time;
        if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.bookingId !== undefined) dbUpdates.booking_id = updates.bookingId;

        dbUpdates.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('tables')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating table:', error);
            throw error;
        }
    },

    // 4. Listen to real-time changes
    subscribeToTables(callback: () => void) {
        return supabase
            .channel('public:tables')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tables' },
                (payload) => {
                    console.log('Tables realtime change received!', payload);
                    callback();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to tables realtime!');
                }
            });
    }
};
