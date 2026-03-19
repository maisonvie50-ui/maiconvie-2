import { supabase } from '../lib/supabase';

export interface TrainingModule {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    level: number;
    youtubeId: string;
    progress: number; // For the current user
    active: boolean;
    isActive?: boolean; // alias
}

export interface EmployeeTrainingProgress {
    id: string; // Employee ID
    name: string;
    avatar: string;
    role: string;
    overallProgress: number;
    badges: number[]; // Completed levels
    trainingLevel: number;
}

export interface LevelConfig {
    level: number;
    name: string;
    minDaysFromPrev: number;
    requiresEvaluation: boolean;
}

export interface ChecklistItem {
    id: string;
    level: number;
    itemText: string;
    sortOrder: number;
    active: boolean;
}

export interface TrainingEvaluation {
    id: string;
    employeeId: string;
    employeeName?: string;
    employeeRole?: string;
    fromLevel: number;
    toLevel: number;
    evaluatorId?: string;
    evaluatorName?: string;
    status: 'pending' | 'approved' | 'rejected';
    checklistResults?: { itemId: string; itemText: string; checked: boolean; note?: string }[];
    rejectReason?: string;
    completedVideosAt?: string;
    evaluatedAt?: string;
    createdAt?: string;
}

export const trainingService = {
    // === LEVEL CONFIG ===
    getLevelConfig: async (): Promise<LevelConfig[]> => {
        const { data, error } = await supabase
            .from('training_level_config')
            .select('*')
            .order('level', { ascending: true });
        if (error || !data) return [];
        return data.map(d => ({
            level: d.level,
            name: d.name,
            minDaysFromPrev: d.min_days_from_prev,
            requiresEvaluation: d.requires_evaluation,
        }));
    },

    updateLevelConfig: async (level: number, updates: { min_days_from_prev?: number; requires_evaluation?: boolean; name?: string }) => {
        const { error } = await supabase
            .from('training_level_config')
            .update(updates)
            .eq('level', level);
        if (error) console.error('Error updating level config:', error);
    },

    // === CHECKLIST ===
    getChecklist: async (level?: number): Promise<ChecklistItem[]> => {
        let query = supabase
            .from('training_evaluation_checklist')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true });
        if (level) query = query.eq('level', level);
        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(d => ({
            id: d.id,
            level: d.level,
            itemText: d.item_text,
            sortOrder: d.sort_order,
            active: d.active,
        }));
    },

    addChecklistItem: async (level: number, itemText: string, sortOrder: number): Promise<ChecklistItem | null> => {
        const { data, error } = await supabase
            .from('training_evaluation_checklist')
            .insert([{ level, item_text: itemText, sort_order: sortOrder }])
            .select()
            .single();
        if (error || !data) return null;
        return { id: data.id, level: data.level, itemText: data.item_text, sortOrder: data.sort_order, active: data.active };
    },

    updateChecklistItem: async (id: string, updates: { item_text?: string; sort_order?: number; active?: boolean }) => {
        const { error } = await supabase
            .from('training_evaluation_checklist')
            .update(updates)
            .eq('id', id);
        if (error) console.error('Error updating checklist item:', error);
    },

    deleteChecklistItem: async (id: string) => {
        const { error } = await supabase
            .from('training_evaluation_checklist')
            .delete()
            .eq('id', id);
        if (error) console.error('Error deleting checklist item:', error);
    },

    // === EMPLOYEE LEVEL ===
    getEmployeeLevel: async (employeeId: string): Promise<number> => {
        const { data, error } = await supabase
            .from('employees')
            .select('training_level')
            .eq('id', employeeId)
            .single();
        if (error || !data) return 1;
        return data.training_level || 1;
    },

    setEmployeeLevel: async (employeeId: string, level: number) => {
        const { error } = await supabase
            .from('employees')
            .update({ training_level: level })
            .eq('id', employeeId);
        if (error) console.error('Error setting employee level:', error);
    },

    // === LEVEL UP ELIGIBILITY ===
    checkLevelUpEligibility: async (employeeId: string): Promise<{
        eligible: boolean;
        currentLevel: number;
        nextLevel: number;
        videosCompleted: boolean;
        daysWaited: number;
        minDaysRequired: number;
        hasPendingEvaluation: boolean;
    }> => {
        // Get employee level
        const currentLevel = await trainingService.getEmployeeLevel(employeeId);
        const nextLevel = currentLevel + 1;

        // Get level config for next level
        const configs = await trainingService.getLevelConfig();
        const nextConfig = configs.find(c => c.level === nextLevel);
        if (!nextConfig) {
            return { eligible: false, currentLevel, nextLevel, videosCompleted: false, daysWaited: 0, minDaysRequired: 0, hasPendingEvaluation: false };
        }

        // Check: all videos in current level completed?
        const { data: modules } = await supabase
            .from('training_modules')
            .select('id')
            .eq('level', currentLevel)
            .eq('is_active', true);

        const { data: progress } = await supabase
            .from('training_progress')
            .select('module_id, progress')
            .eq('employee_id', employeeId);

        const moduleIds = (modules || []).map(m => m.id);
        const progressMap: Record<string, number> = {};
        (progress || []).forEach(p => { progressMap[p.module_id] = p.progress; });

        const videosCompleted = moduleIds.length > 0 && moduleIds.every(id => progressMap[id] === 100);

        // Check: days since last level-up or account creation
        const { data: empData } = await supabase
            .from('employees')
            .select('created_at')
            .eq('id', employeeId)
            .single();

        // Check last evaluation approval date or fallback to employee creation
        const { data: lastApproval } = await supabase
            .from('training_evaluations')
            .select('evaluated_at')
            .eq('employee_id', employeeId)
            .eq('status', 'approved')
            .order('evaluated_at', { ascending: false })
            .limit(1);

        const referenceDate = lastApproval?.[0]?.evaluated_at || empData?.created_at || new Date().toISOString();
        const daysWaited = Math.floor((Date.now() - new Date(referenceDate).getTime()) / (1000 * 60 * 60 * 24));

        // Check: pending evaluation exists?
        const { data: pendingEval } = await supabase
            .from('training_evaluations')
            .select('id')
            .eq('employee_id', employeeId)
            .eq('status', 'pending')
            .limit(1);

        const hasPendingEvaluation = (pendingEval || []).length > 0;

        const eligible = videosCompleted && daysWaited >= nextConfig.minDaysFromPrev && !hasPendingEvaluation;

        return {
            eligible,
            currentLevel,
            nextLevel,
            videosCompleted,
            daysWaited,
            minDaysRequired: nextConfig.minDaysFromPrev,
            hasPendingEvaluation,
        };
    },

    // === REQUEST LEVEL UP ===
    requestLevelUp: async (employeeId: string): Promise<boolean> => {
        const eligibility = await trainingService.checkLevelUpEligibility(employeeId);
        if (!eligibility.eligible) return false;

        const { error } = await supabase
            .from('training_evaluations')
            .insert([{
                employee_id: employeeId,
                from_level: eligibility.currentLevel,
                to_level: eligibility.nextLevel,
                status: 'pending',
                completed_videos_at: new Date().toISOString(),
            }]);

        if (error) {
            console.error('Error requesting level up:', error);
            return false;
        }
        return true;
    },

    // === EVALUATIONS (Manager) ===
    getPendingEvaluations: async (): Promise<TrainingEvaluation[]> => {
        const { data, error } = await supabase
            .from('training_evaluations')
            .select(`
                *,
                employee:employees!training_evaluations_employee_id_fkey(name, role_manager, role_reception, role_server, role_kitchen),
                evaluator:employees!training_evaluations_evaluator_id_fkey(name)
            `)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map((d: any) => {
            let roles: string[] = [];
            if (d.employee?.role_manager) roles.push('Quản lý');
            if (d.employee?.role_reception) roles.push('Lễ tân');
            if (d.employee?.role_server) roles.push('Phục vụ');
            if (d.employee?.role_kitchen) roles.push('Bếp');

            return {
                id: d.id,
                employeeId: d.employee_id,
                employeeName: d.employee?.name || 'N/A',
                employeeRole: roles.join(', ') || 'Nhân viên',
                fromLevel: d.from_level,
                toLevel: d.to_level,
                evaluatorId: d.evaluator_id,
                evaluatorName: d.evaluator?.name,
                status: d.status,
                checklistResults: d.checklist_results,
                rejectReason: d.reject_reason,
                completedVideosAt: d.completed_videos_at,
                evaluatedAt: d.evaluated_at,
                createdAt: d.created_at,
            };
        });
    },

    submitEvaluation: async (
        evaluationId: string,
        evaluatorId: string,
        status: 'approved' | 'rejected',
        checklistResults: { itemId: string; itemText: string; checked: boolean; note?: string }[],
        rejectReason?: string
    ): Promise<boolean> => {
        // Get the evaluation to know employee and target level
        const { data: evalData, error: evalError } = await supabase
            .from('training_evaluations')
            .select('employee_id, to_level')
            .eq('id', evaluationId)
            .single();

        if (evalError || !evalData) return false;

        // Update evaluation record
        const { error: updateError } = await supabase
            .from('training_evaluations')
            .update({
                evaluator_id: evaluatorId,
                status,
                checklist_results: checklistResults,
                reject_reason: rejectReason || null,
                evaluated_at: new Date().toISOString(),
            })
            .eq('id', evaluationId);

        if (updateError) return false;

        // If approved, upgrade employee level
        if (status === 'approved') {
            await trainingService.setEmployeeLevel(evalData.employee_id, evalData.to_level);
        }

        return true;
    },

    saveDirectEvaluation: async (
        employeeId: string,
        evaluatorId: string,
        level: number,
        checklistResults: { itemId: string; itemText: string; checked: boolean; note?: string }[]
    ): Promise<{ success: boolean; error?: string }> => {
        // Check if there's already a pending evaluation for this employee and level
        const { data: existing } = await supabase
            .from('training_evaluations')
            .select('id')
            .eq('employee_id', employeeId)
            .eq('to_level', level)
            .eq('status', 'pending')
            .maybeSingle();

        if (existing) {
            // Update the existing pending record
            const { error } = await supabase
                .from('training_evaluations')
                .update({
                    evaluator_id: evaluatorId,
                    checklist_results: checklistResults,
                    completed_videos_at: new Date().toISOString()
                })
                .eq('id', existing.id);

            if (error) {
                console.error('Error updating evaluation:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        }

        // Create new pending evaluation
        const { error } = await supabase
            .from('training_evaluations')
            .insert([{
                employee_id: employeeId,
                evaluator_id: evaluatorId,
                from_level: level > 1 ? level - 1 : 1,
                to_level: level,
                status: 'pending',
                checklist_results: checklistResults,
                completed_videos_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Error saving direct evaluation:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    },

    getLatestEvaluation: async (employeeId: string, level: number) => {
        const { data, error } = await supabase
            .from('training_evaluations')
            .select('checklist_results, status, evaluated_at')
            .eq('employee_id', employeeId)
            .eq('to_level', level)
            .order('evaluated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error || !data) return null;
        return data;
    },

    // === MODULES (updated to filter by employee level) ===
    getModules: async (employeeId?: string): Promise<TrainingModule[]> => {
        // Fetch employee level
        let employeeLevel = 5; // Default to max (for admin or when no employee specified)
        if (employeeId) {
            employeeLevel = await trainingService.getEmployeeLevel(employeeId);
        }

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
            active: mod.is_active,
            isActive: mod.is_active,
            locked: mod.level > employeeLevel,
        }));
    },

    updateProgress: async (employeeId: string, moduleId: string, progress: number) => {
        const { error } = await supabase
            .from('training_progress')
            .upsert(
                { employee_id: employeeId, module_id: moduleId, progress, updated_at: new Date().toISOString() },
                { onConflict: 'employee_id, module_id' }
            );
        if (error) {
            console.error('Error updating progress:', error);
            throw new Error(`Failed to save progress: ${error.message}`);
        }
    },

    // === ADMIN: Get ALL modules (including inactive) ===
    getModulesForAdmin: async (): Promise<TrainingModule[]> => {
        const { data: modulesData, error } = await supabase
            .from('training_modules')
            .select('*')
            .order('level', { ascending: true })
            .order('created_at', { ascending: true });

        if (error || !modulesData) return [];

        return modulesData.map(mod => ({
            id: mod.id,
            title: mod.title,
            thumbnail: mod.thumbnail_url || `https://img.youtube.com/vi/${mod.youtube_id}/maxresdefault.jpg`,
            duration: mod.duration || '',
            level: mod.level,
            youtubeId: mod.youtube_id,
            progress: 0,
            active: mod.is_active,
            isActive: mod.is_active,
        }));
    },

    // === ADMIN: Add a new training module ===
    addModule: async (module: { title: string; level: number; youtubeId: string }): Promise<TrainingModule | null> => {
        const { data, error } = await supabase
            .from('training_modules')
            .insert([{
                title: module.title,
                level: module.level,
                youtube_id: module.youtubeId,
                thumbnail_url: `https://img.youtube.com/vi/${module.youtubeId}/maxresdefault.jpg`,
                is_active: true,
            }])
            .select()
            .single();

        if (error || !data) {
            console.error('Error adding module:', error);
            return null;
        }

        return {
            id: data.id,
            title: data.title,
            thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${data.youtube_id}/maxresdefault.jpg`,
            duration: data.duration || '',
            level: data.level,
            youtubeId: data.youtube_id,
            progress: 0,
            active: data.is_active,
            isActive: data.is_active,
        };
    },

    // === ADMIN: Update module (e.g. toggle active) ===
    updateModule: async (id: string, updates: { is_active?: boolean; title?: string; level?: number; youtube_id?: string; thumbnail_url?: string }) => {
        const { error } = await supabase
            .from('training_modules')
            .update(updates)
            .eq('id', id);
        if (error) console.error('Error updating module:', error);
    },

    // === ADMIN: Delete module ===
    deleteModule: async (id: string) => {
        const { error } = await supabase
            .from('training_modules')
            .delete()
            .eq('id', id);
        if (error) console.error('Error deleting module:', error);
    },

    getEmployeeProgressReports: async (): Promise<EmployeeTrainingProgress[]> => {
        // 1. Fetch employees
        const { data: employeesData } = await supabase
            .from('employees')
            .select('id, name, role_manager, role_reception, role_server, role_kitchen, training_level')
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
                badges,
                trainingLevel: (emp as any).training_level || 1,
            };
        });
    }
};
