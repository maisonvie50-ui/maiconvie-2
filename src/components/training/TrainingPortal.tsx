import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAuth } from '../../hooks/useAuth';
import { Play, Award, CheckCircle, BarChart2, Search, Lock, X, Star, Target, Shield, Crown, ArrowUp, Clock, ClipboardCheck, ChevronRight, ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react';

import { trainingService, TrainingModule, EmployeeTrainingProgress, LevelConfig, TrainingEvaluation, ChecklistItem } from '../../services/trainingService';

interface ExtendedModule extends TrainingModule {
    locked?: boolean;
}

const levels = [
    { id: 1, name: 'Nhập môn', color: 'text-emerald-600', bg: 'bg-emerald-50', bgDark: 'bg-emerald-500', border: 'border-emerald-200', ring: 'ring-emerald-500/30', gradient: 'from-emerald-500 to-emerald-600', icon: 'Award' },
    { id: 2, name: 'Cơ bản', color: 'text-blue-600', bg: 'bg-blue-50', bgDark: 'bg-blue-500', border: 'border-blue-200', ring: 'ring-blue-500/30', gradient: 'from-blue-500 to-blue-600', icon: 'Star' },
    { id: 3, name: 'Nâng cao', color: 'text-violet-600', bg: 'bg-violet-50', bgDark: 'bg-violet-500', border: 'border-violet-200', ring: 'ring-violet-500/30', gradient: 'from-violet-500 to-violet-600', icon: 'Target' },
    { id: 4, name: 'Chuyên sâu', color: 'text-amber-600', bg: 'bg-amber-50', bgDark: 'bg-amber-500', border: 'border-amber-200', ring: 'ring-amber-500/30', gradient: 'from-amber-500 to-amber-600', icon: 'Shield' },
    { id: 5, name: 'Quản lý', color: 'text-rose-600', bg: 'bg-rose-50', bgDark: 'bg-rose-500', border: 'border-rose-200', ring: 'ring-rose-500/30', gradient: 'from-rose-500 to-rose-600', icon: 'Crown' },
];

const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
        case 'Star': return <Star className={className} />;
        case 'Target': return <Target className={className} />;
        case 'Shield': return <Shield className={className} />;
        case 'Crown': return <Crown className={className} />;
        default: return <Award className={className} />;
    }
};

export default function TrainingPortal() {
    const [activeTab, setActiveTab] = useState<'learn' | 'report' | 'evaluate'>('learn');
    const [courses, setCourses] = useState<ExtendedModule[]>([]);
    const [employees, setEmployees] = useState<EmployeeTrainingProgress[]>([]);
    const [playingCourse, setPlayingCourse] = useState<ExtendedModule | null>(null);
    const [employeeLevel, setEmployeeLevel] = useState(1);
    const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
    const [eligibility, setEligibility] = useState<any>(null);
    const [evaluations, setEvaluations] = useState<TrainingEvaluation[]>([]);
    const [selectedEval, setSelectedEval] = useState<TrainingEvaluation | null>(null);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [checklistState, setChecklistState] = useState<Record<string, { checked: boolean; note: string }>>({});
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);
    const { user, userRole } = useAuth();
    const isManager = userRole === 'admin' || userRole === 'manager';
    const currentEmployeeId = user?.id || '';

    // Direct Evaluation States
    const [directEvalEmployee, setDirectEvalEmployee] = useState<EmployeeTrainingProgress | null>(null);
    const [directEvalLevel, setDirectEvalLevel] = useState<number>(1);

    const isMobile = useIsMobile();

    useEffect(() => {
        const loadData = async () => {
            if (!currentEmployeeId) return;
            try {
                const [modulesData, progressData, configs] = await Promise.all([
                    trainingService.getModules(currentEmployeeId),
                    trainingService.getEmployeeProgressReports(),
                    trainingService.getLevelConfig(),
                ]);
                setCourses(modulesData as ExtendedModule[]);
                setEmployees(progressData);
                setLevelConfigs(configs);

                if (currentEmployeeId) {
                    const level = await trainingService.getEmployeeLevel(currentEmployeeId);
                    setEmployeeLevel(level);
                    const elig = await trainingService.checkLevelUpEligibility(currentEmployeeId);
                    setEligibility(elig);
                }

                if (isManager) {
                    const evals = await trainingService.getPendingEvaluations();
                    setEvaluations(evals);
                }
            } catch (error) {
                console.error('Failed to load training data:', error);
            }
        };
        loadData();
    }, [currentEmployeeId, isManager]);

    const handleCompleteVideo = async () => {
        if (playingCourse) {
            if (!currentEmployeeId) {
                alert('Lỗi: Không xác định được nhân viên. Vui lòng đăng nhập lại.');
                setPlayingCourse(null);
                return;
            }
            try {
                await trainingService.updateProgress(currentEmployeeId, playingCourse.id, 100);
                const updatedModules = await trainingService.getModules(currentEmployeeId);
                setCourses(updatedModules as ExtendedModule[]);
                const elig = await trainingService.checkLevelUpEligibility(currentEmployeeId);
                setEligibility(elig);
            } catch (error) {
                console.error('Failed to update progress', error);
                alert('Lỗi khi lưu tiến độ. Vui lòng thử lại.');
            }
            setPlayingCourse(null);
        }
    };

    const handleRequestLevelUp = async () => {
        if (!currentEmployeeId) return;
        setIsSubmitting(true);
        const success = await trainingService.requestLevelUp(currentEmployeeId);
        if (success) {
            setShowLevelUpModal(false);
            const elig = await trainingService.checkLevelUpEligibility(currentEmployeeId);
            setEligibility(elig);
        }
        setIsSubmitting(false);
    };

    const handleOpenEvaluation = async (evaluation: TrainingEvaluation) => {
        setSelectedEval(evaluation);
        const items = await trainingService.getChecklist(evaluation.toLevel);
        setChecklist(items);
        const state: Record<string, { checked: boolean; note: string }> = {};
        items.forEach(item => { state[item.id] = { checked: false, note: '' }; });
        setChecklistState(state);
        setRejectReason('');
    };

    const handleSubmitEvaluation = async (status: 'approved' | 'rejected') => {
        if (!selectedEval || !currentEmployeeId) return;
        if (status === 'rejected' && !rejectReason.trim()) return;

        setIsSubmitting(true);
        const results = checklist.map(item => ({
            itemId: item.id,
            itemText: item.itemText,
            checked: checklistState[item.id]?.checked || false,
            note: checklistState[item.id]?.note || '',
        }));

        const success = await trainingService.submitEvaluation(
            selectedEval.id,
            currentEmployeeId,
            status,
            results,
            status === 'rejected' ? rejectReason : undefined
        );

        if (success) {
            setSelectedEval(null);
            const evals = await trainingService.getPendingEvaluations();
            setEvaluations(evals);
            const progData = await trainingService.getEmployeeProgressReports();
            setEmployees(progData);
        }
        setIsSubmitting(false);
    };

    const handleOpenDirectEval = async (emp: EmployeeTrainingProgress) => {
        if (!isManager) return;
        setDirectEvalEmployee(emp);
        setDirectEvalLevel(emp.trainingLevel);
        setSubmitError(null);
        const items = await trainingService.getChecklist(emp.trainingLevel);
        setChecklist(items);
        const state: Record<string, { checked: boolean; note: string }> = {};
        items.forEach(item => { state[item.id] = { checked: false, note: '' }; });

        // Load previously saved evaluation
        const prev = await trainingService.getLatestEvaluation(emp.id, emp.trainingLevel);
        if (prev?.checklist_results && Array.isArray(prev.checklist_results)) {
            (prev.checklist_results as any[]).forEach((r: any) => {
                if (state[r.itemId]) {
                    state[r.itemId] = { checked: r.checked || false, note: r.note || '' };
                }
            });
        }
        setChecklistState(state);
    };

    const handleDirectEvalLevelChange = async (level: number) => {
        setDirectEvalLevel(level);
        setSubmitError(null);
        const items = await trainingService.getChecklist(level);
        setChecklist(items);
        const state: Record<string, { checked: boolean; note: string }> = {};
        items.forEach(item => { state[item.id] = { checked: false, note: '' }; });

        // Load previously saved evaluation for this level
        if (directEvalEmployee) {
            const prev = await trainingService.getLatestEvaluation(directEvalEmployee.id, level);
            if (prev?.checklist_results && Array.isArray(prev.checklist_results)) {
                (prev.checklist_results as any[]).forEach((r: any) => {
                    if (state[r.itemId]) {
                        state[r.itemId] = { checked: r.checked || false, note: r.note || '' };
                    }
                });
            }
        }
        setChecklistState(state);
    };

    const handleSubmitDirectEval = async () => {
        setSubmitError(null);
        if (!directEvalEmployee) {
            setSubmitError("Lỗi: Không tìm thấy nhân viên cần đánh giá.");
            return;
        }
        if (!currentEmployeeId) {
            setSubmitError("Lỗi: Không tìm thấy thông tin quản lý (ID trống). Vui lòng F5 và đăng nhập lại.");
            return;
        }
        setIsSubmitting(true);

        const results = checklist.map(item => ({
            itemId: item.id,
            itemText: item.itemText,
            checked: checklistState[item.id]?.checked || false,
            note: checklistState[item.id]?.note || '',
        }));

        try {
            const { success, error } = await trainingService.saveDirectEvaluation(
                directEvalEmployee.id,
                currentEmployeeId,
                directEvalLevel,
                results
            );

            if (success) {
                setDirectEvalEmployee(null);
                const progData = await trainingService.getEmployeeProgressReports();
                setEmployees(progData);
                // Refresh pending evaluations list
                if (isManager) {
                    const evals = await trainingService.getPendingEvaluations();
                    setEvaluations(evals);
                }
            } else {
                setSubmitError(`Failed to save: ${error || 'Không rõ nguyên nhân'}`);
            }
        } catch (e: any) {
            setSubmitError(`Exception: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // === LEVEL JOURNEY STEPPER ===
    const LevelStatusBar = () => {
        const currentLevelCourses = courses.filter(c => c.level === employeeLevel);
        const completedCount = currentLevelCourses.filter(c => c.progress === 100).length;
        const totalCount = currentLevelCourses.length;
        const allDone = totalCount > 0 && completedCount === totalCount;
        const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Stepper Timeline */}
                <div className={`${isMobile ? 'px-3 pt-4 pb-3' : 'px-6 pt-5 pb-4'}`}>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-500 uppercase tracking-wider`}>Hành trình đào tạo</h3>
                        {eligibility?.hasPendingEvaluation && (
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-amber-200">
                                <Clock className="w-2.5 h-2.5" /> Chờ đánh giá
                            </span>
                        )}
                    </div>

                    {/* Horizontal Stepper */}
                    <div className="flex items-center mt-3">
                        {levels.map((lvl, idx) => {
                            const isCompleted = lvl.id < employeeLevel;
                            const isActive = lvl.id === employeeLevel;
                            const isLocked = lvl.id > employeeLevel;
                            const isLast = idx === levels.length - 1;

                            return (
                                <React.Fragment key={lvl.id}>
                                    {/* Node */}
                                    <div className="flex flex-col items-center relative group">
                                        <div className={`
                                            ${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center transition-all duration-300
                                            ${isCompleted
                                                ? `bg-gradient-to-br ${lvl.gradient} text-white shadow-md`
                                                : isActive
                                                    ? `${lvl.bg} ${lvl.color} ring-2 ${lvl.ring} shadow-sm`
                                                    : 'bg-gray-100 text-gray-300'
                                            }
                                        `}>
                                            {isCompleted
                                                ? <Check className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} strokeWidth={3} />
                                                : renderIcon(lvl.icon, `${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`)
                                            }
                                        </div>
                                        {/* Label - hidden on mobile for space */}
                                        <span className={`
                                            ${isMobile ? 'text-[8px] mt-1' : 'text-[10px] mt-1.5'} font-medium text-center leading-tight
                                            ${isCompleted ? 'text-gray-600' : isActive ? lvl.color : 'text-gray-300'}
                                        `}>
                                            {isMobile ? `Lv${lvl.id}` : lvl.name}
                                        </span>
                                    </div>

                                    {/* Connector Line */}
                                    {!isLast && (
                                        <div className={`flex-1 ${isMobile ? 'h-0.5 mx-1' : 'h-[2px] mx-2'} rounded-full relative`}>
                                            <div className="absolute inset-0 bg-gray-100 rounded-full" />
                                            <div
                                                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${isCompleted ? `bg-gradient-to-r ${lvl.gradient}` : 'bg-transparent'
                                                    }`}
                                                style={{ width: isCompleted ? '100%' : isActive ? `${progressPct}%` : '0%' }}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Current Level Progress Footer */}
                <div className={`${isMobile ? 'px-3 py-2.5' : 'px-6 py-3'} bg-gray-50/80 border-t border-gray-100 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                        <div className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} rounded-lg ${levels[employeeLevel - 1]?.bg} flex items-center justify-center`}>
                            {renderIcon(levels[employeeLevel - 1]?.icon || 'Award', `${isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${levels[employeeLevel - 1]?.color}`)}
                        </div>
                        <div>
                            <span className={`${isMobile ? 'text-[11px]' : 'text-xs'} font-semibold text-gray-700`}>
                                Level {employeeLevel}: {levels[employeeLevel - 1]?.name}
                            </span>
                            <span className={`${isMobile ? 'text-[10px]' : 'text-[11px]'} text-gray-400 ml-2`}>
                                {completedCount}/{totalCount} bài
                            </span>
                        </div>
                    </div>

                    {/* Action or Status */}
                    {allDone && eligibility?.eligible && !eligibility?.hasPendingEvaluation && (
                        <button
                            onClick={() => setShowLevelUpModal(true)}
                            className={`${isMobile ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3 py-1.5'} bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg font-medium flex items-center gap-1 transition-all shadow-sm`}
                        >
                            <ArrowUp className={`${isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
                            Lên Level
                        </button>
                    )}

                    {allDone && !eligibility?.eligible && !eligibility?.hasPendingEvaluation && eligibility?.minDaysRequired > 0 && (
                        <span className={`${isMobile ? 'text-[10px]' : 'text-[11px]'} text-gray-400 flex items-center gap-1`}>
                            <Clock className="w-3 h-3" />
                            Còn {eligibility.minDaysRequired - eligibility.daysWaited} ngày
                        </span>
                    )}

                    {!allDone && totalCount > 0 && (
                        <span className={`${isMobile ? 'text-[10px]' : 'text-[11px]'} font-semibold ${levels[employeeLevel - 1]?.color}`}>
                            {progressPct}%
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // === TAB NAVIGATION ===
    const tabs = [
        { id: 'learn' as const, label: 'Khóa học', icon: <Play className="w-4 h-4" /> },
        { id: 'report' as const, label: 'Báo cáo', icon: <BarChart2 className="w-4 h-4" /> },
        ...(isManager ? [{ id: 'evaluate' as const, label: 'Đánh giá', icon: <ClipboardCheck className="w-4 h-4" /> }] : []),
    ];

    const pendingCount = evaluations.filter(e => e.status === 'pending').length;

    // === COURSE LIST ===
    const renderCourseList = (isMobileView: boolean) => (
        <div className="space-y-6">
            <LevelStatusBar />

            {[1, 2, 3, 4, 5].map((levelId) => {
                const levelCourses = courses.filter(c => c.level === levelId);
                if (levelCourses.length === 0) return null;
                const levelInfo = levels.find(l => l.id === levelId);
                const isLocked = levelId > employeeLevel;

                return (
                    <section key={levelId} className={isLocked ? 'opacity-50' : ''}>
                        <h3 className={`${isMobileView ? 'text-base' : 'text-xl'} font-bold text-gray-800 mb-3 flex items-center gap-2`}>
                            <span className={`${isMobileView ? 'w-1.5 h-5' : 'w-2 h-8'} rounded-full ${levelInfo?.bgDark}`}></span>
                            Level {levelId}: {levelInfo?.name}
                            {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                        </h3>

                        {isLocked ? (
                            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-center text-sm text-gray-500">
                                <Lock className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                                Hoàn thành Level {levelId - 1} và được đánh giá để mở khóa
                            </div>
                        ) : isMobileView ? (
                            <div className="space-y-3">
                                {levelCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        onClick={() => !isLocked && setPlayingCourse(course)}
                                        className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex gap-3 active:bg-gray-50"
                                    >
                                        <div className="relative w-24 h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                                                    <Play className="w-3 h-3 text-teal-600 ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-0.5">
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">{course.title}</h4>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{course.duration}</span>
                                                <div className="flex items-center gap-2 flex-1 justify-end max-w-[80px]">
                                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${course.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {levelCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        onClick={() => !isLocked && setPlayingCourse(course)}
                                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col"
                                    >
                                        <div className="relative aspect-video bg-gray-100 overflow-hidden shrink-0">
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="w-5 h-5 text-teal-600 ml-1" />
                                                </div>
                                            </div>
                                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">{course.duration}</span>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h4 className="font-semibold text-gray-800 line-clamp-2 mb-3 leading-tight flex-1">{course.title}</h4>
                                            <div className="space-y-2 mt-auto">
                                                <div className="flex justify-between text-xs font-medium text-gray-500">
                                                    <span>{course.progress === 100 ? 'Hoàn thành' : `${course.progress}%`}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${course.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );

    // === REPORT VIEW ===
    const renderReport = (isMobileView: boolean) => isMobileView ? (
        <div className="space-y-4">
            {employees.map((emp) => (
                <div
                    key={emp.id}
                    className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm ${isManager ? 'cursor-pointer hover:border-teal-300 transition-colors' : ''}`}
                    onClick={() => isManager && handleOpenDirectEval(emp)}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div>
                            <div className="font-bold text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-500">{emp.role}</div>
                        </div>
                        <div className="ml-auto text-right">
                            <span className={`text-sm font-bold ${emp.overallProgress >= 80 ? 'text-green-600' : 'text-blue-600'}`}>
                                {emp.overallProgress}%
                            </span>
                            <div className="text-[10px] text-gray-400">Lv{emp.trainingLevel}</div>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${emp.overallProgress >= 80 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${emp.overallProgress}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {emp.badges.map((badgeId) => {
                                const lvl = levels.find(l => l.id === badgeId);
                                return (
                                    <div key={badgeId} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${lvl?.bgDark}`}>{badgeId}</div>
                                );
                            })}
                            {emp.badges.length === 0 && <span className="text-xs text-gray-400 italic">Chưa có</span>}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levels[emp.trainingLevel - 1]?.bg} ${levels[emp.trainingLevel - 1]?.color}`}>
                            Level {emp.trainingLevel}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <th className="px-6 py-4">Nhân viên</th>
                            <th className="px-6 py-4">Vai trò</th>
                            <th className="px-6 py-4 text-center">Level</th>
                            <th className="px-6 py-4 text-center">Tiến độ tổng</th>
                            <th className="px-6 py-4">Huy hiệu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees.map((emp) => (
                            <tr
                                key={emp.id}
                                className={`hover:bg-gray-50/50 transition-colors ${isManager ? 'cursor-pointer hover:bg-teal-50/30' : ''}`}
                                onClick={() => isManager && handleOpenDirectEval(emp)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" referrerPolicy="no-referrer" />
                                        <span className="font-medium text-gray-900">{emp.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{emp.role}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${levels[emp.trainingLevel - 1]?.bg} ${levels[emp.trainingLevel - 1]?.color}`}>
                                        {renderIcon(levels[emp.trainingLevel - 1]?.icon || 'Award', 'w-3 h-3')}
                                        Lv{emp.trainingLevel}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 max-w-[140px] mx-auto">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${emp.overallProgress >= 80 ? 'bg-green-500' : emp.overallProgress >= 50 ? 'bg-blue-500' : 'bg-orange-400'}`} style={{ width: `${emp.overallProgress}%` }}></div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 w-8 text-right">{emp.overallProgress}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-2">
                                        {emp.badges.map((badgeId) => {
                                            const lvl = levels.find(l => l.id === badgeId);
                                            return (
                                                <div key={badgeId} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ${lvl?.bgDark}`} title={lvl?.name}>{badgeId}</div>
                                            );
                                        })}
                                        {emp.badges.length === 0 && <span className="text-xs text-gray-400 italic">Chưa có</span>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // === EVALUATION TAB ===
    const renderEvaluationTab = () => {
        const pending = evaluations.filter(e => e.status === 'pending');
        const approved = evaluations.filter(e => e.status === 'approved');
        const rejected = evaluations.filter(e => e.status === 'rejected');
        const history = evaluations.filter(e => e.status !== 'pending');

        return (
            <div className={`space-y-5 ${isMobile ? '' : 'max-w-4xl mx-auto'}`}>
                {/* Stats Summary */}
                <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-4'}`}>
                    <div className="bg-white rounded-xl border border-amber-100 p-3 text-center">
                        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-amber-600`}>{pending.length}</div>
                        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-medium`}>Chờ duyệt</div>
                    </div>
                    <div className="bg-white rounded-xl border border-green-100 p-3 text-center">
                        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>{approved.length}</div>
                        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-medium`}>Đã duyệt</div>
                    </div>
                    <div className="bg-white rounded-xl border border-red-100 p-3 text-center">
                        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-red-500`}>{rejected.length}</div>
                        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-medium`}>Từ chối</div>
                    </div>
                </div>

                {/* Pending Evaluations */}
                <div>
                    <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-gray-800 mb-3 flex items-center gap-2`}>
                        <span className="w-1.5 h-5 rounded-full bg-amber-400" />
                        Chờ đánh giá
                        {pending.length > 0 && (
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold border border-amber-200">{pending.length}</span>
                        )}
                    </h3>
                    {pending.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-sm text-gray-400">
                            <ClipboardCheck className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                            Không có yêu cầu nào
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pending.map((ev) => (
                                <div
                                    key={ev.id}
                                    className="bg-white p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-amber-200 hover:shadow-sm transition-all group"
                                    onClick={() => handleOpenEvaluation(ev)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`${isMobile ? 'w-8 h-8' : 'w-9 h-9'} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                                {ev.employeeName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className={`${isMobile ? 'text-sm' : 'text-sm'} font-semibold text-gray-900`}>{ev.employeeName}</div>
                                                <div className="text-[11px] text-gray-400">{ev.employeeRole}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${levels[ev.fromLevel - 1]?.bg} ${levels[ev.fromLevel - 1]?.color}`}>
                                                {ev.fromLevel}
                                            </span>
                                            <ChevronRight className="w-3 h-3 text-gray-300" />
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${levels[ev.toLevel - 1]?.bg} ${levels[ev.toLevel - 1]?.color}`}>
                                                {ev.toLevel}
                                            </span>
                                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-400 transition-colors ml-1" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* History Timeline */}
                {history.length > 0 && (
                    <div>
                        <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-gray-800 mb-3 flex items-center gap-2`}>
                            <span className="w-1.5 h-5 rounded-full bg-gray-300" />
                            Lịch sử
                        </h3>
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />

                            <div className="space-y-1">
                                {history.slice(0, 10).map((ev) => {
                                    const isApproved = ev.status === 'approved';
                                    return (
                                        <div key={ev.id} className="relative flex items-center gap-3 pl-1">
                                            {/* Timeline dot */}
                                            <div className={`z-10 w-[26px] h-[26px] rounded-full border-2 border-white flex items-center justify-center shrink-0 shadow-sm
                                                ${isApproved ? 'bg-green-100' : 'bg-red-50'}`}
                                            >
                                                {isApproved
                                                    ? <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                                                    : <X className="w-3 h-3 text-red-500" strokeWidth={3} />
                                                }
                                            </div>
                                            {/* Content */}
                                            <div className="flex-1 bg-white rounded-lg border border-gray-100 px-3 py-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-800">{ev.employeeName}</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        Lv{ev.fromLevel} → Lv{ev.toLevel}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold ${isApproved ? 'text-green-600' : 'text-red-500'}`}>
                                                        {isApproved ? 'Duyệt' : 'Từ chối'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-300">
                                                        {ev.evaluatedAt ? new Date(ev.evaluatedAt).toLocaleDateString('vi-VN') : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // === MAIN RENDER ===
    return (
        <>
            <div className={`${isMobile ? 'h-full' : 'h-[calc(100vh-64px)]'} bg-gray-50 flex flex-col overflow-hidden`}>
                {/* Header / Tabs */}
                <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0 z-10">
                    {isMobile && (
                        <div className="relative mb-3">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Tìm khóa học..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${isMobile ? 'flex-1 px-2 text-xs' : 'px-4 text-sm'} py-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 relative whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {tab.id === 'evaluate' && pendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{pendingCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        {!isMobile && activeTab === 'learn' && (
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Tìm khóa học..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-64" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-y-auto p-4 md:p-6 min-h-0`}>
                    {activeTab === 'learn' && renderCourseList(isMobile)}
                    {activeTab === 'report' && renderReport(isMobile)}
                    {activeTab === 'evaluate' && isManager && renderEvaluationTab()}
                </div>
            </div>

            {/* Video Player Modal */}
            {playingCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8" onClick={() => setPlayingCourse(null)}>
                    <div className="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                    <Play className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">{playingCourse.title}</h3>
                                    <p className="text-gray-400 text-sm">Level {playingCourse.level} • {playingCourse.duration}</p>
                                </div>
                            </div>
                            <button onClick={() => setPlayingCourse(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="relative aspect-video bg-black">
                            {playingCourse.youtubeId ? (
                                <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${playingCourse.youtubeId}?autoplay=1&rel=0`} title={playingCourse.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">Video không khả dụng</div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-900 flex justify-between items-center">
                            <p className="text-gray-400 text-sm">Hãy xem hết video để hoàn thành bài học này nhé!</p>
                            <button onClick={handleCompleteVideo} className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-teal-900/20">
                                <CheckCircle className="w-5 h-5" />
                                Tôi đã xem xong
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Level Up Request Modal */}
            {showLevelUpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowLevelUpModal(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${levels[employeeLevel]?.gradient || 'from-teal-500 to-teal-600'} flex items-center justify-center shadow-lg`}>
                                {renderIcon(levels[employeeLevel]?.icon || 'Award', 'w-7 h-7 text-white')}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Yêu cầu lên Level {employeeLevel + 1}</h3>
                            <p className="text-sm text-gray-500 mt-1.5">
                                Bạn đã hoàn thành tất cả bài học. Yêu cầu sẽ được gửi đến quản lý để đánh giá.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl mb-5 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Hiện tại</span><span className="font-semibold text-gray-700">Level {employeeLevel}: {levels[employeeLevel - 1]?.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Tiếp theo</span><span className="font-semibold text-gray-700">Level {employeeLevel + 1}: {levels[employeeLevel]?.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Điều kiện</span><span className="font-semibold text-green-600">✓ Đủ</span></div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowLevelUpModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Hủy</button>
                            <button onClick={handleRequestLevelUp} disabled={isSubmitting} className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 shadow-sm">
                                {isSubmitting ? 'Đang gửi...' : <><ArrowUp className="w-4 h-4" /> Gửi yêu cầu</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Evaluation Modal */}
            {selectedEval && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedEval(null)}>
                    <div className={`bg-white rounded-2xl ${isMobile ? 'w-full max-h-[90vh]' : 'max-w-lg w-full max-h-[85vh]'} shadow-2xl flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900">Đánh giá thăng cấp</h3>
                                <button onClick={() => setSelectedEval(null)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${levels[selectedEval.toLevel - 1]?.gradient || 'from-amber-400 to-orange-500'} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                                    {selectedEval.employeeName?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">{selectedEval.employeeName}</div>
                                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                        {selectedEval.employeeRole}
                                        <span className="text-gray-300">•</span>
                                        <span className={`font-bold ${levels[selectedEval.fromLevel - 1]?.color}`}>Lv{selectedEval.fromLevel}</span>
                                        <span className="text-gray-300">→</span>
                                        <span className={`font-bold ${levels[selectedEval.toLevel - 1]?.color}`}>Lv{selectedEval.toLevel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Checklist Progress */}
                            {checklist.length > 0 && (
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-teal-500 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.round((Object.values(checklistState).filter((v: any) => v.checked).length / checklist.length) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {Object.values(checklistState).filter((v: any) => v.checked).length}/{checklist.length}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Checklist */}
                        <div className="p-4 flex-1 overflow-y-auto space-y-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Checklist — {levels[selectedEval.toLevel - 1]?.name}
                            </h4>
                            {checklist.map((item, idx) => {
                                const isChecked = checklistState[item.id]?.checked || false;
                                return (
                                    <div key={item.id} className={`rounded-lg border transition-colors ${isChecked ? 'bg-teal-50/50 border-teal-200' : 'bg-white border-gray-100'}`}>
                                        <label className="flex items-start gap-3 p-3 cursor-pointer">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${isChecked ? 'bg-teal-500 border-teal-500' : 'border-gray-200'}`}>
                                                {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => setChecklistState(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: e.target.checked } }))}
                                                    className="sr-only"
                                                />
                                                <span className={`text-sm ${isChecked ? 'text-teal-800' : 'text-gray-700'}`}>{item.itemText}</span>
                                                <input
                                                    type="text"
                                                    placeholder="Ghi chú..."
                                                    value={checklistState[item.id]?.note || ''}
                                                    onChange={(e) => setChecklistState(prev => ({ ...prev, [item.id]: { ...prev[item.id], note: e.target.value } }))}
                                                    className="w-full mt-1.5 text-xs px-2.5 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white/80"
                                                />
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}

                            {/* Reject Reason */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Lý do từ chối
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Nhập lý do nếu từ chối..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none bg-gray-50"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-100 flex gap-2.5 shrink-0">
                            <button
                                onClick={() => handleSubmitEvaluation('rejected')}
                                disabled={isSubmitting || !rejectReason.trim()}
                                className="flex-1 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                Từ chối
                            </button>
                            <button
                                onClick={() => handleSubmitEvaluation('approved')}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {isSubmitting ? 'Đang xử lý...' : 'Duyệt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Direct Evaluation Modal */}
            {directEvalEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDirectEvalEmployee(null)}>
                    <div className={`bg-white rounded-2xl ${isMobile ? 'w-full max-h-[90vh]' : 'max-w-lg w-full max-h-[85vh]'} shadow-2xl flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900">Đánh giá trực tiếp</h3>
                                <button onClick={() => setDirectEvalEmployee(null)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${levels[directEvalEmployee.trainingLevel - 1]?.gradient || 'from-teal-400 to-teal-500'} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                                    {directEvalEmployee.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">{directEvalEmployee.name}</div>
                                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                        {directEvalEmployee.role}
                                        <span className="text-gray-300">•</span>
                                        <span className={`font-bold ${levels[directEvalEmployee.trainingLevel - 1]?.color}`}>Hiện tại: Lv{directEvalEmployee.trainingLevel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Level Selector */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {levels.map(lvl => (
                                    <button
                                        key={lvl.id}
                                        onClick={() => handleDirectEvalLevelChange(lvl.id)}
                                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${directEvalLevel === lvl.id ? `bg-gradient-to-br ${lvl.gradient} text-white border-transparent shadow-sm` : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Level {lvl.id}: {lvl.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-gray-50/50">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tiêu chí đánh giá Level {directEvalLevel}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {Object.values(checklistState).filter((v: any) => v.checked).length}/{checklist.length} hoàn thành
                                </span>
                            </div>

                            {checklist.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    Không có tiêu chí đánh giá nào cho cấp độ này.
                                </div>
                            ) : (
                                checklist.map((item) => {
                                    const isChecked = checklistState[item.id]?.checked || false;
                                    return (
                                        <div key={item.id} className={`rounded-xl border transition-colors overflow-hidden ${isChecked ? 'bg-teal-50/30 border-teal-200' : 'bg-white border-gray-200'}`}>
                                            <label className="flex items-start gap-3 p-3 cursor-pointer">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${isChecked ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
                                                    {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => setChecklistState(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: e.target.checked } }))}
                                                        className="sr-only"
                                                    />
                                                    <span className={`text-sm ${isChecked ? 'text-teal-900 font-medium' : 'text-gray-700'}`}>{item.itemText}</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Ghi chú thêm (tùy chọn)..."
                                                        value={checklistState[item.id]?.note || ''}
                                                        onChange={(e) => setChecklistState(prev => ({ ...prev, [item.id]: { ...prev[item.id], note: e.target.value } }))}
                                                        className="w-full mt-2 text-xs px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                                    />
                                                </div>
                                            </label>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                            {submitError && (
                                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium whitespace-pre-wrap">
                                    {submitError}
                                </div>
                            )}
                            {directEvalLevel > directEvalEmployee.trainingLevel && (
                                <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                                    <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-800">
                                        Đánh giá Level {directEvalLevel} sẽ được gửi lên <strong>chờ duyệt</strong>. Khi được duyệt, nhân viên sẽ được thăng cấp.
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDirectEvalEmployee(null)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmitDirectEval}
                                    disabled={isSubmitting || checklist.length === 0}
                                    className="flex-[2] py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <ClipboardCheck className="w-4 h-4" />
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá (Chờ duyệt)'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
