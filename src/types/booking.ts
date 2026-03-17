export type BookingStatus = 'new' | 'waiting_info' | 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show' | 'change_requested' | 'pending';

export interface Booking {
  id: string;
  customerName: string;
  time: string;
  bookingDate?: string;
  pax: number;
  status: BookingStatus;
  notes?: string[];
  phone?: string;
  email?: string;
  area?: 'indoor' | 'outdoor' | 'vip' | 'rooftop';
  source?: string;
  customerType?: 'retail' | 'tour';
  selectedMenus?: any[];
  tableId?: string;
  tableName?: string;
}
