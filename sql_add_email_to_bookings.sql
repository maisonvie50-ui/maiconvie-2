-- Migration: Bổ sung trường email cho bảng bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- (Tùy chọn) Index để tìm kiếm theo email nhanh hơn nếu thư viện data lớn
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings (email);
