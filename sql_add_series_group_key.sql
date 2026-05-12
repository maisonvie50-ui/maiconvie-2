-- Thêm cột series_group_key để hỗ trợ ghép đơn thủ công vào nhóm series đối tác
-- Khi AI quét email bị thiếu đơn, nhân viên bấm "Đơn phụ" sẽ tự gán key nhóm vào cột này
-- Hệ thống ưu tiên dùng series_group_key (nếu có) để xác định nhóm, thay vì tính từ createdAt

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS series_group_key text DEFAULT NULL;
