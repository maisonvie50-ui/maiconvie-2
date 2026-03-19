-- Remove the check constraint on the source column to allow custom sources
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_source_check;
