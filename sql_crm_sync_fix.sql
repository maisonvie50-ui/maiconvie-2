-- ==========================================
-- FIX: Trigger CRM tự tìm customer qua SĐT nếu customer_id bị NULL
-- ==========================================

-- 1. Backfill: Gán customer_id cho các booking cũ dựa trên SĐT
UPDATE bookings b
SET customer_id = c.id
FROM customers c
WHERE b.phone = c.phone
AND b.customer_id IS NULL;

-- 2. Cập nhật lại Trigger Function để tự tìm customer theo SĐT nếu customer_id null
CREATE OR REPLACE FUNCTION sync_booking_to_crm()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_visit_count INT;
    v_no_show_count INT;
    v_total_spent INT;
BEGIN
    -- Chỉ xử lý khi status thay đổi sang completed/no_show/cancelled
    IF NEW.status NOT IN ('completed', 'no_show', 'cancelled') THEN
        RETURN NEW;
    END IF;
    
    v_customer_id := NEW.customer_id;
    
    -- === MỚI: Nếu không có customer_id, thử tìm theo SĐT ===
    IF v_customer_id IS NULL AND NEW.phone IS NOT NULL AND NEW.phone != '' THEN
        SELECT id INTO v_customer_id FROM customers WHERE phone = NEW.phone LIMIT 1;
        
        -- Nếu vẫn không có, tạo mới khách hàng luôn
        IF v_customer_id IS NULL THEN
            INSERT INTO customers (name, phone, customer_group, total_spent, visit_count, no_show_rate)
            VALUES (NEW.customer_name, NEW.phone, 'New', 0, 0, 0)
            RETURNING id INTO v_customer_id;
        END IF;
        
        -- Cập nhật lại customer_id cho booking
        UPDATE bookings SET customer_id = v_customer_id WHERE id = NEW.id;
    END IF;
    
    -- Nếu vẫn không có customer_id thì bỏ qua
    IF v_customer_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Tạo bản ghi lịch sử ghé thăm (customer_visit)
    INSERT INTO customer_visits (customer_id, visit_date, amount, status, pax)
    VALUES (
        v_customer_id,
        CURRENT_DATE,
        0,
        CASE NEW.status
            WHEN 'completed' THEN 'completed'
            WHEN 'no_show' THEN 'no-show'
            WHEN 'cancelled' THEN 'cancelled'
        END,
        NEW.pax
    );
    
    -- === CẬP NHẬT LẠI SUMMARY CỦA CUSTOMER ===
    
    SELECT COUNT(*) INTO v_visit_count
    FROM customer_visits 
    WHERE customer_id = v_customer_id AND status IN ('completed', 'no-show');
    
    SELECT COUNT(*) INTO v_no_show_count
    FROM customer_visits 
    WHERE customer_id = v_customer_id AND status = 'no-show';
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_spent
    FROM customer_visits 
    WHERE customer_id = v_customer_id AND status = 'completed';
    
    UPDATE customers SET
        visit_count = v_visit_count,
        no_show_rate = CASE 
            WHEN v_visit_count > 0 THEN ROUND(v_no_show_count::NUMERIC / v_visit_count, 2) 
            ELSE 0 
        END,
        total_spent = v_total_spent,
        customer_group = CASE
            WHEN v_visit_count >= 10 OR v_total_spent >= 10000000 THEN 'VIP'
            WHEN v_visit_count >= 3 THEN 'Regular'
            ELSE 'New'
        END
    WHERE id = v_customer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Đảm bảo trigger vẫn đúng
DROP TRIGGER IF EXISTS trg_sync_booking_crm ON bookings;
CREATE TRIGGER trg_sync_booking_crm
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION sync_booking_to_crm();
