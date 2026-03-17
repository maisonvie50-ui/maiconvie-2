-- Add payment_method column to orders table
-- Run this in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Optional: add a comment for clarity
COMMENT ON COLUMN orders.payment_method IS 'Payment method: cash, transfer, card';
