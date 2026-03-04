import React, { useState } from 'react';
import { Search, Plus, Trash2, Shield, UserX, User, Edit, ChevronRight } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server';
    status: 'active' | 'inactive';
}

const mockUsers: UserData[] = [
    { id: 'u1', name: 'Nguyễn Văn A', email: 'a.nguyen@maisonvie.com', role: 'admin', status: 'active' },
    { id: 'u2', name: 'Trần Thị B', email: 'b.tran@maisonvie.com', role: 'receptionist', status: 'active' },
    { id: 'u3', name: 'Lê Văn C', email: 'c.le@maisonvie.com', role: 'kitchen', status: 'active' },
    { id: 'u4', name: 'Phạm Thị D', email: 'd.pham@maisonvie.com', role: 'server', status: 'inactive' },
];

// Helper to determine role state based on db value (this mock assumes a simple 1:1 mapping for the UI demo)
const checkRole = (userRole: string, targetRole: string) => {
    // Admin has all roles, manager has some. For this simple UI matching the image, 
    // we'll just check exact match or "admin" covering the "Quản lý" column
    if (targetRole === 'admin') return userRole === 'admin' || userRole === 'manager';
    return userRole === targetRole;
};

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Modal state for Add Employee
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState<Partial<UserData>>({ role: 'receptionist', status: 'active' });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleToggleStatus = (id: string) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    };

    const handleRoleChange = (userId: string, newRole: UserData['role']) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    const handleAddUser = () => {
        if (!newUser.name || !newUser.email) return;

        const generatedUser: UserData = {
            id: `u${Date.now()}`,
            name: newUser.name || '',
            email: newUser.email || '',
            role: (newUser.role as UserData['role']) || 'receptionist',
            status: (newUser.status as UserData['status']) || 'active',
        };

        setUsers([...users, generatedUser]);
        setIsAddModalOpen(false);
        setNewUser({ role: 'receptionist', status: 'active' });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">Danh sách nhân viên & Vai trò ({filteredUsers.length})</h3>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="admin">Quản lý</option>
                        <option value="receptionist">Lễ tân</option>
                        <option value="kitchen">Bếp</option>
                        <option value="server">Phục vụ</option>
                    </select>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm nhân viên
                    </button>
                </div>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-4">Nhân viên</th>
                        <th className="px-6 py-4 text-center">Kích hoạt</th>
                        <th className="px-6 py-4 text-center">Lễ tân</th>
                        <th className="px-6 py-4 text-center">Bếp</th>
                        <th className="px-6 py-4 text-center">Phục vụ</th>
                        <th className="px-6 py-4 text-center">Quản lý</th>
                        <th className="px-6 py-4 text-center"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 relative">
                                        <User className="w-5 h-5" />
                                        {user.status === 'inactive' && (
                                            <div className="absolute -bottom-1.5 -right-1.5 bg-gray-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold border-2 border-white shadow-sm">OFF</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className={`font-semibold text-[15px] ${user.status === 'active' ? 'text-gray-900' : 'text-gray-400'}`}>{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div
                                    onClick={() => handleToggleStatus(user.id)}
                                    className={`w-11 h-6 mx-auto flex items-center rounded-full p-1 cursor-pointer transition-colors ${user.status === 'active' ? 'bg-teal-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${user.status === 'active' ? 'translate-x-5' : ''}`} />
                                </div>
                            </td>

                            {/* Role Checkboxes */}
                            <td className="px-6 py-4 text-center">
                                <input
                                    type="checkbox"
                                    checked={user.role === 'receptionist'}
                                    onChange={() => handleRoleChange(user.id, 'receptionist')}
                                    disabled={user.status === 'inactive'}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <input
                                    type="checkbox"
                                    checked={user.role === 'kitchen'}
                                    onChange={() => handleRoleChange(user.id, 'kitchen')}
                                    disabled={user.status === 'inactive'}
                                    className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <input
                                    type="checkbox"
                                    checked={user.role === 'server'}
                                    onChange={() => handleRoleChange(user.id, 'server')}
                                    disabled={user.status === 'inactive'}
                                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <input
                                    type="checkbox"
                                    checked={user.role === 'admin' || user.role === 'manager'}
                                    onChange={() => handleRoleChange(user.id, 'manager')}
                                    disabled={user.status === 'inactive'}
                                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                />
                            </td>

                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => setUsers(users.filter(u => u.id !== user.id))}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                    title="Xóa tài khoản"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Add Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-lg">Thêm nhân sự mới</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <UserX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    value={newUser.name || ''}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Nhập họ tên đầy đủ"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email || ''}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="abc@maisonvie.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò hệ thống</label>
                                <select
                                    value={newUser.role || 'receptionist'}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="admin">Quản lý cấp cao</option>
                                    <option value="manager">Quản lý khu vực</option>
                                    <option value="receptionist">Lễ tân</option>
                                    <option value="kitchen">Bếp</option>
                                    <option value="server">Phục vụ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    value={newUser.status || 'active'}
                                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="active">Đang kích hoạt</option>
                                    <option value="inactive">Đang đình chỉ</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50"
                                disabled={!newUser.name || !newUser.email}
                            >
                                Thêm nhân sự
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
