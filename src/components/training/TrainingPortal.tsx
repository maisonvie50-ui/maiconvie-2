import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Play, Award, CheckCircle, BarChart2, Search, Lock, X, Star, Target, Shield, Crown, ArrowUp, Clock, ClipboardCheck, ChevronRight, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

import { trainingService, TrainingModule, EmployeeTrainingProgress, LevelConfig, TrainingEvaluation, ChecklistItem } from '../../services/trainingService';

interface ExtendedModule extends TrainingModule {
    locked?: boolean;
}

const levels = [
    { id: 1, name: 'Level 1: Nhập môn', color: 'text-emerald-500', bg: 'bg-emerald-100', bgDark: 'bg-emerald-500', icon: 'Award' },
    { id: 2, name: 'Level 2: Cơ bản', color: 'text-blue-500', bg: 'bg-blue-100', bgDark: 'bg-blue-500', icon: 'Star' },
    { id: 3, name: 'Level 3: Nâng cao', color: 'text-purple-500', bg: 'bg-purple-100', bgDark: 'bg-purple-500', icon: 'Target' },
    { id: 4, name: 'Level 4: Chuyên sâu', color: 'text-orange-500', bg: 'bg-orange-100', bgDark: 'bg-orange-500', icon: 'Shield' },
    { id: 5, name: 'Level 5: Quản lý', color: 'text-red-500', bg: 'bg-red-100', bgDark: 'bg-red-500', icon: 'Crown' },
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
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('');
    const isMobile = useIsMobile();

    React.useEffect(() => {
        const loadData = async () => {
            try {
                // Get current employee from localStorage
                const stored = localStorage.getItem('currentEmployee');
                const empId = stored ? JSON.parse(stored)?.id : null;
                const empIsManager = stored ? JSON.parse(stored)?.role_manager : false;
                setCurrentEmployeeId(empId || '');
                setIsManager(empIsManager);

                const [modulesData, progressData, configs] = await Promise.all([
                    trainingService.getModules(empId),
                    trainingService.getEmployeeProgressReports(),
                    trainingService.getLevelConfig(),
                ]);
                setCourses(modulesData as ExtendedModule[]);
                setEmployees(progressData);
                setLevelConfigs(configs);

                if (empId) {
                    const level = await trainingService.getEmployeeLevel(empId);
                    setEmployeeLevel(level);
                    const elig = await trainingService.checkLevelUpEligibility(empId);
                    setEligibility(elig);
                }

                if (empIsManager) {
                    const evals = await trainingService.getPendingEvaluations();
                    setEvaluations(evals);
                }
            } catch (error) {
                console.error('Failed to load training data:', error);
            }
        };
        loadData();
    }, []);

    const handleCompleteVideo = async () => {
        if (playingCourse) {
            setCourses(courses.map(c => c.id === playingCourse.id ? { ...c, progress: 100 } : c));
            try {
                await trainingService.updateProgress(currentEmployeeId || 'current-user-id', playingCourse.id, 100);
                // Re-check eligibility after completing a video
                if (currentEmployeeId) {
                    const elig = await trainingService.checkLevelUpEligibility(currentEmployeeId);
                    setEligibility(elig);
                }
            } catch (error) {
                console.error('Failed to update progress', error);
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

    // === LEVEL STATUS BAR ===
    const LevelStatusBar = () => {
        const currentLevelCourses = courses.filter(c => c.level === employeeLevel);
        const completedCount = currentLevelCourses.filter(c => c.progress === 100).length;
        const totalCount = currentLevelCourses.length;
        const allDone = totalCount > 0 && completedCount === totalCount;

        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${levels[employeeLevel - 1]?.bg}`}>
                            {renderIcon(levels[employeeLevel - 1]?.icon || 'Award', `w-4 h-4 ${levels[employeeLevel - 1]?.color}`)}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">{levels[employeeLevel - 1]?.name}</h3>
                            <p className="text-xs text-gray-500">{completedCount}/{totalCount} bài hoàn thành</p>
                        </div>
                    </div>
                    {eligibility?.hasPendingEvaluation && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Đang chờ đánh giá
                        </span>
                    )}
                </div>

                {/* Level badges */}
                <div className="flex gap-2 mb-3">
                    {levels.map((lvl) => {
                        const isActive = lvl.id === employeeLevel;
                        const isCompleted = lvl.id < employeeLevel;
                        const isLocked = lvl.id > employeeLevel;
                        return (
                            <div
                                key={lvl.id}
                                className={`flex-1 h-1.5 rounded-full ${isCompleted ? lvl.bgDark : isActive ? `${lvl.bgDark} opacity-60` : 'bg-gray-200'
                                    }`}
                            />
                        );
                    })}
                </div>

                {/* Level Up Button */}
                {allDone && eligibility?.eligible && !eligibility?.hasPendingEvaluation && (
                    <button
                        onClick={() => setShowLevelUpModal(true)}
                        className="w-full mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-500/20"
                    >
                        <ArrowUp className="w-4 h-4" />
                        Yêu cầu lên {levels[employeeLevel]?.name || 'Level tiếp theo'}
                    </button>
                )}

                {allDone && !eligibility?.eligible && !eligibility?.hasPendingEvaluation && eligibility?.minDaysRequired > 0 && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                            Bạn đã hoàn thành tất cả bài học. Cần chờ thêm <strong>{eligibility.minDaysRequired - eligibility.daysWaited}</strong> ngày nữa để yêu cầu lên level.
                        </div>
                    </div>
                )}
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

    // === COURSE LIST (shared between mobile/desktop) ===
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
                            <span className={`${isMobileView ? 'w-1.5 h-5' : 'w-2 h-8'} rounded-full ${levelInfo?.bg}`}></span>
                            {levelInfo?.name}
                            {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                        </h3>

                        {isLocked ? (
                            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-center text-sm text-gray-500">
                                <Lock className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                                Hoàn thành {levels[levelId - 2]?.name} và được đánh giá để mở khóa
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
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
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

    // === REPORT VIEW (shared) ===
    const renderReport = (isMobileView: boolean) => isMobileView ? (
        <div className="space-y-4">
            {employees.map((emp) => (
                <div key={emp.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
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
                            <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
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

    // === EVALUATION TAB (Manager only) ===
    const renderEvaluationTab = () => {
        const pending = evaluations.filter(e => e.status === 'pending');
        const history = evaluations.filter(e => e.status !== 'pending');

        return (
            <div className={`space-y-6 ${isMobile ? '' : 'max-w-4xl mx-auto'}`}>
                {/* Pending Evaluations */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Chờ đánh giá ({pending.length})
                    </h3>
                    {pending.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
                            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            Không có yêu cầu nào đang chờ
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pending.map((ev) => (
                                <div key={ev.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenEvaluation(ev)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                                <ArrowUp className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{ev.employeeName}</div>
                                                <div className="text-xs text-gray-500">{ev.employeeRole}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${levels[ev.fromLevel - 1]?.bg} ${levels[ev.fromLevel - 1]?.color}`}>Lv{ev.fromLevel}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${levels[ev.toLevel - 1]?.bg} ${levels[ev.toLevel - 1]?.color}`}>Lv{ev.toLevel}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        Yêu cầu: {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* History */}
                {history.length > 0 && (
                    <div>
                        <h3 className="text-base font-bold text-gray-800 mb-3">Lịch sử đánh giá</h3>
                        <div className="space-y-2">
                            {history.slice(0, 10).map((ev) => (
                                <div key={ev.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ev.status === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {ev.status === 'approved' ? <ThumbsUp className="w-4 h-4 text-green-600" /> : <ThumbsDown className="w-4 h-4 text-red-600" />}
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm text-gray-800">{ev.employeeName}</span>
                                            <span className="text-xs text-gray-500 ml-2">Lv{ev.fromLevel} → Lv{ev.toLevel}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-bold ${ev.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                            {ev.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                        </span>
                                        <div className="text-[10px] text-gray-400">{ev.evaluatedAt ? new Date(ev.evaluatedAt).toLocaleDateString('vi-VN') : ''}</div>
                                    </div>
                                </div>
                            ))}
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
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${levels[employeeLevel]?.bg || 'bg-teal-100'} flex items-center justify-center`}>
                                {renderIcon(levels[employeeLevel]?.icon || 'Award', `w-8 h-8 ${levels[employeeLevel]?.color || 'text-teal-500'}`)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Yêu cầu lên Level {employeeLevel + 1}</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Bạn đã hoàn thành tất cả bài học ở {levels[employeeLevel - 1]?.name}. Yêu cầu sẽ được gửi đến quản lý để đánh giá.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Level hiện tại:</span><span className="font-bold">{levels[employeeLevel - 1]?.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Level tiếp theo:</span><span className="font-bold">{levels[employeeLevel]?.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Thời gian chờ:</span><span className="font-bold text-green-600">✓ Đủ điều kiện</span></div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowLevelUpModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                            <button onClick={handleRequestLevelUp} disabled={isSubmitting} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2">
                                {isSubmitting ? 'Đang gửi...' : <><ArrowUp className="w-4 h-4" /> Gửi yêu cầu</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Evaluation Modal (for Manager) */}
            {selectedEval && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedEval(null)}>
                    <div className={`bg-white rounded-2xl ${isMobile ? 'w-full max-h-[90vh]' : 'max-w-lg w-full max-h-[85vh]'} shadow-2xl flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
                        {/* Eval Header */}
                        <div className="p-5 border-b border-gray-200 shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900">Đánh giá thăng cấp</h3>
                                <button onClick={() => setSelectedEval(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <ArrowUp className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{selectedEval.employeeName}</div>
                                    <div className="text-xs text-gray-500">{selectedEval.employeeRole} • {levels[selectedEval.fromLevel - 1]?.name} → {levels[selectedEval.toLevel - 1]?.name}</div>
                                </div>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="p-5 flex-1 overflow-y-auto space-y-3">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Checklist đánh giá cho {levels[selectedEval.toLevel - 1]?.name}</h4>
                            {checklist.map(item => (
                                <div key={item.id} className="bg-gray-50 p-3 rounded-lg space-y-2">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={checklistState[item.id]?.checked || false}
                                            onChange={(e) => setChecklistState(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: e.target.checked } }))}
                                            className="mt-0.5 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-800">{item.itemText}</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ghi chú (tùy chọn)..."
                                        value={checklistState[item.id]?.note || ''}
                                        onChange={(e) => setChecklistState(prev => ({ ...prev, [item.id]: { ...prev[item.id], note: e.target.value } }))}
                                        className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                            ))}

                            {/* Reject Reason */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                                    Lý do từ chối (nếu reject)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Nhập lý do nếu từ chối..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-5 border-t border-gray-200 flex gap-3 shrink-0">
                            <button
                                onClick={() => handleSubmitEvaluation('rejected')}
                                disabled={isSubmitting || !rejectReason.trim()}
                                className="flex-1 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <ThumbsDown className="w-4 h-4" />
                                Từ chối
                            </button>
                            <button
                                onClick={() => handleSubmitEvaluation('approved')}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                {isSubmitting ? 'Đang xử lý...' : 'Duyệt thăng cấp'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
