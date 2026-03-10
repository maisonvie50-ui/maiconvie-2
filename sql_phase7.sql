CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    role_reception BOOLEAN DEFAULT false,
    role_kitchen BOOLEAN DEFAULT false,
    role_server BOOLEAN DEFAULT false,
    role_manager BOOLEAN DEFAULT false,
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tables TEXT[] DEFAULT '{}',
    staff_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE training_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    duration TEXT,
    level INT NOT NULL,
    youtube_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE training_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
    progress INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(employee_id, module_id)
);

-- Note: We already have app_settings from phase 1 but we can create generic key_value store.
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
ALTER PUBLICATION supabase_realtime ADD TABLE training_modules;
ALTER PUBLICATION supabase_realtime ADD TABLE training_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
