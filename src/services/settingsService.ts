import { supabase } from '../lib/supabase';

// Reusing existing models
export interface Employee {
    id: string;
    name: string;
    email: string;
    active: boolean;
    roles: {
        reception: boolean;
        kitchen: boolean;
        server: boolean;
        manager: boolean;
    };
    lastActive?: string;
}

export interface ActivityLog {
    id: string;
    action: string;
    timestamp: string;
    details: string;
}

export interface Station {
    id: string;
    name: string;
    tables: string[];
    staffIds: string[];
}

export interface AppSettings {
    defaultDuration: parseInt;
    strictMode: boolean;
    lunchStart: number;
    lunchEnd: number;
    dinnerStart: number;
    dinnerEnd: number;
    areas: { id: string, name: string, capacity: number }[];
}


export const settingsService = {
    // === EMPLOYEES ===
    getEmployees: async (): Promise<Employee[]> => {
        const { data: employees, error } = await supabase
            .from('employees')
            .select('*')
            .order('name');

        if (error || !employees) {
            console.error('Error fetching employees:', error);
            return [];
        }

        return employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            active: emp.active,
            roles: {
                reception: emp.role_reception,
                kitchen: emp.role_kitchen,
                server: emp.role_server,
                manager: emp.role_manager,
            },
            lastActive: emp.last_active ? new Date(emp.last_active).toLocaleString('vi-VN') : 'Chưa đăng nhập'
        }));
    },

    addEmployee: async (employee: Partial<Employee>): Promise<Employee | null> => {
        const { data, error } = await supabase
            .from('employees')
            .insert([{
                name: employee.name,
                email: employee.email,
                active: employee.active ?? true,
                role_reception: employee.roles?.reception ?? false,
                role_kitchen: employee.roles?.kitchen ?? false,
                role_server: employee.roles?.server ?? false,
                role_manager: employee.roles?.manager ?? false,
            }])
            .select()
            .single();

        if (error || !data) {
            console.error('Error adding employee:', error);
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            email: data.email,
            active: data.active,
            roles: {
                reception: data.role_reception,
                kitchen: data.role_kitchen,
                server: data.role_server,
                manager: data.role_manager,
            },
            lastActive: data.last_active ? new Date(data.last_active).toLocaleString('vi-VN') : 'Chưa đăng nhập'
        };
    },

    updateEmployee: async (id: string, updates: Partial<Employee>) => {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.active !== undefined) payload.active = updates.active;
        if (updates.roles) {
            if (updates.roles.reception !== undefined) payload.role_reception = updates.roles.reception;
            if (updates.roles.kitchen !== undefined) payload.role_kitchen = updates.roles.kitchen;
            if (updates.roles.server !== undefined) payload.role_server = updates.roles.server;
            if (updates.roles.manager !== undefined) payload.role_manager = updates.roles.manager;
        }

        if (Object.keys(payload).length > 0) {
            const { error } = await supabase
                .from('employees')
                .update(payload)
                .eq('id', id);
            if (error) console.error('Error updating employee:', error);
        }
    },

    // === STATIONS ===
    getStations: async (): Promise<Station[]> => {
        const { data: stations, error } = await supabase
            .from('stations')
            .select('*')
            .order('name');

        if (error || !stations) {
            console.error('Error fetching stations:', error);
            return [];
        }

        return stations.map(s => ({
            id: s.id,
            name: s.name,
            tables: s.tables || [],
            staffIds: s.staff_ids || [],
        }));
    },

    addStation: async (station: Omit<Station, 'id'>) => {
        const { data, error } = await supabase
            .from('stations')
            .insert([{
                name: station.name,
                tables: station.tables,
                staff_ids: station.staffIds
            }])
            .select()
            .single();

        if (error) console.error('Error adding station:', error);
        return data;
    },

    updateStation: async (id: string, updates: Partial<Station>) => {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.tables !== undefined) payload.tables = updates.tables;
        if (updates.staffIds !== undefined) payload.staff_ids = updates.staffIds;

        const { error } = await supabase
            .from('stations')
            .update(payload)
            .eq('id', id);
        if (error) console.error('Error updating station:', error);
    },

    deleteStation: async (id: string) => {
        const { error } = await supabase
            .from('stations')
            .delete()
            .eq('id', id);
        if (error) console.error('Error deleting station:', error);
    },

    // === SETTINGS ===
    getAppSettings: async (): Promise<any> => {
        const { data, error } = await supabase
            .from('settings')
            .select('*');

        if (error || !data) return null;

        const config: any = {};
        data.forEach(item => {
            config[item.key] = item.value;
        });
        return config;
    },

    updateAppSetting: async (key: string, value: any) => {
        const { error } = await supabase
            .from('settings')
            .upsert({ key, value }, { onConflict: 'key' });
        if (error) console.error(`Error updating setting ${key}:`, error);
    },

    // === ACTIVITY LOGS ===
    getActivityLogs: async (): Promise<ActivityLog[]> => {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error || !data) return [];

        return data.map(log => ({
            id: log.id,
            action: log.action,
            details: log.details || '',
            timestamp: new Date(log.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        }));
    }
};
