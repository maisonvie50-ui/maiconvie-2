-- Create `tour_menus` table
CREATE TABLE IF NOT EXISTS public.tour_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    net_price INTEGER NOT NULL DEFAULT 0,
    foc_policy TEXT,
    company_tags TEXT[],
    status TEXT NOT NULL DEFAULT 'available',
    included_drink TEXT,
    courses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.tour_menus ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone (for now)
CREATE POLICY "Enable read access for all users" ON public.tour_menus
    FOR SELECT USING (true);

-- Allow all operations for now (can restrict to authenticated users later)
CREATE POLICY "Enable insert access for all users" ON public.tour_menus
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.tour_menus
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON public.tour_menus
    FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tour_menus;
