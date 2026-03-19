-- =============================================
-- Migration: Training Level System
-- Thêm hệ thống thăng cấp đào tạo với ĐK Cần + ĐK Đủ
-- =============================================

-- 1. Thêm cột training_level vào employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS training_level INT DEFAULT 1;

-- 2. Bảng cấu hình level (admin quản lý)
CREATE TABLE IF NOT EXISTS training_level_config (
    level INT PRIMARY KEY,
    name TEXT NOT NULL,
    min_days_from_prev INT DEFAULT 0,
    requires_evaluation BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng checklist items cho mỗi level
CREATE TABLE IF NOT EXISTS training_evaluation_checklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level INT REFERENCES training_level_config(level) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Bảng lưu kết quả đánh giá
CREATE TABLE IF NOT EXISTS training_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    from_level INT NOT NULL,
    to_level INT NOT NULL,
    evaluator_id UUID REFERENCES employees(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    checklist_results JSONB,
    reject_reason TEXT,
    completed_videos_at TIMESTAMPTZ,
    evaluated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for these new tables (matching existing pattern)
ALTER TABLE training_level_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_evaluation_checklist DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_evaluations DISABLE ROW LEVEL SECURITY;

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE training_level_config;
ALTER PUBLICATION supabase_realtime ADD TABLE training_evaluation_checklist;
ALTER PUBLICATION supabase_realtime ADD TABLE training_evaluations;

-- 5. Insert default level config
INSERT INTO training_level_config (level, name, min_days_from_prev, requires_evaluation) VALUES
(1, 'Level 1: Nhập môn', 0, false),
(2, 'Level 2: Cơ bản', 30, true),
(3, 'Level 3: Nâng cao', 45, true),
(4, 'Level 4: Chuyên sâu', 60, true),
(5, 'Level 5: Quản lý', 90, true)
ON CONFLICT (level) DO NOTHING;

-- 6. Insert default checklist items for each level
INSERT INTO training_evaluation_checklist (level, item_text, sort_order) VALUES
-- Level 2 checklist
(2, 'Nắm vững quy trình phục vụ cơ bản', 1),
(2, 'Biết cách xử lý tình huống đơn giản', 2),
(2, 'Tuân thủ nội quy và giờ giấc', 3),
(2, 'Giao tiếp lịch sự với khách hàng', 4),
-- Level 3 checklist
(3, 'Thành thạo tất cả quy trình phục vụ', 1),
(3, 'Xử lý được tình huống phức tạp', 2),
(3, 'Có khả năng hỗ trợ đào tạo nhân viên mới', 3),
(3, 'Đáp ứng KPI trong 3 tháng gần nhất', 4),
-- Level 4 checklist
(4, 'Có kinh nghiệm xử lý khiếu nại khách hàng', 1),
(4, 'Quản lý được nhóm nhỏ (2-3 người)', 2),
(4, 'Am hiểu menu và cocktail chuyên sâu', 3),
(4, 'Đề xuất cải tiến quy trình hiệu quả', 4),
-- Level 5 checklist
(5, 'Có năng lực quản lý ca/khu vực', 1),
(5, 'Lập được kế hoạch và phân công công việc', 2),
(5, 'Xử lý tốt các tình huống khẩn cấp', 3),
(5, 'Đào tạo và mentoring nhân viên cấp dưới', 4),
(5, 'Am hiểu vận hành tổng thể nhà hàng', 5);
