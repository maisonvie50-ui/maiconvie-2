-- ===========================
-- BƯỚC 1: Thêm cột waiter_id vào bảng orders
-- ===========================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waiter_id UUID REFERENCES employees(id);
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON orders(waiter_id);
