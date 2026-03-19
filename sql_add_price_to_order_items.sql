-- Kịch bản Migration (Update Database)
-- Lưu ý: Bạn cần chạy lệnh này trên giao diện SQL Editor của Supabase.
-- Lý do: Tính năng lưu lịch sử giá (cho Hóa đơn/Thanh toán) yêu cầu cột `price` trên từng mục Order đã gọi.

-- 1. Thêm cột 'price' vào bảng order_items nếu chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items' 
        AND column_name = 'price'
    ) THEN
        -- Thêm cột price với kiểu dư liệu NUMERIC (tương thích cho tiền tệ)
        ALTER TABLE public.order_items ADD COLUMN price NUMERIC;
        
        -- Cập nhật giá trị mặc định cho các dòng cũ để tránh lỗi NULL nếu cần 
        -- (hoặc gán mặc định là 0 để an toàn)
        UPDATE public.order_items SET price = 0 WHERE price IS NULL;
    END IF;
END $$;

-- 2. Tùy chọn: Xóa các Order / Booking rác cũ (Nếu bị lỗi do thiếu cấu trúc mới)
-- (Nếu bạn đang test, chỉ cần dùng script này để làm sạch môi trường)
-- DELETE FROM public.order_items;
-- DELETE FROM public.orders;

-- Báo cáo kết quả
SELECT 'Đã cập nhật xong cột price cho order_items' as status;
