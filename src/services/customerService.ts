import { supabase } from '../lib/supabase';

export interface CustomerHistory {
    id: string;
    date: string;
    amount: string;
    status: 'completed' | 'cancelled' | 'no-show';
    pax: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    group: 'VIP' | 'Regular' | 'New';
    lastVisit: string;
    totalSpent: string;
    visitCount: number;
    noShowRate: number;
    tags: string[];
    history: CustomerHistory[];
}

export const customerService = {
    /**
     * Fetch all customers including their visit history
     */
    getCustomers: async (): Promise<Customer[]> => {
        const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (customersError) {
            console.error('Error fetching customers:', customersError);
            throw customersError;
        }

        const { data: visitsData, error: visitsError } = await supabase
            .from('customer_visits')
            .select('*')
            .order('visit_date', { ascending: false });

        if (visitsError) {
            console.error('Error fetching visits:', visitsError);
            throw visitsError;
        }

        // Map and format the data
        return customersData.map(customer => {
            const customerVisits = visitsData.filter(v => v.customer_id === customer.id);

            const history = customerVisits.map(v => ({
                id: v.id,
                date: new Date(v.visit_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                amount: v.amount.toLocaleString('vi-VN') + 'đ',
                status: v.status as 'completed' | 'cancelled' | 'no-show',
                pax: v.pax
            }));

            // Find last visit
            const completedVisits = customerVisits.filter(v => v.status === 'completed');
            let lastVisit = 'Chưa có';
            if (completedVisits.length > 0) {
                lastVisit = new Date(completedVisits[0].visit_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }

            return {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                group: customer.customer_group as 'VIP' | 'Regular' | 'New',
                lastVisit: lastVisit,
                totalSpent: customer.total_spent.toLocaleString('vi-VN') + 'đ',
                visitCount: customer.visit_count,
                noShowRate: customer.no_show_rate,
                tags: customer.tags || [],
                history: history
            };
        });
    },

    /**
     * Subscribe to customer changes
     */
    subscribeToCustomers: (callback: () => void) => {
        const customersSubscription = supabase
            .channel('customers_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                callback
            )
            .subscribe();

        const visitsSubscription = supabase
            .channel('customer_visits_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'customer_visits' },
                callback
            )
            .subscribe();

        return () => {
            customersSubscription.unsubscribe();
            visitsSubscription.unsubscribe();
        };
    },

    /**
     * Find existing customer by phone or create a new one
     */
    findOrCreateCustomerByPhone: async (phone: string, name: string): Promise<string | null> => {
        if (!phone) return null;

        // 1. Try to find existing
        const { data: existing, error: searchError } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', phone)
            .maybeSingle();

        if (searchError) {
            console.error('Error searching customer:', searchError);
            return null;
        }

        if (existing) {
            return existing.id;
        }

        // 2. Not found, create new
        const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert({
                name: name,
                phone: phone,
                customer_group: 'New',
                total_spent: 0,
                visit_count: 0,
                no_show_rate: 0
            })
            .select('id')
            .single();

        if (createError) {
            console.error('Error creating new customer:', createError);
            return null;
        }

        return newCustomer?.id || null;
    },

    /**
     * Update customer info (name, phone, email, group, tags)
     */
    updateCustomer: async (id: string, updates: Partial<Pick<Customer, 'name' | 'phone' | 'email' | 'group' | 'tags'>>) => {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.group !== undefined) payload.customer_group = updates.group;
        if (updates.tags !== undefined) payload.tags = updates.tags;

        const { error } = await supabase
            .from('customers')
            .update(payload)
            .eq('id', id);

        if (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },

    /**
     * Bulk import customers from CSV data
     */
    importCustomers: async (rows: { name: string; phone: string; email: string; group: string }[]): Promise<{ success: number; skipped: number }> => {
        let success = 0;
        let skipped = 0;

        for (const row of rows) {
            // Check duplicate by phone
            const { data: existing } = await supabase
                .from('customers')
                .select('id')
                .eq('phone', row.phone)
                .maybeSingle();

            if (existing) {
                skipped++;
                continue;
            }

            const { error } = await supabase
                .from('customers')
                .insert({
                    name: row.name,
                    phone: row.phone,
                    email: row.email || null,
                    customer_group: row.group || 'New',
                    total_spent: 0,
                    visit_count: 0,
                    no_show_rate: 0,
                    tags: []
                });

            if (error) {
                console.error('Error importing customer:', error);
                skipped++;
            } else {
                success++;
            }
        }

        return { success, skipped };
    }
};
