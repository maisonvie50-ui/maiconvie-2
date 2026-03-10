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
    }
};
