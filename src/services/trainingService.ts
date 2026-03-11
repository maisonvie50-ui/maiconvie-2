import { supabase } from '../lib/supabase';

export interface TrainingModule {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    level: number;
    youtubeId: string;
    progress: number; // For the current user
}

export interface EmployeeTrainingProgress {
    id: string; // Employee ID
    name: string;
    avatar: string;
    role: string;
    overallProgress: number;
    badges: number[]; // Completed levels
}

export const trainingService = {
    // We'll pass an "employeeId" to compute their specific progress, 
    // or default to a simple query for modules and manual states.
    getModules: async (employeeId?: string): Promise<TrainingModule[]> => {
        // Fetch all active training modules
        const { data: modulesData, error: modulesError } = await supabase
            .from('training_modules')
            .select('*')
            .eq('is_active', true)
            .order('level', { ascending: true })
            .order('created_at', { ascending: true });

        if (modulesError || !modulesData) return [];

        let progressMap: Record<string, number> = {};

        if (employeeId) {
            const { data: progressData } = await supabase
                .from('training_progress')
                .select('module_id, progress')
                .eq('employee_id', employeeId);

            if (progressData) {
                progressData.forEach(p => {
                    progressMap[p.module_id] = p.progress;
                });
            }
        }

        return modulesData.map(mod => ({
            id: mod.id,
            title: mod.title,
            thumbnail: mod.thumbnail_url || `https://img.youtube.com/vi/${mod.youtube_id}/maxresdefault.jpg`,
            duration: mod.duration,
            level: mod.level,
            youtubeId: mod.youtube_id,
            progress: progressMap[mod.id] || 0,
        }));
    },

    updateProgress: async (employeeId: string, moduleId: string, progress: number) => {
        const { error } = await supabase
            .from('training_progress')
            .upsert(
                { employee_id: employeeId, module_id: moduleId, progress, updated_at: new Date().toISOString() },
                { onConflict: 'employee_id, module_id' }
            );
        if (error) console.error('Error updating progress:', error);
    },

    getEmployeeProgressReports: async (): Promise<EmployeeTrainingProgress[]> => {
        // 1. Fetch employees
        const { data: employeesData } = await supabase
            .from('employees')
            .select('id, name, role_manager, role_reception, role_server, role_kitchen')
            .eq('active', true);

        if (!employeesData) return [];

        // 2. Fetch all progress
        const { data: allProgress } = await supabase
            .from('training_progress')
            .select('employee_id, module_id, progress, training_modules!inner(level, is_active)')
            .eq('training_modules.is_active', true);

        // 3. Fetch all modules to know total count
        const { data: allModules } = await supabase.from('training_modules').select('id, level').eq('is_active', true);

        const totalModules = allModules ? allModules.length : 0;

        // Process progression logic per employee
        return employeesData.map(emp => {
            // Determine Role Display
            let roles = [];
            if (emp.role_manager) roles.push('Quản lý');
            if (emp.role_reception) roles.push('Lễ tân');
            if (emp.role_server) roles.push('Phục vụ');
            if (emp.role_kitchen) roles.push('Bếp');

            const empRole = roles.length > 0 ? roles.join(', ') : 'Nhân viên';

            // Calculate total progress across all modules
            let completedModules = 0;
            let totalProgressSum = 0;
            const empProgress = allProgress?.filter(p => p.employee_id === emp.id) || [];

            const levelProgressMap: Record<number, { total: number, completed: number }> = {
                1: { total: 0, completed: 0 },
                2: { total: 0, completed: 0 },
                3: { total: 0, completed: 0 },
                4: { total: 0, completed: 0 },
                5: { total: 0, completed: 0 }
            };

            allModules?.forEach(m => {
                if (levelProgressMap[m.level]) {
                    levelProgressMap[m.level].total++;
                }
            });

            empProgress.forEach(p => {
                if (p.progress === 100) {
                    completedModules++;
                    if (p.training_modules) {
                        const level = (p as any).training_modules.level || (p as any).training_modules[0]?.level;
                        if (levelProgressMap[level]) {
                            levelProgressMap[level].completed++;
                        }
                    }
                }
                totalProgressSum += (p.progress || 0);
            });

            const overallProgress = totalModules > 0 ? Math.round(totalProgressSum / totalModules) : 0;

            // Calculate Badges (a level must be fully completed to get a badge)
            const badges: number[] = [];
            [1, 2, 3, 4, 5].forEach(lvl => {
                if (levelProgressMap[lvl].total > 0 && levelProgressMap[lvl].completed === levelProgressMap[lvl].total) {
                    badges.push(lvl);
                }
            });

            return {
                id: emp.id,
                name: emp.name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`,
                role: empRole,
                overallProgress,
                badges
            };
        });
    }
};
