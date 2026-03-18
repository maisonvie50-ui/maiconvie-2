import React, { useState, useEffect } from 'react';
import {
    Save, User, Clock, Check, Shield, PlaySquare, Youtube, Plus, Trash2, Edit, Link,
    Image as ImageIcon, ChevronRight, X, Search, Filter, Activity, Settings as SettingsIcon,
    AlertTriangle, Users, LayoutTemplate, Copy, ArrowUp, BookOpen, Star
} from 'lucide-react';

import { settingsService, Employee, ActivityLog, Station, AppSettings } from '../../services/settingsService';
import { trainingService, TrainingModule, LevelConfig, ChecklistItem } from '../../services/trainingService';
import { tableService } from '../../services/tableService';
import { Table } from '../../types';

interface Area {
    id: string;
    name: string;
    capacity: number;
}

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'permissions' | 'hours' | 'training' | 'operations' | 'assignments'>('permissions');
    const [isMobile, setIsMobile] = useState(false);

    // Config state
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [managedCourses, setManagedCourses] = useState<TrainingModule[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    // Setting fields
    const [appSettings, setAppSettings] = useState<any>({});
    const [defaultDuration, setDefaultDuration] = useState(120);
    const [strictMode, setStrictMode] = useState(false);
    const [lunchStart, setLunchStart] = useState(11);
    const [lunchEnd, setLunchEnd] = useState(14);
    const [dinnerStart, setDinnerStart] = useState(17);
    const [dinnerEnd, setDinnerEnd] = useState(22);
    const [areas, setAreas] = useState<Area[]>([
        { id: '1', name: 'Sảnh Tầng 1', capacity: 80 },
        { id: '2', name: 'Sảnh Tầng 2', capacity: 50 },
        { id: '3', name: 'Phòng VIP', capacity: 20 },
    ]);

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'reception' });
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'reception' | 'kitchen' | 'server'>('all');
    const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);
    const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editRole, setEditRole] = useState('server');
    const [isSaving, setIsSaving] = useState(false);

    const [newStationName, setNewStationName] = useState('');
    const [selectedTablesForStation, setSelectedTablesForStation] = useState<string[]>([]);
    const [isAddStationModalOpen, setIsAddStationModalOpen] = useState(false);
    const [editingStationId, setEditingStationId] = useState<string | null>(null);
    const [isEditStationTablesModalOpen, setIsEditStationTablesModalOpen] = useState(false);
    const [allTables, setAllTables] = useState<Table[]>([]);

    const [trainingUrl, setTrainingUrl] = useState('');
    const [trainingTitle, setTrainingTitle] = useState('');
    const [trainingLevel, setTrainingLevel] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [editingCourse, setEditingCourse] = useState<TrainingModule | null>(null);
    const [editCourseTitle, setEditCourseTitle] = useState('');
    const [editCourseLevel, setEditCourseLevel] = useState(1);
    const [editCourseUrl, setEditCourseUrl] = useState('');
    const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);

    // Training Level System state
    const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [newChecklistText, setNewChecklistText] = useState('');
    const [newChecklistLevel, setNewChecklistLevel] = useState(2);
    const [promotionEmployeeId, setPromotionEmployeeId] = useState('');
    const [promotionLevel, setPromotionLevel] = useState(2);
    const [activeTrainingTab, setActiveTrainingTab] = useState<'courses' | 'levels' | 'advanced'>('courses');

    // Link generator state
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const link = window.location.origin + '/dat-ban-online' + (selectedSource ? `?source=${selectedSource}` : '');
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);


        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const loadData = async () => {
        const [empData, stData, trData, cfgData, logData, tblData, lvlConfigs, clItems] = await Promise.all([
            settingsService.getEmployees(),
            settingsService.getStations(),
            trainingService.getModulesForAdmin(),
            settingsService.getAppSettings(),
            settingsService.getActivityLogs(),
            tableService.getTables(),
            trainingService.getLevelConfig(),
            trainingService.getChecklist(),
        ]);

        setEmployees(empData);
        setStations(stData);
        setManagedCourses(trData);
        setActivityLogs(logData);
        setAllTables(tblData);
        setLevelConfigs(lvlConfigs);
        setChecklistItems(clItems);

        if (cfgData) {
            setAppSettings(cfgData);
            if (cfgData.defaultDuration) setDefaultDuration(cfgData.defaultDuration);
            if (cfgData.strictMode !== undefined) setStrictMode(cfgData.strictMode);
            if (cfgData.lunchStart) setLunchStart(cfgData.lunchStart);
            if (cfgData.lunchEnd) setLunchEnd(cfgData.lunchEnd);
            if (cfgData.dinnerStart) setDinnerStart(cfgData.dinnerStart);
            if (cfgData.dinnerEnd) setDinnerEnd(cfgData.dinnerEnd);
            if (cfgData.areas) setAreas(cfgData.areas);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const saveSettings = async () => {
        await settingsService.updateAppSetting('defaultDuration', defaultDuration);
        await settingsService.updateAppSetting('strictMode', strictMode);
        await settingsService.updateAppSetting('lunchStart', lunchStart);
        await settingsService.updateAppSetting('lunchEnd', lunchEnd);
        await settingsService.updateAppSetting('dinnerStart', dinnerStart);
        await settingsService.updateAppSetting('dinnerEnd', dinnerEnd);
        await settingsService.updateAppSetting('areas', areas);
        alert('Đã lưu cấu hình thành công!');
    };

    const handleEditStationTables = (stationId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (station) {
            setEditingStationId(stationId);
            setSelectedTablesForStation(station.tables || []);
            setIsEditStationTablesModalOpen(true);
        }
    };

    const handleSaveStationTables = async () => {
        if (editingStationId) {
            await settingsService.updateStation(editingStationId, { tables: selectedTablesForStation });
            await loadData();
            setIsEditStationTablesModalOpen(false);
            setEditingStationId(null);
            setSelectedTablesForStation([]);
        }
    };

    const handleAddStation = async (name: string, tables: string[]) => {
        await settingsService.addStation({ name, tables, staffIds: [] });
        await loadData();
        setIsAddStationModalOpen(false);
        setNewStationName('');
        setSelectedTablesForStation([]);
    };

    const handleDeleteStation = async (stationId: string) => {
        await settingsService.deleteStation(stationId);
        await loadData();
    };

    const handleAddStaffToStation = async (stationId: string, staffId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (station && !station.staffIds.includes(staffId)) {
            await settingsService.updateStation(stationId, { staffIds: [...station.staffIds, staffId] });
            await loadData();
        }
    };

    const handleRemoveStaffFromStation = async (stationId: string, staffId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (station) {
            await settingsService.updateStation(stationId, { staffIds: station.staffIds.filter(sid => sid !== staffId) });
            await loadData();
        }
    };

    const getYoutubeId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        return match ? match[1] : null;
    };
    const previewId = getYoutubeId(trainingUrl);

    // === TRAINING MODULE HANDLERS ===
    const handleAddCourse = async () => {
        if (!previewId || !trainingTitle) return;
        await trainingService.addModule({ title: trainingTitle, level: trainingLevel, youtubeId: previewId });
        await loadData();
        setTrainingUrl(''); setTrainingTitle(''); setTrainingLevel(1);
    };

    const toggleCourseActive = async (id: string) => {
        const course = managedCourses.find(c => c.id === id);
        if (course) {
            await trainingService.updateModule(id, { is_active: !course.active });
            await loadData();
        }
    };

    const deleteCourse = async (id: string) => {
        if (!confirm('Bạn chắc chắn muốn xóa khóa học này?')) return;
        await trainingService.deleteModule(id);
        await loadData();
    };

    const handleEditCourse = (course: TrainingModule) => {
        setEditingCourse(course);
        setEditCourseTitle(course.title);
        setEditCourseLevel(course.level);
        setEditCourseUrl(course.youtubeId ? `https://youtube.com/watch?v=${course.youtubeId}` : '');
        setIsEditCourseModalOpen(true);
    };

    const handleSaveCourseEdit = async () => {
        if (!editingCourse || !editCourseTitle) return;
        const editYoutubeId = getYoutubeId(editCourseUrl);
        const updates: any = { title: editCourseTitle, level: editCourseLevel };
        if (editYoutubeId && editYoutubeId !== editingCourse.youtubeId) {
            updates.youtube_id = editYoutubeId;
            updates.thumbnail_url = `https://img.youtube.com/vi/${editYoutubeId}/maxresdefault.jpg`;
        }
        await trainingService.updateModule(editingCourse.id, updates);
        await loadData();
        setIsEditCourseModalOpen(false);
        setEditingCourse(null);
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) return;

        try {
            await settingsService.addEmployee({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                roles: {
                    reception: newUser.role === 'reception',
                    kitchen: newUser.role === 'kitchen',
                    server: newUser.role === 'server',
                    manager: newUser.role === 'manager'
                }
            });

            await loadData();
            setIsAddUserModalOpen(false);
            setNewUser({ name: '', email: '', password: '', role: 'reception' });
            alert('Tạo tài khoản thành công!');
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra khi tạo tài khoản');
        }
    };

    const toggleUserStatus = async (id: string) => {
        const emp = employees.find(e => e.id === id);
        if (emp) {
            await settingsService.updateEmployee(id, { active: !emp.active });
            await loadData();
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = emp.name.toLowerCase().includes(query) || emp.email.toLowerCase().includes(query);
        let matchesRole = true;
        if (roleFilter === 'manager') matchesRole = emp.roles.manager;
        if (roleFilter === 'reception') matchesRole = emp.roles.reception;
        if (roleFilter === 'kitchen') matchesRole = emp.roles.kitchen;
        if (roleFilter === 'server') matchesRole = emp.roles.server;
        return matchesSearch && matchesRole;
    });

    const handleViewEmployee = (emp: Employee) => {
        setViewingEmployee(emp);
        setEditMode(false);
        setEditName(emp.name);
        setEditPassword('');
        // Determine primary role
        let role = 'server';
        if (emp.roles.manager) role = 'manager';
        else if (emp.roles.reception) role = 'receptionist';
        else if (emp.roles.kitchen) role = 'kitchen';
        setEditRole(role);
        setUserDetailModalOpen(true);
    };

    const handleSaveEmployeeEdit = async () => {
        if (!viewingEmployee) return;
        setIsSaving(true);
        try {
            const updates: { newPassword?: string; newRole?: string; name?: string } = {};
            if (editPassword.length >= 6) updates.newPassword = editPassword;
            if (editRole) updates.newRole = editRole;
            if (editName && editName !== viewingEmployee.name) updates.name = editName;

            await settingsService.updateEmployeeCredentials(viewingEmployee.id, updates);
            await loadData();
            // Refresh viewingEmployee with updated data
            const refreshed = (await settingsService.getEmployees()).find(e => e.id === viewingEmployee.id);
            if (refreshed) setViewingEmployee(refreshed);
            setEditMode(false);
            setEditPassword('');
            alert('Cập nhật thành công!');
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra khi cập nhật');
        } finally {
            setIsSaving(false);
        }
    };

    const renderTrainingTab = () => (
        <div className="space-y-6">
            {/* Training Sub-navigation */}
            <div className="flex bg-gray-100/50 p-1.5 rounded-xl mb-4 overflow-x-auto hide-scrollbar border border-gray-200/60 snap-x">
                <button onClick={() => setActiveTrainingTab('courses')} className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-center ${activeTrainingTab === 'courses' ? 'bg-white text-teal-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}>
                    <BookOpen className="w-4 h-4" /> Quản lý Khóa học
                </button>
                <button onClick={() => setActiveTrainingTab('levels')} className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-center ${activeTrainingTab === 'levels' ? 'bg-white text-teal-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}>
                    <Star className="w-4 h-4" /> Cấp độ & Đánh giá
                </button>
                <button onClick={() => setActiveTrainingTab('advanced')} className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 snap-center ${activeTrainingTab === 'advanced' ? 'bg-white text-amber-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}>
                    <SettingsIcon className="w-4 h-4" /> Nâng cao
                </button>
            </div>

            {activeTrainingTab === 'courses' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add new course form */}
                    <div className="md:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden h-fit">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Youtube className="w-5 h-5 text-red-500" />Thêm khóa học mới</h3>
                        <div className="space-y-4">
                            <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tên khóa học</label><input type="text" value={trainingTitle} onChange={(e) => setTrainingTitle(e.target.value)} placeholder="VD: Quy trình phục vụ" className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition-colors" /></div>
                            <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Cấp độ</label><select value={trainingLevel} onChange={(e) => setTrainingLevel(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition-colors"><option value={1}>Level 1: Nhập môn</option><option value={2}>Level 2: Cơ bản</option><option value={3}>Level 3: Nâng cao</option><option value={4}>Level 4: Chuyên sâu</option><option value={5}>Level 5: Quản lý</option></select></div>
                            <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Link className="w-3.5 h-3.5" />Link YouTube</label><input type="text" value={trainingUrl} onChange={(e) => setTrainingUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition-colors" /></div>
                            {previewId && (
                                <div className="w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                    <img src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <button onClick={handleAddCourse} disabled={!previewId || !trainingTitle} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"><Plus className="w-5 h-5" />Lưu Khóa Học</button>
                        </div>
                    </div>

                    {/* Course list */}
                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Danh sách khóa học</h3>
                            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">{managedCourses.length} khóa</span>
                        </div>
                        <div className="divide-y divide-gray-50 overflow-y-auto max-h-[600px]">
                            {managedCourses.length === 0 && (
                                <div className="p-8 text-center text-gray-400 mt-10">
                                    <PlaySquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-teal-600" />
                                    <p className="text-sm">Chưa có khóa học nào. Hãy thêm khóa học đầu tiên!</p>
                                </div>
                            )}
                            {managedCourses.map((course) => (
                                <div key={course.id} className={`p-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors ${!course.active ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                    <div className="relative w-24 aspect-video bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm group">
                                        <img src={`https://img.youtube.com/vi/${course.youtubeId}/hqdefault.jpg`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><PlaySquare className="w-5 h-5 text-white opacity-90 shadow-sm" /></div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                                        <div className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{course.title}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Lv {course.level}</span>
                                                <div onClick={() => toggleCourseActive(course.id)} className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shadow-inner ${course.active ? 'bg-teal-500' : 'bg-gray-300'}`}>
                                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out flex items-center justify-center ${course.active ? 'translate-x-4' : ''}`}>
                                                        {course.active && <Check className="w-2.5 h-2.5 text-teal-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleEditCourse(course)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa khóa học"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => deleteCourse(course.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa khóa học"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTrainingTab === 'levels' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {levelConfigs.map(cfg => (
                        <div key={cfg.level} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col group/card hover:shadow-md transition-all">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-500 to-teal-400"></div>

                            <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50/50">
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg mb-1.5">{cfg.name}</h4>
                                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100/50 px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">Level {cfg.level}</span>
                                    </div>

                                    {cfg.level > 1 && (
                                        <label className="flex items-center gap-2 cursor-pointer group bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-teal-300 transition-colors">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-teal-700 tracking-wider transition-colors">Đánh Giá</span>
                                            <div className="relative flex items-center h-5">
                                                <input type="checkbox" checked={cfg.requiresEvaluation} onChange={async (e) => { await trainingService.updateLevelConfig(cfg.level, { requires_evaluation: e.target.checked }); setLevelConfigs(prev => prev.map(c => c.level === cfg.level ? { ...c, requiresEvaluation: e.target.checked } : c)); }} className="peer sr-only" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500 shadow-inner"></div>
                                            </div>
                                        </label>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5 text-teal-500" />Điều kiện Cần: Thời gian</div>
                                    <div className="flex items-baseline gap-2">
                                        <input type="number" value={cfg.minDaysFromPrev} onChange={async (e) => { const val = parseInt(e.target.value) || 0; await trainingService.updateLevelConfig(cfg.level, { min_days_from_prev: val }); setLevelConfigs(prev => prev.map(c => c.level === cfg.level ? { ...c, minDaysFromPrev: val } : c)); }} className="w-14 px-2 py-1 text-lg font-black text-teal-700 bg-teal-50 border border-teal-100 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-center transition-all shadow-inner" />
                                        <span className="text-xs text-gray-500 font-medium">ngày kể từ Level {cfg.level - 1}</span>
                                    </div>
                                </div>
                            </div>

                            {cfg.level > 1 && cfg.requiresEvaluation && (
                                <div className="p-5 flex-1 flex flex-col bg-gray-50/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <h5 className="text-[11px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-500" /> Tiêu chí đánh giá (ĐK Đủ)</h5>
                                        <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 shadow-sm px-2 py-0.5 rounded-md">{checklistItems.filter(c => c.level === cfg.level).length} mục</span>
                                    </div>

                                    <div className="space-y-2 mb-4 flex-1">
                                        {checklistItems.filter(c => c.level === cfg.level).map(item => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-teal-200 hover:shadow transition-all group/chk">
                                                <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0"><span className="text-[10px] font-black text-teal-600">{checklistItems.filter(c => c.level === cfg.level).indexOf(item) + 1}</span></div>
                                                <span className="text-sm font-medium text-gray-700 flex-1 leading-snug">{item.itemText}</span>
                                                <button onClick={async () => { await trainingService.deleteChecklistItem(item.id); await loadData(); }} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all" title="Xóa tiêu chí"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        {checklistItems.filter(c => c.level === cfg.level).length === 0 && (
                                            <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl bg-white">Chưa có tiêu chí nào.<br /><span className="text-xs">Tiêu chí rất cần để quản lý đánh giá!</span></div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-auto">
                                        <input type="text" id={`checklist-input-${cfg.level}`} placeholder="Nhập tiêu chí đánh giá mới..." onKeyDown={async (e) => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { const text = e.currentTarget.value.trim(); e.currentTarget.value = ''; await trainingService.addChecklistItem(cfg.level, text, checklistItems.filter(c => c.level === cfg.level).length + 1); await loadData(); } }} className="flex-1 pl-4 pr-3 py-3 text-sm font-medium border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm hover:shadow transition-all" />
                                        <button onClick={async () => { const input = document.getElementById(`checklist-input-${cfg.level}`) as HTMLInputElement; if (input && input.value.trim()) { const text = input.value.trim(); input.value = ''; await trainingService.addChecklistItem(cfg.level, text, checklistItems.filter(c => c.level === cfg.level).length + 1); await loadData(); } }} className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm flex-shrink-0 flex items-center gap-1"><Plus className="w-4 h-4" />Thêm</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTrainingTab === 'advanced' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto mt-8">
                    <div className="bg-gradient-to-br from-white to-amber-50/30 p-8 rounded-3xl shadow-lg border border-amber-200/60 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 text-amber-500 opacity-5 object-cover rotate-12 scale-150 pointer-events-none"><AlertTriangle className="w-64 h-64" /></div>

                        <div className="relative z-10">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 text-white transform rotate-3">
                                    <ArrowUp className="w-8 h-8" />
                                </div>
                                <h4 className="font-black text-gray-900 text-2xl tracking-tight">Thăng cấp thủ công</h4>
                                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">Ghi đè hệ thống - Cập nhật trực tiếp Level cho nhân viên bỏ qua điều kiện video và ngày chờ.</p>
                            </div>

                            <div className="space-y-5 bg-white/80 backdrop-blur p-6 rounded-2xl border border-amber-100 shadow-sm">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 ml-1">👤 Chọn Nhân viên</label>
                                    <select value={promotionEmployeeId} onChange={(e) => setPromotionEmployeeId(e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-amber-500 shadow-sm transition-shadow">
                                        <option value="" className="font-normal">-- Danh sách nhân sự --</option>
                                        {employees.filter(e => e.active).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 ml-1">⭐ Đích đến (Level mới)</label>
                                    <select value={promotionLevel} onChange={(e) => setPromotionLevel(Number(e.target.value))} className="w-full px-4 py-3.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-amber-500 shadow-sm transition-shadow">
                                        {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>Level {l}</option>)}
                                    </select>
                                </div>
                                <button onClick={async () => { if (!promotionEmployeeId) return; await trainingService.setEmployeeLevel(promotionEmployeeId, promotionLevel); alert('Đã thăng cấp thành công!'); setPromotionEmployeeId(''); }} disabled={!promotionEmployeeId} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black text-sm transition-all shadow-lg hover:shadow-orange-500/25 mt-4 flex items-center justify-center gap-2 uppercase tracking-wide"><Check className="w-5 h-5" /> Thực hiện Thăng cấp</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const editPreviewId = getYoutubeId(editCourseUrl);

    const renderMobileView = () => (
        <div className="h-full bg-gray-50 flex flex-col">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex overflow-x-auto no-scrollbar p-2 gap-2">
                    {(['permissions', 'hours', 'training', 'operations', 'assignments'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                            {tab === 'permissions' ? 'Phân quyền' : tab === 'hours' ? 'Giờ hoạt động' : tab === 'training' ? 'Đào tạo' : tab === 'operations' ? 'Vận hành' : 'Phân công'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {activeTab === 'permissions' && (
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <input type="text" placeholder="Tìm nhân viên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-teal-500">
                                <option value="all">Tất cả</option><option value="manager">Quản lý</option><option value="reception">Lễ tân</option><option value="kitchen">Bếp</option><option value="server">Phục vụ</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-800">Danh sách nhân viên ({filteredEmployees.length})</h3>
                            <button onClick={() => setIsAddUserModalOpen(true)} className="text-teal-600 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> Thêm mới</button>
                        </div>
                        {filteredEmployees.map((emp) => (
                            <div key={emp.id} onClick={() => handleViewEmployee(emp)} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 ${!emp.active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 relative">
                                        <User className="w-5 h-5" />
                                        {!emp.active && <div className="absolute -bottom-1 -right-1 bg-gray-500 text-white text-[8px] px-1 rounded-full border border-white">OFF</div>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{emp.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">TK: {emp.email} | MK: {emp.password || '***'}</div>
                                        <div className="text-xs text-gray-500 flex gap-1 mt-1">
                                            {emp.roles.manager && <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Quản lý</span>}
                                            {emp.roles.reception && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Lễ tân</span>}
                                            {emp.roles.kitchen && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Bếp</span>}
                                            {emp.roles.server && <span className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Phục vụ</span>}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'hours' && (
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span>Ca Trưa</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-500 mb-1 block">Bắt đầu</label><input type="time" value={`${lunchStart.toString().padStart(2, '0')}:00`} onChange={(e) => setLunchStart(parseInt(e.target.value.split(':')[0]))} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-center" /></div>
                                <div><label className="text-xs text-gray-500 mb-1 block">Kết thúc</label><input type="time" value={`${lunchEnd.toString().padStart(2, '0')}:00`} onChange={(e) => setLunchEnd(parseInt(e.target.value.split(':')[0]))} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-center" /></div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span>Ca Tối</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-500 mb-1 block">Bắt đầu</label><input type="time" value={`${dinnerStart.toString().padStart(2, '0')}:00`} onChange={(e) => setDinnerStart(parseInt(e.target.value.split(':')[0]))} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-center" /></div>
                                <div><label className="text-xs text-gray-500 mb-1 block">Kết thúc</label><input type="time" value={`${dinnerEnd.toString().padStart(2, '0')}:00`} onChange={(e) => setDinnerEnd(parseInt(e.target.value.split(':')[0]))} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-center" /></div>
                            </div>
                        </div>
                        <button className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-200">Lưu cấu hình</button>
                    </div>
                )}
                {activeTab === 'training' && renderTrainingTab()}
                {activeTab === 'operations' && (
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-teal-600" />Sức chứa & Khu vực</h3>
                            <div className="space-y-4">
                                {areas.map((area) => (
                                    <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="font-medium text-gray-700">{area.name}</span>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={area.capacity} onChange={(e) => { const val = parseInt(e.target.value) || 0; setAreas(areas.map(a => a.id === area.id ? { ...a, capacity: val } : a)); }} className="w-16 p-2 text-center font-bold border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" />
                                            <span className="text-xs text-gray-500">khách</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg border border-teal-100">
                                    <span className="font-bold text-teal-800">Tổng sức chứa</span>
                                    <span className="text-xl font-bold text-teal-700">{areas.reduce((sum, area) => sum + area.capacity, 0)} <span className="text-sm font-normal">khách</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-teal-600" />Quy tắc vận hành</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian ăn tiêu chuẩn (phút)</label>
                                    <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-400" /><input type="number" value={defaultDuration} onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 0)} className="flex-1 p-3 border border-gray-300 rounded-lg font-bold text-center focus:ring-teal-500 focus:border-teal-500" /></div>
                                    <p className="text-xs text-gray-500 mt-2">* Hệ thống sẽ tự động cộng thời gian này vào giờ đặt bàn để dự tính giờ khách về.</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <label className="font-bold text-gray-800">Kiểm soát chặt chẽ</label>
                                        <div onClick={() => setStrictMode(!strictMode)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${strictMode ? 'bg-teal-500' : 'bg-gray-300'}`}>
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${strictMode ? 'translate-x-6' : ''}`} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">{strictMode ? "Đang BẬT: Hệ thống sẽ CHẶN không cho đặt bàn nếu quá sức chứa." : "Đang TẮT: Cho phép đặt bàn quá sức chứa (chỉ hiện cảnh báo)."}</p>
                                    {strictMode && (<div className="flex items-start gap-2 p-3 bg-orange-50 text-orange-700 text-xs rounded-lg border border-orange-100"><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>Chế độ này giúp tránh Overbooking nhưng có thể làm chậm thao tác của lễ tân khi đông khách.</span></div>)}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Link className="w-5 h-5 text-teal-600" />Tạo Link Đặt Bàn</h3>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">Tạo link gắn mã nguồn để biết khách đến từ đâu.</p>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">1. Chọn Nguồn (Source)</label>
                                    <select title="Chọn nguồn" value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                        <option value="">Tự nhiên (Không có nguồn)</option>
                                        <option value="fb">Facebook (Fanpage)</option>
                                        <option value="zalo">Zalo</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="hotline">Hotline</option>
                                        <option value="web">Website Khác</option>
                                        <option value="ota">OTA / Google Maps</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">2. Copy Link Gửi Khách</label>
                                    <div className="flex gap-2">
                                        <input title="Link đặt bàn" type="text" readOnly value={`${window.location.origin}/dat-ban-online${selectedSource ? `?source=${selectedSource}` : ''}`} className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono focus:outline-none truncate" />
                                        <button onClick={handleCopyLink} className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all whitespace-nowrap ${copied ? 'bg-green-100 text-green-700 border-green-200' : 'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100'}`}>
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Đã Copy' : 'Copy'}
                                        </button>
                                        <button onClick={() => window.open(`/dat-ban-online${selectedSource ? `?source=${selectedSource}` : ''}`, '_blank')} className="px-3 py-2.5 bg-white text-gray-500 border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 hover:text-gray-700 transition-all flex items-center justify-center">
                                            Mở
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-200">Lưu cấu hình</button>
                    </div>
                )}
                {activeTab === 'assignments' && (
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Users className="w-5 h-5 text-teal-600" />Khu vực & Phân công</h3>
                                <button onClick={() => { setNewStationName(''); setSelectedTablesForStation([]); setIsAddStationModalOpen(true); }} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded font-bold border border-teal-100">+ Thêm Station</button>
                            </div>
                            <div className="space-y-4">
                                {stations.map((station) => (
                                    <div key={station.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                            <span className="font-bold text-gray-800">{station.name}</span>
                                            <button onClick={() => handleDeleteStation(station.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1 font-medium uppercase">Bàn phụ trách</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {station.tables.map(t => (<span key={t} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded">{t}</span>))}
                                                    <button onClick={() => handleEditStationTables(station.id)} className="bg-gray-50 border border-dashed border-gray-300 text-gray-400 text-xs px-2 py-1 rounded hover:text-teal-600 hover:border-teal-300 transition-colors">+ Sửa</button>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1 font-medium uppercase">Nhân sự</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {station.staffIds.map(id => { const emp = employees.find(e => e.id === id); return emp ? (<div key={id} className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs border border-teal-100"><User className="w-3 h-3" />{emp.name}<button onClick={() => handleRemoveStaffFromStation(station.id, id)} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button></div>) : null; })}
                                                    <select className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border-none focus:ring-0 cursor-pointer" onChange={(e) => { if (e.target.value) { handleAddStaffToStation(station.id, e.target.value); e.target.value = ''; } }}>
                                                        <option value="">+ Thêm</option>
                                                        {employees.filter(e => !station.staffIds.includes(e.id)).map(e => (<option key={e.id} value={e.id}>{e.name}</option>))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {selectedEmployee && isMobile && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end animate-in fade-in duration-200" onClick={() => setSelectedEmployee(null)}>
                    <div className="w-full bg-white rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Phân quyền: {selectedEmployee.name}</h3>
                            <button onClick={() => setSelectedEmployee(null)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <span className="font-medium text-gray-700">Kích hoạt tài khoản</span>
                                <div onClick={() => toggleUserStatus(selectedEmployee.id)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${selectedEmployee.active ? 'bg-teal-500' : 'bg-gray-300'}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${selectedEmployee.active ? 'translate-x-6' : ''}`} />
                                </div>
                            </label>
                            {['Lễ tân', 'Bếp', 'Phục vụ', 'Quản lý'].map((role, i) => {
                                const key = (['reception', 'kitchen', 'server', 'manager'] as const)[i];
                                return (
                                    <label key={key} className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 ${!selectedEmployee.active ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <span className="font-medium text-gray-700">{role}</span>
                                        <input type="checkbox" defaultChecked={selectedEmployee.roles[key]} className="w-6 h-6 text-teal-600 rounded focus:ring-teal-500" />
                                    </label>
                                );
                            })}
                        </div>
                        <button onClick={() => setSelectedEmployee(null)} className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold text-lg">Xác nhận</button>
                    </div>
                </div>
            )}
        </div>
    );
    const renderDesktopView = () => (
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-start flex-shrink-0">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {([['permissions', 'Shield', 'Phân quyền'], ['hours', 'Clock', 'Giờ hoạt động'], ['training', 'PlaySquare', 'Đào tạo'], ['operations', 'SettingsIcon', 'Vận hành'], ['assignments', 'Users', 'Phân công']] as const).map(([tab, , label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}>
                            {tab === 'permissions' && <Shield className="w-4 h-4" />}
                            {tab === 'hours' && <Clock className="w-4 h-4" />}
                            {tab === 'training' && <PlaySquare className="w-4 h-4" />}
                            {tab === 'operations' && <SettingsIcon className="w-4 h-4" />}
                            {tab === 'assignments' && <Users className="w-4 h-4" />}
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'assignments' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div><h3 className="text-lg font-bold text-gray-800">Phân công khu vực (Station)</h3><p className="text-sm text-gray-500">Tạo các trạm phục vụ và gán nhân viên chịu trách nhiệm.</p></div>
                                <button onClick={() => { setNewStationName(''); setSelectedTablesForStation([]); setIsAddStationModalOpen(true); }} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-teal-700 transition-colors"><Plus className="w-4 h-4" />Tạo Station mới</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stations.map((station) => (
                                    <div key={station.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                            <h4 className="font-bold text-gray-800">{station.name}</h4>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditStationTables(station.id)} className="text-gray-400 hover:text-teal-600"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteStation(station.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col gap-4">
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><LayoutTemplate className="w-3 h-3" />Bàn phụ trách</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {station.tables.map(table => (<span key={table} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 shadow-sm">{table}</span>))}
                                                    <button onClick={() => handleEditStationTables(station.id)} className="px-2 py-1 bg-gray-50 border border-dashed border-gray-300 rounded text-xs text-gray-400 hover:text-teal-600 hover:border-teal-300 transition-colors">+ Sửa</button>
                                                </div>
                                            </div>
                                            <div className="h-px bg-gray-100"></div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><User className="w-3 h-3" />Nhân sự phụ trách</div>
                                                <div className="space-y-2">
                                                    {station.staffIds.map(id => { const emp = employees.find(e => e.id === id); if (!emp) return null; return (<div key={id} className="flex items-center justify-between p-2 bg-teal-50 rounded-lg border border-teal-100 group"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 text-xs font-bold">{emp.name.charAt(0)}</div><span className="text-sm font-medium text-teal-900">{emp.name}</span></div><button onClick={() => handleRemoveStaffFromStation(station.id, id)} className="text-teal-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button></div>); })}
                                                    <div className="relative group">
                                                        <select className="w-full p-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-teal-400 hover:text-teal-600 cursor-pointer appearance-none focus:ring-0 focus:outline-none transition-colors" onChange={(e) => { if (e.target.value) { handleAddStaffToStation(station.id, e.target.value); e.target.value = ''; } }}>
                                                            <option value="">+ Gán thêm nhân viên</option>
                                                            {employees.filter(e => !station.staffIds.includes(e.id)).map(e => (<option key={e.id} value={e.id}>{e.name}</option>))}
                                                        </select>
                                                        <Plus className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-teal-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => { setNewStationName(''); setSelectedTablesForStation([]); setIsAddStationModalOpen(true); }} className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all group min-h-[300px]">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors"><Plus className="w-6 h-6" /></div>
                                    <span className="font-bold">Tạo Station mới</span>
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'permissions' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Danh sách nhân viên & Vai trò ({filteredEmployees.length})</h3>
                                <div className="flex gap-3">
                                    <div className="relative"><input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 w-64" /><Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" /></div>
                                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-teal-500"><option value="all">Tất cả vai trò</option><option value="manager">Quản lý</option><option value="reception">Lễ tân</option><option value="kitchen">Bếp</option><option value="server">Phục vụ</option></select>
                                    <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" />Thêm nhân viên</button>
                                </div>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead><tr className="border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold bg-gray-50/50"><th className="px-6 py-4">Nhân viên</th><th className="px-6 py-4 text-center w-32">Kích hoạt</th><th className="px-6 py-4 text-center w-32">Lễ tân</th><th className="px-6 py-4 text-center w-32">Bếp</th><th className="px-6 py-4 text-center w-32">Phục vụ</th><th className="px-6 py-4 text-center w-32">Quản lý</th><th className="px-6 py-4 text-center w-20"></th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className={`hover:bg-gray-50 transition-colors ${!emp.active ? 'bg-gray-50/50' : ''}`}>
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => handleViewEmployee(emp)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 relative"><User className="w-5 h-5" />{!emp.active && <div className="absolute -bottom-1 -right-1 bg-gray-500 text-white text-[8px] px-1 rounded-full border border-white">OFF</div>}</div>
                                                    <div><div className={`font-medium ${emp.active ? 'text-gray-900' : 'text-gray-500'}`}>{emp.name}</div><div className="text-xs text-gray-500">{emp.email}</div></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center"><div onClick={() => toggleUserStatus(emp.id)} className={`w-10 h-5 mx-auto flex items-center rounded-full p-1 cursor-pointer transition-colors ${emp.active ? 'bg-teal-500' : 'bg-gray-300'}`}><div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform duration-300 ease-in-out ${emp.active ? 'translate-x-4.5' : ''}`} /></div></td>
                                            <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked={emp.roles.reception} disabled={!emp.active} className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-50" /></td>
                                            <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked={emp.roles.kitchen} disabled={!emp.active} className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-50" /></td>
                                            <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked={emp.roles.server} disabled={!emp.active} className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-50" /></td>
                                            <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked={emp.roles.manager} disabled={!emp.active} className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-50" /></td>
                                            <td className="px-6 py-4 text-center"><button onClick={() => handleViewEmployee(emp)} className="text-gray-400 hover:text-teal-600"><ChevronRight className="w-5 h-5" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 'hours' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                            <h3 className="font-bold text-gray-800 mb-8 flex items-center gap-2"><Clock className="w-5 h-5 text-teal-600" />Cấu hình khung giờ hoạt động</h3>
                            <div className="space-y-12">
                                {/* Ca Trưa */}
                                <div>
                                    <div className="flex justify-between items-center mb-4"><label className="font-medium text-gray-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span>Ca Trưa</label><span className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg">{lunchStart}:00 - {lunchEnd}:00</span></div>
                                    <div className="grid grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Giờ bắt đầu</label>
                                            <select value={lunchStart} onChange={(e) => { const val = parseInt(e.target.value); if (val < lunchEnd) setLunchStart(val); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white cursor-pointer appearance-none">
                                                {Array.from({ length: 19 }, (_, i) => i + 6).filter(h => h < lunchEnd).map(h => (<option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Giờ kết thúc</label>
                                            <select value={lunchEnd} onChange={(e) => { const val = parseInt(e.target.value); if (val > lunchStart) setLunchEnd(val); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white cursor-pointer appearance-none">
                                                {Array.from({ length: 19 }, (_, i) => i + 6).filter(h => h > lunchStart).map(h => (<option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Visual bar */}
                                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                                        <div className="absolute h-full bg-orange-200 rounded-lg transition-all duration-300" style={{ left: `${((lunchStart - 6) / 18) * 100}%`, width: `${((lunchEnd - lunchStart) / 18) * 100}%` }}></div>
                                        <div className="absolute inset-0 flex justify-between items-center px-3 text-[10px] text-gray-400 pointer-events-none"><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
                                    </div>
                                </div>
                                {/* Ca Tối */}
                                <div>
                                    <div className="flex justify-between items-center mb-4"><label className="font-medium text-gray-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span>Ca Tối</label><span className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg">{dinnerStart}:00 - {dinnerEnd}:00</span></div>
                                    <div className="grid grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Giờ bắt đầu</label>
                                            <select value={dinnerStart} onChange={(e) => { const val = parseInt(e.target.value); if (val < dinnerEnd) setDinnerStart(val); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white cursor-pointer appearance-none">
                                                {Array.from({ length: 19 }, (_, i) => i + 6).filter(h => h < dinnerEnd).map(h => (<option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Giờ kết thúc</label>
                                            <select value={dinnerEnd} onChange={(e) => { const val = parseInt(e.target.value); if (val > dinnerStart) setDinnerEnd(val); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white cursor-pointer appearance-none">
                                                {Array.from({ length: 19 }, (_, i) => i + 6).filter(h => h > dinnerStart).map(h => (<option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Visual bar */}
                                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                                        <div className="absolute h-full bg-indigo-200 rounded-lg transition-all duration-300" style={{ left: `${((dinnerStart - 6) / 18) * 100}%`, width: `${((dinnerEnd - dinnerStart) / 18) * 100}%` }}></div>
                                        <div className="absolute inset-0 flex justify-between items-center px-3 text-[10px] text-gray-400 pointer-events-none"><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end"><button onClick={saveSettings} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors"><Check className="w-4 h-4" />Lưu cấu hình thời gian</button></div>
                        </div>
                    )}
                    {activeTab === 'training' && renderTrainingTab()}
                    {activeTab === 'operations' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-teal-600" />Cấu hình Sức chứa & Khu vực</h3>
                                <div className="space-y-4">
                                    {areas.map((area) => (<div key={area.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-200 transition-colors"><div className="col-span-8 font-medium text-gray-700">{area.name}</div><div className="col-span-4 flex justify-center"><input type="number" value={area.capacity} onChange={(e) => { const val = parseInt(e.target.value) || 0; setAreas(areas.map(a => a.id === area.id ? { ...a, capacity: val } : a)); }} className="w-20 p-2 text-center font-bold border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" /></div></div>))}
                                    <div className="grid grid-cols-12 gap-4 items-center p-4 bg-teal-50 rounded-lg border border-teal-100 mt-6"><div className="col-span-8 font-bold text-teal-800 text-lg">Tổng sức chứa toàn nhà hàng</div><div className="col-span-4 text-center text-2xl font-bold text-teal-700">{areas.reduce((sum, area) => sum + area.capacity, 0)}</div></div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 h-fit">
                                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-teal-600" />Quy tắc vận hành</h3>
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Thời gian ăn tiêu chuẩn (Standard Duration)</label>
                                        <div className="flex items-center gap-4"><div className="relative flex-1 max-w-[200px]"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="number" value={defaultDuration} onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 0)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-bold text-lg focus:ring-teal-500 focus:border-teal-500" /></div><span className="text-gray-600 font-medium">phút / lượt khách</span></div>
                                        <p className="text-sm text-gray-500 mt-2">* Hệ thống sẽ tự động cộng thời gian này vào giờ đặt bàn để dự tính giờ khách về (ETD).</p>
                                    </div>
                                    <div className="border-t border-gray-100 pt-6">
                                        <div className="flex items-start justify-between"><div><h4 className="font-bold text-gray-800 mb-1">Chế độ Kiểm soát chặt chẽ (Strict Mode)</h4><p className="text-sm text-gray-500 max-w-sm">Khi bật, hệ thống sẽ <strong>CHẶN</strong> không cho phép đặt bàn nếu số lượng khách vượt quá sức chứa.</p></div><div onClick={() => setStrictMode(!strictMode)} className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${strictMode ? 'bg-teal-500' : 'bg-gray-300'}`}><div className={`bg-white w-5 h-5 rounded-full shadow-sm transform duration-300 ease-in-out ${strictMode ? 'translate-x-7' : ''}`} /></div></div>
                                        {strictMode && (<div className="mt-4 flex items-start gap-3 p-4 bg-orange-50 text-orange-800 text-sm rounded-lg border border-orange-100"><AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /><div><strong>Lưu ý:</strong> Chế độ này yêu cầu tài khoản có quyền <strong>Quản lý (Manager)</strong> xác nhận nếu muốn ghi đè (Force Booking) khi nhà hàng đã đầy.</div></div>)}
                                    </div>
                                    <div className="pt-6 mt-4 border-t border-gray-100">
                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-800 mb-1">Tạo Link Đặt Bàn (Tracking Nguồn)</label>
                                                <p className="text-xs text-gray-500">Gửi link này cho khách hàng để tự động phân loại đơn đặt bàn theo kênh.</p>
                                            </div>

                                            <div className="space-y-3">
                                                <select title="Chọn nguồn" value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
                                                    <option value="">Tự nhiên (Không web)</option>
                                                    <option value="fb">Facebook (Fanpage)</option>
                                                    <option value="zalo">Zalo</option>
                                                    <option value="whatsapp">WhatsApp</option>
                                                    <option value="hotline">Hotline</option>
                                                    <option value="web">Website Khác</option>
                                                    <option value="ota">OTA / Google Maps</option>
                                                </select>

                                                <div className="flex items-center relative">
                                                    <input title="Link đặt bàn" type="text" readOnly value={`${window.location.origin}/dat-ban-online${selectedSource ? `?source=${selectedSource}` : ''}`} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono focus:outline-none pr-[110px]" />
                                                    <div className="absolute right-1 flex items-center gap-1">
                                                        <button onClick={handleCopyLink} className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>
                                                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                            {copied ? 'Đã copy' : 'Copy'}
                                                        </button>
                                                        <button onClick={() => window.open(`/dat-ban-online${selectedSource ? `?source=${selectedSource}` : ''}`, '_blank')} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all" title="Mở trong thẻ mới">
                                                            <Link className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-5 border-t border-gray-100">
                                            <button onClick={saveSettings} className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold text-base shadow-md shadow-teal-100 transition-all"><Save className="w-5 h-5" />Lưu cấu hình quy tắc</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    return (
        <>
            {isMobile ? renderMobileView() : renderDesktopView()}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setIsAddUserModalOpen(false)}>
                    <div className="w-full max-w-md bg-white rounded-2xl p-6 m-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Thêm nhân viên mới</h3>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label><input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Nhập tên nhân viên" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đăng nhập</label><input type="text" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="VD: letan1 (Hệ thống sẽ dùng letan1@maison-vie.local)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label><input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò mặc định</label><select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"><option value="reception">Lễ tân</option><option value="kitchen">Bếp</option><option value="server">Phục vụ</option><option value="manager">Quản lý</option></select></div>
                            <div className="pt-2"><button onClick={handleAddUser} disabled={!newUser.name || !newUser.email || !newUser.password || newUser.password.length < 6} className="w-full bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all">Tạo tài khoản</button></div>
                        </div>
                    </div>
                </div>
            )}
            {userDetailModalOpen && viewingEmployee && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setUserDetailModalOpen(false)}>
                    <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">Chi tiết nhân viên</h3>
                            <button onClick={() => setUserDetailModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {!editMode ? (
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-1/3 space-y-4">
                                        <div className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4 relative">
                                                <User className="w-12 h-12" />
                                                <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${viewingEmployee.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-900 text-center mb-1">{viewingEmployee.name}</h4>
                                            <p className="text-sm text-gray-500 text-center mb-4 break-all">{viewingEmployee.email}</p>

                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {viewingEmployee.roles.manager && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">Quản lý</span>}
                                                {viewingEmployee.roles.reception && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Lễ tân</span>}
                                                {viewingEmployee.roles.kitchen && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">Bếp</span>}
                                                {viewingEmployee.roles.server && <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-bold">Phục vụ</span>}
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <h5 className="font-bold text-gray-800 text-sm mb-3">Thông tin đăng nhập</h5>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between"><span className="text-gray-500">Tên đăng nhập</span><span className="font-medium text-gray-900 break-all">{viewingEmployee.email}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Mật khẩu</span><span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{viewingEmployee.password || '***'}</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <h5 className="font-bold text-gray-800 text-sm mb-3">Thông tin trạng thái</h5>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between"><span className="text-gray-500">Trạng thái</span><span className={`font-bold ${viewingEmployee.active ? 'text-green-600' : 'text-gray-500'}`}>{viewingEmployee.active ? 'Đang hoạt động' : 'Vô hiệu hóa'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Hoạt động cuối</span><span className="font-medium text-gray-900">{viewingEmployee.lastActive || 'Chưa có'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Ngày tham gia</span><span className="font-medium text-gray-900">20/02/2026</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-2/3">
                                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-teal-600" />Lịch sử hoạt động</h4>
                                        <div className="space-y-4">
                                            {activityLogs.map((log) => (
                                                <div key={log.id} className="flex gap-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex-shrink-0 w-12 text-xs font-bold text-gray-400 text-center pt-1">{log.timestamp.split(' ')[0]}<div className="font-normal text-[10px]">{log.timestamp.split(' ')[1]}</div></div>
                                                    <div className="flex-1 border-l-2 border-gray-100 pl-4 relative"><div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-teal-50 border-2 border-teal-500"></div><h5 className="font-bold text-gray-800 text-sm">{log.action}</h5><p className="text-xs text-gray-500 mt-0.5">{log.details}</p></div>
                                                </div>
                                            ))}
                                            <div className="text-center pt-2"><button className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline">Xem thêm lịch sử cũ hơn</button></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto space-y-5">
                                    <div className="text-center mb-2">
                                        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-2"><Edit className="w-8 h-8 text-teal-600" /></div>
                                        <h4 className="font-bold text-lg text-gray-900">Chỉnh sửa thông tin đăng nhập</h4>
                                        <p className="text-sm text-gray-500">Tên đăng nhập: <strong>{viewingEmployee.email}</strong></p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới <span className="text-gray-400 font-normal">(để trống nếu không đổi)</span></label>
                                        <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò</label>
                                        <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                                            <option value="receptionist">Lễ tân</option>
                                            <option value="kitchen">Bếp</option>
                                            <option value="server">Phục vụ</option>
                                            <option value="manager">Quản lý</option>
                                        </select>
                                    </div>
                                    {editPassword.length > 0 && editPassword.length < 6 && (
                                        <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Mật khẩu phải có tối thiểu 6 ký tự</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            {!editMode ? (
                                <>
                                    <button onClick={() => setUserDetailModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Đóng</button>
                                    <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-sm">Chỉnh sửa thông tin</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Hủy</button>
                                    <button onClick={handleSaveEmployeeEdit} disabled={isSaving || (editPassword.length > 0 && editPassword.length < 6)} className="px-5 py-2 bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold hover:bg-teal-700 shadow-sm">{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isAddStationModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setIsAddStationModalOpen(false)}>
                    <div className="w-full max-w-md bg-white rounded-2xl p-6 m-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-900">Tạo Station Mới</h3><button onClick={() => setIsAddStationModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5" /></button></div>
                        <div className="space-y-5">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Tên Station / Khu vực</label><input type="text" value={newStationName} onChange={(e) => setNewStationName(e.target.value)} placeholder="VD: Station Cửa Sổ, Station VIP..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Chọn bàn phụ trách</label>
                                <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto space-y-3">
                                    {[1, 2, 3].map(floor => {
                                        const floorTables = allTables.filter(t => t.floor === floor);
                                        if (floorTables.length === 0) return null;
                                        const floorLabels: Record<number, string> = { 1: 'Tầng 1 (Sảnh)', 2: 'Tầng 2 (VIP)', 3: 'Tầng 3 (Sự kiện)' };
                                        return (
                                            <div key={floor}>
                                                <div className="text-xs font-bold text-gray-400 uppercase mb-1.5">{floorLabels[floor] || `Tầng ${floor}`}</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {floorTables.map(table => (
                                                        <label key={table.name} className={`flex items-center justify-center px-2 py-2 rounded border cursor-pointer text-sm transition-all ${selectedTablesForStation.includes(table.name) ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                            <input type="checkbox" className="hidden" checked={selectedTablesForStation.includes(table.name)} onChange={(e) => { if (e.target.checked) { setSelectedTablesForStation([...selectedTablesForStation, table.name]); } else { setSelectedTablesForStation(selectedTablesForStation.filter(t => t !== table.name)); } }} />{table.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="pt-2"><button onClick={() => { if (newStationName) { handleAddStation(newStationName, selectedTablesForStation); } }} disabled={!newStationName} className="w-full bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all">Tạo Station</button></div>
                        </div>
                    </div>
                </div>
            )}
            {isEditStationTablesModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setIsEditStationTablesModalOpen(false)}>
                    <div className="w-full max-w-md bg-white rounded-2xl p-6 m-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-900">Cập nhật bàn cho {stations.find(s => s.id === editingStationId)?.name}</h3><button onClick={() => setIsEditStationTablesModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5" /></button></div>
                        <div className="space-y-5">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Chọn bàn phụ trách</label>
                                <div className="border border-gray-200 rounded-lg p-3 max-h-72 overflow-y-auto space-y-3">
                                    {[1, 2, 3].map(floor => {
                                        const floorTables = allTables.filter(t => t.floor === floor);
                                        if (floorTables.length === 0) return null;
                                        const floorLabels: Record<number, string> = { 1: 'Tầng 1 (Sảnh)', 2: 'Tầng 2 (VIP)', 3: 'Tầng 3 (Sự kiện)' };

                                        return (
                                            <div key={floor}>
                                                <div className="text-xs font-bold text-gray-400 uppercase mb-1.5">{floorLabels[floor] || `Tầng ${floor}`}</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {floorTables.map(table => (
                                                        <label key={table.name} className={`flex items-center justify-center px-2 py-2 rounded border cursor-pointer text-sm transition-all ${selectedTablesForStation.includes(table.name) ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                            <input type="checkbox" className="hidden" checked={selectedTablesForStation.includes(table.name)} onChange={(e) => { if (e.target.checked) { setSelectedTablesForStation([...selectedTablesForStation, table.name]); } else { setSelectedTablesForStation(selectedTablesForStation.filter(t => t !== table.name)); } }} />{table.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="pt-2"><button onClick={handleSaveStationTables} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all">Lưu thay đổi</button></div>
                        </div>
                    </div>
                </div>
            )}
            {isEditCourseModalOpen && editingCourse && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setIsEditCourseModalOpen(false)}>
                    <div className="w-full max-w-md bg-white rounded-2xl p-6 m-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa khóa học</h3>
                            <button onClick={() => setIsEditCourseModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên khóa học</label>
                                <input type="text" value={editCourseTitle} onChange={(e) => setEditCourseTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cấp độ (Level)</label>
                                <select value={editCourseLevel} onChange={(e) => setEditCourseLevel(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                                    <option value={1}>Level 1: Nhập môn</option>
                                    <option value={2}>Level 2: Cơ bản</option>
                                    <option value={3}>Level 3: Nâng cao</option>
                                    <option value={4}>Level 4: Chuyên sâu</option>
                                    <option value={5}>Level 5: Quản lý</option>
                                </select>
                            </div>
                            {editingCourse.youtubeId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Link className="w-3.5 h-3.5" /> Link YouTube</label>
                                    <input type="text" value={editCourseUrl} onChange={(e) => setEditCourseUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm" />
                                    {(() => {
                                        const id = getYoutubeId(editCourseUrl); return id ? (
                                            <div className="mt-2 w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsEditCourseModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Hủy</button>
                                <button onClick={handleSaveCourseEdit} disabled={!editCourseTitle} className="flex-1 bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all">Lưu thay đổi</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
