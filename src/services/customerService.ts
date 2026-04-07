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
     * Import multiple customers
     */
    importCustomers: async (customersList: Array<{ name: string, phone: string, email: string, customer_group: string }>): Promise<{ success: number, errors: string[] }> => {
        let successCount = 0;
        const errors: string[] = [];

        // Simple loop to insert one by one to handle duplicates individually
        for (const cust of customersList) {
            try {
                // Check if phone exists
                const { data: existing } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('phone', cust.phone)
                    .maybeSingle();

                if (existing) {
                    errors.push(`Số điện thoại ${cust.phone} đã tồn tại`);
                    continue;
                }

                const { error } = await supabase
                    .from('customers')
                    .insert({
                        name: cust.name,
                        phone: cust.phone,
                        email: cust.email,
                        customer_group: cust.customer_group || 'New',
                        total_spent: 0,
                        visit_count: 0,
                        no_show_rate: 0
                    });

                if (error) {
                    errors.push(`Lỗi tải lên cho ${cust.name}: ${error.message}`);
                } else {
                    successCount++;
                }
            } catch (err: any) {
                errors.push(`Lỗi ngoại lệ với ${cust.name}: ${err.message}`);
            }
        }

        return { success: successCount, errors };
    }
};
