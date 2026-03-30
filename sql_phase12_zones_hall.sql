-- ===========================
-- DỮ LIỆU PHASE 12: FLOOR ZONES BẢN ĐỒ VÀ EVENT HALL (SẢNH TIỆC)
-- ===========================

-- 1. BẢNG FLOOR ZONES (Cấu hình Vách Ngăn / Khu vực chung)
DROP TABLE IF EXISTS floor_zones CASCADE;
CREATE TABLE floor_zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    floor INTEGER NOT NULL,
    type TEXT NOT NULL,
    x TEXT NOT NULL,
    y TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cho phép đọc/ghi realtime trên bảng
ALTER TABLE floor_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access to floor_zones" ON floor_zones;
CREATE POLICY "Public access to floor_zones" ON floor_zones FOR ALL USING (true);

-- Đổ dữ liệu tĩnh mặc định cho Khu vực
INSERT INTO floor_zones (id, name, floor, type, x, y) VALUES
('Z1', 'Wine Corner', 1, 'wine', '15%', '10%'),
('Z2', 'Balcony', 1, 'waiting', '85%', '10%'),
('Z3', 'Staff Station', 1, 'staff', '15%', '90%'),
('Z4', 'Main Door', 1, 'door', '85%', '90%'),
('Z5', 'Kitchen Area', 2, 'kitchen', '15%', '20%'),
('Z6', 'Bar Area', 2, 'bar', '85%', '20%'),
('Z7', 'Waiting Chair & Smoking', 2, 'waiting', '50%', '80%')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  floor = EXCLUDED.floor,
  type = EXCLUDED.type,
  x = EXCLUDED.x,
  y = EXCLUDED.y;


-- 2. BẢNG EVENT HALL (Sảnh tiệc / Cấu hình vách ngăn Sảnh lớn)
DROP TABLE IF EXISTS event_halls CASCADE;
CREATE TABLE event_halls (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT DEFAULT 'empty' NOT NULL,
    customer_name TEXT,
    time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cho phép đọc/ghi realtime trên bảng
ALTER TABLE event_halls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access to event_halls" ON event_halls;
CREATE POLICY "Public access to event_halls" ON event_halls FOR ALL USING (true);

-- Đổ dữ liệu tĩnh mặc định cho Sảnh tiệc
INSERT INTO event_halls (id, name, capacity, status, customer_name, time) VALUES
('E1', 'Sảnh A', 70, 'empty', NULL, NULL),
('E2', 'Sảnh B', 70, 'reserved', 'Tiệc cưới', '11:00')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status,
  customer_name = EXCLUDED.customer_name,
  time = EXCLUDED.time;
