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
    history: {
        date: string;
        amount: string;
        status: 'completed' | 'cancelled' | 'no-show';
        pax: number;
    }[];
}
