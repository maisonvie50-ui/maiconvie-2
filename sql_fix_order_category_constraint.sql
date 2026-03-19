-- Drop the rigid category constraint so dynamic categories like 'Set Menu' or 'Khác' can be ordered
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_category_check;
