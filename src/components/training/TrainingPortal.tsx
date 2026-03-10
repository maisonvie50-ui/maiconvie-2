import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Play, Award, CheckCircle, BarChart2, Search, Lock, X, Star, Target, Shield, Crown } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    progress: number; // 0-100
    level: number;
    youtubeId?: string;
}

import { trainingService, TrainingModule, EmployeeTrainingProgress } from '../../services/trainingService';

const levels = [
    { id: 1, name: 'Level 1: Nhập môn', color: 'text-emerald-500', bg: 'bg-emerald-100', icon: 'Award' },
    { id: 2, name: 'Level 2: Cơ bản', color: 'text-blue-500', bg: 'bg-blue-100', icon: 'Star' },
    { id: 3, name: 'Level 3: Nâng cao', color: 'text-purple-500', bg: 'bg-purple-100', icon: 'Target' },
    { id: 4, name: 'Level 4: Chuyên sâu', color: 'text-orange-500', bg: 'bg-orange-100', icon: 'Shield' },
    { id: 5, name: 'Level 5: Quản lý', color: 'text-red-500', bg: 'bg-red-100', icon: 'Crown' },
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
    const [activeTab, setActiveTab] = useState<'learn' | 'report'>('learn');
    const [courses, setCourses] = useState<TrainingModule[]>([]);
    const [employees, setEmployees] = useState<EmployeeTrainingProgress[]>([]);
    const [playingCourse, setPlayingCourse] = useState<TrainingModule | null>(null);
    const isMobile = useIsMobile();

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [modulesData, progressData] = await Promise.all([
                    trainingService.getModules(),
                    trainingService.getEmployeeProgressReports()
                ]);
                setCourses(modulesData.map(c => ({ ...c, progress: 0 }))); // Set initially to 0
                setEmployees(progressData);
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
                await trainingService.updateProgress('current-user-id', playingCourse.id, 100);
            } catch (error) {
                console.error('Failed to update progress', error);
            }
            setPlayingCourse(null);
        }
    };

    const renderMobileView = () => (
        <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            {/* Mobile Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 z-10">
                {/* Search Bar */}
                <div className="relative mb-3">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm khóa học..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('learn')}
                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'learn' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500'
                            }`}
                    >
                        <Play className="w-4 h-4" />
                        Khóa học
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'report' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500'
                            }`}
                    >
                        <BarChart2 className="w-4 h-4" />
                        Báo cáo
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {activeTab === 'learn' ? (
                    <div className="space-y-6">
                        {/* Compact Badges */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                Thành tích
                            </h3>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                {levels.map((lvl) => {
                                    // A level is unlocked if it's Level 1, OR if the immediately preceding level has courses AND all of them are 100% complete.
                                    const prevLevelCourses = courses.filter(c => c.level === lvl.id - 1);
                                    const isUnlocked = lvl.id === 1 || (prevLevelCourses.length > 0 && prevLevelCourses.every(c => c.progress === 100));
                                    return (
                                        <div
                                            key={lvl.id}
                                            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg border ${isUnlocked ? `${lvl.bg} border-transparent` : 'bg-gray-50 border-gray-200 opacity-50'
                                                }`}
                                        >
                                            <div className={`text-xs font-bold ${isUnlocked ? lvl.color : 'text-gray-400'}`}>
                                                Lvl {lvl.id}
                                            </div>
                                            {isUnlocked ? renderIcon(lvl.icon, `w-5 h-5 ${lvl.color}`) : <Lock className="w-4 h-4 text-gray-400" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Compact Course List */}
                        {[1, 2, 3, 4, 5].map((levelId) => {
                            const levelCourses = courses.filter(c => c.level === levelId);
                            if (levelCourses.length === 0) return null;
                            const levelInfo = levels.find(l => l.id === levelId);

                            return (
                                <section key={levelId}>
                                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className={`w-1.5 h-5 rounded-full ${levelInfo?.bg.replace('bg-', 'bg-')}`}></span>
                                        {levelInfo?.name}
                                    </h3>

                                    <div className="space-y-3">
                                        {levelCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                onClick={() => setPlayingCourse(course)}
                                                className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex gap-3 active:bg-gray-50"
                                            >
                                                {/* Thumbnail (Left) */}
                                                <div className="relative w-24 h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                        <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                                                            <Play className="w-3 h-3 text-teal-600 ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Info (Right) */}
                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                                        {course.title}
                                                    </h4>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                            {course.duration}
                                                        </span>
                                                        <div className="flex items-center gap-2 flex-1 justify-end max-w-[80px]">
                                                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-teal-500'}`}
                                                                    style={{ width: `${course.progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    // Mobile Report View
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
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                                    <div
                                        className={`h-full rounded-full ${emp.overallProgress >= 80 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${emp.overallProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex gap-1">
                                    {emp.badges.map((badgeId) => {
                                        const lvl = levels.find(l => l.id === badgeId);
                                        return (
                                            <div key={badgeId} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${lvl?.bg.replace('bg-', 'bg-').replace('100', '500')}`}>
                                                {badgeId}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderDesktopView = () => (
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col relative">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('learn')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'learn' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Play className="w-4 h-4" />
                        Khóa học của tôi
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'report' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <BarChart2 className="w-4 h-4" />
                        Báo cáo tiến độ
                    </button>
                </div>

                {activeTab === 'learn' && (
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm khóa học..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-64"
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'learn' ? (
                    <div className="space-y-10 max-w-7xl mx-auto">
                        {/* Course Lists by Level */}
                        <div className="space-y-8">
                            {[1, 2, 3, 4, 5].map((levelId) => {
                                const levelCourses = courses.filter(c => c.level === levelId);
                                if (levelCourses.length === 0) return null;

                                const levelInfo = levels.find(l => l.id === levelId);

                                return (
                                    <section key={levelId}>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <span className={`w-2 h-8 rounded-full ${levelInfo?.bg.replace('bg-', 'bg-')}`}></span>
                                            {levelInfo?.name}
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {levelCourses.map((course) => (
                                                <div
                                                    key={course.id}
                                                    onClick={() => setPlayingCourse(course)}
                                                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="relative aspect-video bg-gray-100 overflow-hidden shrink-0">
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                                <Play className="w-5 h-5 text-teal-600 ml-1" />
                                                            </div>
                                                        </div>
                                                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                                                            {course.duration}
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <h4 className="font-semibold text-gray-800 line-clamp-2 mb-3 leading-tight flex-1">
                                                            {course.title}
                                                        </h4>

                                                        {/* Progress Bar */}
                                                        <div className="space-y-2 mt-auto">
                                                            <div className="flex justify-between text-xs font-medium text-gray-500">
                                                                <span>{course.progress === 100 ? 'Hoàn thành' : `${course.progress}%`}</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-green-500' : 'bg-teal-500'
                                                                        }`}
                                                                    style={{ width: `${course.progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>

                        {/* Badges / Gamification Footer (Moved down and simplified) */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">Thành tích của bạn</h3>
                                    <p className="text-xs text-gray-500">Tiếp tục học để mở khóa huy hiệu</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 md:justify-end no-scrollbar">
                                {levels.map((lvl) => {
                                    // A level is unlocked if it's Level 1, OR if the immediately preceding level has courses AND all of them are 100% complete.
                                    const prevLevelCourses = courses.filter(c => c.level === lvl.id - 1);
                                    const isUnlocked = lvl.id === 1 || (prevLevelCourses.length > 0 && prevLevelCourses.every(c => c.progress === 100));
                                    return (
                                        <div
                                            key={lvl.id}
                                            className={`flex items-center gap-2 min-w-max px-3 py-1.5 rounded-full border transition-all ${isUnlocked
                                                ? `${lvl.bg} border-transparent`
                                                : 'bg-gray-50 border-gray-200 opacity-60 grayscale'
                                                }`}
                                            title={lvl.name}
                                        >
                                            <div className={`${isUnlocked ? lvl.color : 'text-gray-400'}`}>
                                                {isUnlocked ? renderIcon(lvl.icon, 'w-4 h-4') : <Lock className="w-3 h-3" />}
                                            </div>
                                            <span className={`text-xs font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                                                Level {lvl.id}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Report Tab
                    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                        <th className="px-6 py-4">Nhân viên</th>
                                        <th className="px-6 py-4">Vai trò</th>
                                        <th className="px-6 py-4 text-center">Tiến độ tổng</th>
                                        <th className="px-6 py-4">Huy hiệu đạt được</th>
                                        <th className="px-6 py-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={emp.avatar}
                                                        alt={emp.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <span className="font-medium text-gray-900">{emp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{emp.role}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3 max-w-[140px] mx-auto">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${emp.overallProgress >= 80 ? 'bg-green-500' :
                                                                emp.overallProgress >= 50 ? 'bg-blue-500' : 'bg-orange-400'
                                                                }`}
                                                            style={{ width: `${emp.overallProgress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600 w-8 text-right">
                                                        {emp.overallProgress}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex -space-x-2">
                                                    {emp.badges.map((badgeId) => {
                                                        const lvl = levels.find(l => l.id === badgeId);
                                                        return (
                                                            <div
                                                                key={badgeId}
                                                                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ${lvl?.bg.replace('bg-', 'bg-').replace('100', '500')
                                                                    }`}
                                                                title={lvl?.name}
                                                            >
                                                                {badgeId}
                                                            </div>
                                                        );
                                                    })}
                                                    {emp.badges.length === 0 && <span className="text-xs text-gray-400 italic">Chưa có</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-teal-600 hover:text-teal-700 text-sm font-medium hover:underline">
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );

    return (
        <>
            {isMobile ? renderMobileView() : renderDesktopView()}

            {/* Video Player Modal (Shared) */}
            {playingCourse && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
                    onClick={() => setPlayingCourse(null)}
                >
                    <div
                        className="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
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
                            <button
                                onClick={() => setPlayingCourse(null)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Video Player */}
                        <div className="relative aspect-video bg-black">
                            {playingCourse.youtubeId ? (
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${playingCourse.youtubeId}?autoplay=1&rel=0`}
                                    title={playingCourse.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    Video không khả dụng
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-900 flex justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                Hãy xem hết video để hoàn thành bài học này nhé!
                            </p>
                            <button
                                onClick={handleCompleteVideo}
                                className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-teal-900/20"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Tôi đã xem xong
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
