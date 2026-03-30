-- ===========================
-- SỬA LẠI: Phân bổ đều nhân viên cho các đơn hàng
-- ===========================

-- Xóa gán cũ trước
UPDATE orders SET waiter_id = NULL;

-- Gán lại theo vòng tròn (round-robin) cho tất cả nhân viên active
WITH numbered_orders AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY order_time) as rn
    FROM orders
),
numbered_employees AS (
    SELECT id as emp_id, ROW_NUMBER() OVER (ORDER BY name) as emp_rn
    FROM employees
    WHERE active = true
),
emp_count AS (
    SELECT COUNT(*) as total FROM employees WHERE active = true
)
UPDATE orders
SET waiter_id = ne.emp_id
FROM numbered_orders no2, numbered_employees ne, emp_count ec
WHERE orders.id = no2.id
AND ne.emp_rn = ((no2.rn - 1) % ec.total) + 1;
