-- ===========================
-- DỮ LIỆU MẪU GIAI ĐOẠN 7
-- ===========================

-- 1. NHÂN VIÊN
INSERT INTO employees (name, email, active, role_reception, role_kitchen, role_server, role_manager, last_active) VALUES
('Nguyễn Văn A', 'a.nguyen@maisonvie.com', true, false, false, false, true, now()),
('Trần Thị B', 'b.tran@maisonvie.com', true, true, false, true, false, now() - interval '5 minutes'),
('Lê Văn C', 'c.le@maisonvie.com', true, false, true, false, false, now() - interval '1 hour'),
('Phạm Thị D', 'd.pham@maisonvie.com', false, true, false, false, false, now() - interval '2 days'),
('Hoàng Minh E', 'e.hoang@maisonvie.com', true, false, false, true, false, now() - interval '30 minutes');

-- 2. STATIONS (Khu vực phục vụ)
INSERT INTO stations (name, tables) VALUES
('Station Cửa Sổ (T1)', ARRAY['Bàn 1', 'Bàn 2', 'Bàn 5', 'Bàn 6']),
('Station Trung Tâm (T1)', ARRAY['Bàn 3', 'Bàn 4', 'Bàn 7', 'Bàn 8']),
('Phòng VIP 1', ARRAY['VIP 1']),
('Sảnh Tầng 2', ARRAY['Bàn 9', 'Bàn 10', 'Bàn 11', 'Bàn 12']);

-- 3. TRAINING MODULES (Khóa đào tạo)
-- Level 1: Nhập môn
INSERT INTO training_modules (title, thumbnail_url, duration, level, youtube_id) VALUES
('Văn hóa & Tầm nhìn Maison Vie', 'https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg', '12:00', 1, 'M7lc1UVf-VE'),
('Quy trình phục vụ cơ bản', 'https://img.youtube.com/vi/tgbNymZ7vqY/maxresdefault.jpg', '18:00', 1, 'tgbNymZ7vqY'),
('An toàn vệ sinh thực phẩm (HACCP)', 'https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg', '15:00', 1, 'aqz-KE-bpKQ'),
('Sử dụng hệ thống POS & KDS', 'https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg', '20:00', 1, 'LXb3EKWsInQ'),
('Nội quy & Đồng phục nhà hàng', 'https://img.youtube.com/vi/ZbZSe6N_BXs/maxresdefault.jpg', '10:00', 1, 'ZbZSe6N_BXs');

-- Level 2: Cơ bản
INSERT INTO training_modules (title, thumbnail_url, duration, level, youtube_id) VALUES
('Kỹ năng giao tiếp khách hàng', 'https://img.youtube.com/vi/8aGhZQkoFbQ/maxresdefault.jpg', '22:00', 2, '8aGhZQkoFbQ'),
('Xử lý tình huống phàn nàn', 'https://img.youtube.com/vi/1vxC2_5O028/maxresdefault.jpg', '25:00', 2, '1vxC2_5O028'),
('Nghệ thuật set bàn & trang trí', 'https://img.youtube.com/vi/Sagg08DrO5U/maxresdefault.jpg', '18:00', 2, 'Sagg08DrO5U'),
('Phục vụ tiệc & sự kiện đặc biệt', 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg', '28:00', 2, 'YQHsXMglC9A'),
('Teamwork & phối hợp bếp-phục vụ', 'https://img.youtube.com/vi/hT_nvWreIhg/maxresdefault.jpg', '16:00', 2, 'hT_nvWreIhg');

-- Level 3: Nâng cao
INSERT INTO training_modules (title, thumbnail_url, duration, level, youtube_id) VALUES
('Kiến thức rượu vang & pairing', 'https://img.youtube.com/vi/N2ZqE1Jk2r0/maxresdefault.jpg', '35:00', 3, 'N2ZqE1Jk2r0'),
('Upselling & Cross-selling nghệ thuật', 'https://img.youtube.com/vi/Q8TXgCzxEnw/maxresdefault.jpg', '22:00', 3, 'Q8TXgCzxEnw'),
('Kiến thức cocktail & đồ uống cao cấp', 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg', '30:00', 3, 'fJ9rUzIMcZQ'),
('Xử lý dị ứng & chế độ ăn đặc biệt', 'https://img.youtube.com/vi/2Vv-BfVoq4g/maxresdefault.jpg', '20:00', 3, '2Vv-BfVoq4g'),
('Phong cách phục vụ Fine Dining', 'https://img.youtube.com/vi/CevxZvSJLk8/maxresdefault.jpg', '25:00', 3, 'CevxZvSJLk8');

-- Level 4: Chuyên sâu
INSERT INTO training_modules (title, thumbnail_url, duration, level, youtube_id) VALUES
('Quản lý chất lượng dịch vụ (SOP)', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', '35:00', 4, 'dQw4w9WgXcQ'),
('Xây dựng menu & Food cost', 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg', '28:00', 4, 'jNQXAC9IVRw'),
('Training & Mentoring nhân viên mới', 'https://img.youtube.com/vi/kXYiU_JCYtU/maxresdefault.jpg', '30:00', 4, 'kXYiU_JCYtU'),
('Quản lý kho & Inventory Control', 'https://img.youtube.com/vi/RgKAFK5djSk/maxresdefault.jpg', '25:00', 4, 'RgKAFK5djSk'),
('Đánh giá hiệu suất & KPI nhà hàng', 'https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg', '32:00', 4, 'JGwWNGJdvx8');

-- Level 5: Quản lý
INSERT INTO training_modules (title, thumbnail_url, duration, level, youtube_id) VALUES
('Quản lý nhân sự & ca làm việc', 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg', '40:00', 5, '9bZkp7q19f0'),
('Chiến lược kinh doanh F&B', 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg', '45:00', 5, 'kJQP7kiw5Fk'),
('Marketing & Branding nhà hàng', 'https://img.youtube.com/vi/OPf0YbXqDm0/maxresdefault.jpg', '35:00', 5, 'OPf0YbXqDm0'),
('Quản lý tài chính & P&L báo cáo', 'https://img.youtube.com/vi/60ItHLz5WEA/maxresdefault.jpg', '38:00', 5, '60ItHLz5WEA'),
('Xử lý khủng hoảng & Quản trị rủi ro', 'https://img.youtube.com/vi/pRpeEdMmmQ0/maxresdefault.jpg', '30:00', 5, 'pRpeEdMmmQ0');

-- 4. ACTIVITY LOGS (Lịch sử hoạt động mẫu)
INSERT INTO activity_logs (action, details, created_at) VALUES
('Tạo đặt bàn', 'Khách Nguyễn Văn X (4 pax)', now() - interval '2 hours'),
('Check-in', 'Bàn 05 - Tầng 1', now() - interval '1 hour 45 minutes'),
('Cập nhật món', 'Thêm 2 Bia Tiger', now() - interval '1 hour 30 minutes'),
('Thanh toán', 'Hóa đơn #10234 - 1.500.000đ', now() - interval '30 minutes'),
('Tạo đặt bàn', 'Khách Trần Văn Y (6 pax) - VIP', now() - interval '15 minutes'),
('Hủy đặt bàn', 'Khách Lê Thị Z - không đến', now() - interval '10 minutes');

-- 5. SETTINGS (Cấu hình mặc định)
INSERT INTO settings (key, value) VALUES
('defaultDuration', '120'),
('strictMode', 'false'),
('lunchStart', '11'),
('lunchEnd', '14'),
('dinnerStart', '17'),
('dinnerEnd', '22'),
('areas', '[{"id":"1","name":"Sảnh Tầng 1","capacity":80},{"id":"2","name":"Sảnh Tầng 2","capacity":50},{"id":"3","name":"Phòng VIP","capacity":20}]');

-- 6. TRAINING PROGRESS (Tiến độ mẫu cho nhân viên)
-- Lấy ID nhân viên và module để tạo progress
INSERT INTO training_progress (employee_id, module_id, progress)
SELECT e.id, m.id, 
  CASE 
    WHEN e.name = 'Nguyễn Văn A' AND m.level <= 2 THEN 100
    WHEN e.name = 'Nguyễn Văn A' AND m.level = 3 THEN 50
    WHEN e.name = 'Trần Thị B' AND m.level = 1 THEN 100
    WHEN e.name = 'Trần Thị B' AND m.level = 2 THEN 30
    WHEN e.name = 'Lê Văn C' AND m.level = 1 THEN 60
    WHEN e.name = 'Phạm Thị D' AND m.level <= 4 THEN 100
    WHEN e.name = 'Phạm Thị D' AND m.level = 5 THEN 80
    WHEN e.name = 'Hoàng Minh E' AND m.level = 1 THEN 40
    ELSE 0
  END
FROM employees e
CROSS JOIN training_modules m
WHERE e.name IN ('Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Minh E');
