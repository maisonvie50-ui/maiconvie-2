-- Thêm cột phân loại khách hàng (Mặc định là Khách lẻ - retail)
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'retail';

-- Thêm cột lưu trữ dữ liệu thực đơn khách đã chọn (có thể null nếu khách không chọn)
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS selected_menus JSONB DEFAULT '[]'::jsonb;
