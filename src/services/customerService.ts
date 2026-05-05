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
     * Import multiple customers from CSV
     */
    importCustomers: async (customers: any[]) => {
        let successCount = 0;
        let skippedCount = 0;
        const errors = [];

        // 1. Get existing phones to avoid duplicates
        const { data: existingPhones, error: fetchError } = await supabase
            .from('customers')
            .select('phone');

        if (fetchError) {
            console.error('Error fetching existing phones:', fetchError);
            return { success: 0, skipped: 0, errors: [fetchError] };
        }

        const phoneSet = new Set(existingPhones.map(c => c.phone));
        const newCustomersToInsert = [];
        const validGroups = ['VIP', 'Regular', 'New'];

        for (const c of customers) {
            if (!c.phone || phoneSet.has(c.phone)) {
                skippedCount++;
                continue;
            }
            if (newCustomersToInsert.some(nc => nc.phone === c.phone)) {
                skippedCount++;
                continue;
            }

            const group = validGroups.includes(c.group || '') ? c.group : 'New';

            newCustomersToInsert.push({
                name: c.name || 'Khách hàng',
                phone: c.phone,
                email: c.email || null,
                customer_group: group,
                total_spent: 0,
                visit_count: 0,
                no_show_rate: 0
            });
        }

        if (newCustomersToInsert.length === 0) {
            return { success: 0, skipped: skippedCount, errors: [] };
        }

        const batchSize = 500;
        for (let i = 0; i < newCustomersToInsert.length; i += batchSize) {
            const batch = newCustomersToInsert.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('customers')
                .insert(batch);

            if (insertError) {
                console.error('Batch insert error:', insertError);
                errors.push(insertError);
            } else {
                successCount += batch.length;
            }
        }

        return { success: successCount, skipped: skippedCount, errors };
    },

    /**
     * Update customer
     */
    updateCustomer: async (id: string, updates: Partial<Customer>) => {
        const updateData: any = {};
        
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.email !== undefined) updateData.email = updates.email;
        if (updates.group !== undefined) updateData.customer_group = updates.group;
        if (updates.tags !== undefined) updateData.tags = updates.tags;

        const { error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }
};
