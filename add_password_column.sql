-- Thêm cột password vào bảng employees
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS password text;
