-- Add lang column to bookings table for email language preference
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'vi';
