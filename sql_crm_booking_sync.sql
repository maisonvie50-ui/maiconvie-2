-- ==========================================
-- GIAI ĐOẠN 8: TÍCH HỢP ĐỒNG BỘ BOOKING VÀ CRM
-- ==========================================

-- 1. Bổ sung cột customer_id vào bảng bookings (nếu chưa có)
-- Ta dùng DO block để tránh lỗi nếu cột đã tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='customer_id') THEN
        ALTER TABLE bookings ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Tạo hoặc thay thế Database Function để xử lý Trigger
CREATE OR REPLACE FUNCTION sync_booking_to_crm()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_visit_count INT;
    v_no_show_count INT;
    v_total_spent INT;
BEGIN
    -- Chỉ xử lý khi status thay đổi sang completed/no_show/cancelled
    -- (và đảm bảo trạng thái thực sự thay đổi cờ chứ không phải update record chung chung)
    IF NEW.status NOT IN ('completed', 'no_show', 'cancelled') THEN
        RETURN NEW;
    END IF;
    
    -- Nếu không có customer_id, bỏ qua (không thể nhét vào lịch sử của ai)
    v_customer_id := NEW.customer_id;
    IF v_customer_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Kiểm tra xem đã có visit record cho booking_id này để tránh tạo trùng nếu trigger chạy nhầm
    -- (Tuy nhiên bảng customer_visits chưa có booking_id, để an toàn ta cứ insert lỏng lẻo trước)
    -- Gợi ý: Sau này nên có ALTER TABLE customer_visits ADD COLUMN booking_id UUID.
    
    -- Tạo bản ghi lịch sử ghé thăm (customer_visit)
    -- status của customer_visits là: 'completed', 'cancelled', 'no-show'
    INSERT INTO customer_visits (customer_id, visit_date, amount, status, pax)
    VALUES (
        v_customer_id,
        CURRENT_DATE,
        0, -- Tạm thời gán tiền là 0 (Đợi module tính tiền bổ sung)
        CASE NEW.status
            WHEN 'completed' THEN 'completed'
            WHEN 'no_show' THEN 'no-show'
            WHEN 'cancelled' THEN 'cancelled'
        END,
        NEW.pax
    );
    
    -- === CẬP NHẬT LẠI SUMMARY CỦA CUSTOMER ===
    
    -- Đếm tổng số lần ghé (Chỉ tính các visit 'completed' hoặc 'no-show', hoặc cả hai)
    SELECT COUNT(*) INTO v_visit_count
    FROM customer_visits 
    WHERE customer_id = v_customer_id AND status IN ('completed', 'no-show');
    
    -- Đếm số lần bùng bàn
    SELECT COUNT(*) INTO v_no_show_count
    FROM customer_visits 
    WHERE customer_id = v_customer_id AND status = 'no-show';
    
    -- Cộng dồn doanh thu
    SELECT COALESCE(SUM(amount), 0) INTO v_total_spent
    FROM customer_visits 
    WHERE customer_id = v_customer_id AND status = 'completed';
    
    -- Update bảng parent Customers
    UPDATE customers SET
        visit_count = v_visit_count,
        no_show_rate = CASE 
            WHEN v_visit_count > 0 THEN ROUND(v_no_show_count::NUMERIC / v_visit_count, 2) 
            ELSE 0 
        END,
        total_spent = v_total_spent,
        -- Cập nhật nhóm tự động siêu xịn luôn
        customer_group = CASE
            WHEN v_visit_count >= 10 OR v_total_spent >= 10000000 THEN 'VIP'
            WHEN v_visit_count >= 3 THEN 'Regular'
            ELSE 'New'
        END
    WHERE id = v_customer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Set up Trigger vào bảng Bookings
-- Bỏ trigger cũ nếu có
DROP TRIGGER IF EXISTS trg_sync_booking_crm ON bookings;

-- Tạo trigger mới, chỉ kích hoạt khí update dòng status
CREATE TRIGGER trg_sync_booking_crm
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION sync_booking_to_crm();
