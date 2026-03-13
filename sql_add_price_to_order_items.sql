-- Add price column to order_items to store the price of the item at the time of ordering
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Optional: update existing records to have a basic price (optional migration step for safety)
-- UPDATE public.order_items oi
-- SET price = (SELECT price FROM public.menu_items mi WHERE mi.name = oi.name LIMIT 1)
-- WHERE oi.price = 0;
