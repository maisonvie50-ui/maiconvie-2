-- ===========================
-- PHASE 3: STAFF PERFORMANCE - Thêm cột waiter_id vào bảng orders
-- ===========================

-- 1. Thêm cột waiter_id (liên kết đơn hàng với nhân viên phục vụ)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waiter_id UUID REFERENCES employees(id);

-- 2. Tạo index để query nhanh theo nhân viên
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON orders(waiter_id);

-- 3. (Tùy chọn) Cập nhật một số đơn hàng cũ gán cho nhân viên hiện có để có dữ liệu demo
-- Lấy danh sách nhân viên có vai trò server (phục vụ)
DO $$
DECLARE
    emp_ids UUID[];
    emp_count INT;
BEGIN
    -- Lấy tất cả nhân viên có role server
    SELECT ARRAY_AGG(id) INTO emp_ids FROM employees WHERE role_server = true;
    
    IF emp_ids IS NULL THEN
        -- Nếu không có ai role_server, lấy tất cả nhân viên
        SELECT ARRAY_AGG(id) INTO emp_ids FROM employees WHERE active = true;
    END IF;
    
    emp_count := COALESCE(array_length(emp_ids, 1), 0);
    
    IF emp_count > 0 THEN
        -- Gán ngẫu nhiên nhân viên cho các đơn hàng chưa có waiter_id
        UPDATE orders 
        SET waiter_id = emp_ids[1 + floor(random() * emp_count)::int]
        WHERE waiter_id IS NULL;
    END IF;
END $$;
