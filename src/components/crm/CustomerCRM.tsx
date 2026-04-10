import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { customerService, Customer } from '../../services/customerService';
import {
  Search,
  MoreHorizontal,
  Phone,
  Calendar,
  Star,
  AlertTriangle,
  X,
  History,
  Tag,
  ChevronRight,
  PhoneCall,
  Upload,
  UserPlus,
  Users,
  FileText,
  Edit as Pen,
  Save,
  CircleAlert
} from 'lucide-react';

export default function CustomerCRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<{ name: string; phone: string; email: string; group: string }[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; skipped: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', group: 'New' });
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const navigate = useNavigate();

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
  );

  const handleSelectCustomer = (c: Customer | null) => {
    setSelectedCustomer(c);
    if (c) {
      setEditForm({ name: c.name, phone: c.phone, email: c.email, group: c.group });
    }
    setIsEditing(false);
    setIsAddingTag(false);
    setNewTag('');
  };

  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;
    setIsSaving(true);
    try {
      await customerService.updateCustomer(selectedCustomer.id, editForm as any);
      const updated = customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, ...editForm } : c
      );
      setCustomers(updated);
      setSelectedCustomer({ ...selectedCustomer, ...editForm } as Customer);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !selectedCustomer) return;
    const tag = newTag.trim();
    if (selectedCustomer.tags.includes(tag)) {
      setNewTag('');
      setIsAddingTag(false);
      return;
    }
    const newTags = [...selectedCustomer.tags, tag];
    try {
      await customerService.updateCustomer(selectedCustomer.id, { tags: newTags });
      const updated = customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, tags: newTags } : c
      );
      setCustomers(updated);
      setSelectedCustomer({ ...selectedCustomer, tags: newTags });
      setNewTag('');
      setIsAddingTag(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedCustomer) return;
    const newTags = selectedCustomer.tags.filter((t) => t !== tagToRemove);
    try {
      await customerService.updateCustomer(selectedCustomer.id, { tags: newTags });
      const updated = customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, tags: newTags } : c
      );
      setCustomers(updated);
      setSelectedCustomer({ ...selectedCustomer, tags: newTags });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBooking = () => {
    if (!selectedCustomer) return;
    navigate(
      `/dat-ban?action=new&name=${encodeURIComponent(selectedCustomer.name)}&phone=${encodeURIComponent(selectedCustomer.phone)}`
    );
  };

  // CSV import helpers
  const handleDownloadTemplate = () => {
    const headers = ['Ten khach hang', 'So dien thoai', 'Email', 'Nhom khach'];
    const hints = ['(Bat buoc) Nhap ten', '(Bat buoc) Nhap SDT', '(Tuy chon) Nhap Email', '(Tuy chon) VIP/Regular/New'];
    const example1 = ['Nguyen Van A', '0901234567', 'nguyenvana@email.com', 'VIP'];
    const example2 = ['Tran Thi B', '0987654321', '', 'New'];
    const csv =
      '\uFEFF' +
      [headers.join(','), hints.join(','), example1.join(','), example2.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'maison_vie_customers_template.csv';
    a.click();
  };

  const parseCsv = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const rows: { name: string; phone: string; email: string; group: string }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 2) continue;
      const name = cols[0];
      let phone = cols[1];
      const email = cols[2] || '';
      const group = cols[3] || 'New';
      phone = phone.replace(/[^0-9]/g, '');
      if (!phone || phone.length < 8) continue;
      if (name.includes('Bat buoc') || name.includes('Bắt buộc')) continue;
      rows.push({ name, phone, email, group });
    }
    setPreviewRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (previewRows.length === 0) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const result = await customerService.importCustomers(previewRows);
      setImportResult(result);
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const data = await customerService.getCustomers();
        if (mounted) setCustomers(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
    const unsubscribe = customerService.subscribeToCustomers(() => {
      loadData();
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const isMobile = useIsMobile();

  const getGroupBadge = (group: string) => {
    switch (group) {
      case 'VIP': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Regular': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'New': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-gray-500 bg-gray-100';
      case 'no-show': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600';
    }
  };

  // ==================== MOBILE VIEW ====================
  const renderMobileView = () => (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex flex-col gap-3">
        {/* Stats bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1.5 focus:outline-none shrink-0 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-xs font-bold text-teal-900">
              Tổng: <span className="font-black text-teal-700">{customers.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100">
            <Star className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-bold text-purple-900">
              VIP: <span className="font-black text-purple-700">{customers.filter((c) => c.group === 'VIP').length}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">
              Mới: <span className="font-black text-blue-700">{customers.filter((c) => c.group === 'New').length}</span>
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-bold text-red-900">
              Cảnh báo No-show: <span className="font-black text-red-700">{customers.filter((c) => c.noShowRate > 0).length}</span>
            </span>
          </div>
        </div>
        {/* Search + Import */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm khách hàng..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setImportModalOpen(true)}
              className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100 active:bg-teal-100"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => handleSelectCustomer(customer)}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white shadow-sm flex-shrink-0 ${customer.group === 'VIP' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}
            >
              {customer.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-gray-900 truncate">{customer.name}</h3>
                {customer.group === 'VIP' && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="w-3 h-3" />
                <span className="font-mono">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getGroupBadge(customer.group)}`}>
                  {customer.group}
                </span>
                {customer.noShowRate > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
                    No-show: {customer.noShowRate}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <button className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ==================== DESKTOP VIEW ====================
  const renderDesktopView = () => (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar with stats */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100/50 shadow-sm min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-teal-600 border border-teal-50">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-teal-800/70 uppercase tracking-wider mb-0.5">Tổng khách</span>
                <span className="text-xl font-black text-teal-700 leading-none">{customers.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border border-purple-100/50 shadow-sm min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm border border-purple-50">
                <Star className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-purple-800/70 uppercase tracking-wider mb-0.5">Khách VIP</span>
                <span className="text-xl font-black text-purple-700 leading-none">{customers.filter((c) => c.group === 'VIP').length}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-100/50 shadow-sm min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-blue-800/70 uppercase tracking-wider mb-0.5">Khách mới</span>
                <span className="text-xl font-black text-blue-700 leading-none">{customers.filter((c) => c.group === 'New').length}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100/50 shadow-sm min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-800/70 uppercase tracking-wider mb-0.5">Thường xuyên</span>
                <span className="text-xl font-black text-indigo-700 leading-none">{customers.filter((c) => c.group === 'Regular').length}</span>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-200 mx-1" />
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border border-red-100/50 shadow-sm min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm border border-red-50">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-red-800/70 uppercase tracking-wider mb-0.5">Cảnh báo No-show</span>
                <span className="text-xl font-black text-red-600 leading-none">{customers.filter((c) => c.noShowRate > 0).length}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên, SĐT..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-64"
              />
            </div>
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg border border-teal-100 font-medium text-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="w-4 h-4" />
              Nhập dữ liệu
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4">Nhóm khách</th>
                  <th className="px-6 py-4">Lần cuối đến</th>
                  <th className="px-6 py-4 text-center">No-show</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className={`cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'bg-teal-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{customer.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getGroupBadge(customer.group)}`}>
                        {customer.group}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.lastVisit}</td>
                    <td className="px-6 py-4 text-center">
                      {customer.noShowRate > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${customer.noShowRate >= 50 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}
                        >
                          {customer.noShowRate}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedCustomer && (
        <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl z-10 transition-transform duration-300">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Hồ sơ khách hàng</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-1.5 rounded-full transition-colors ${isEditing ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'}`}
                title={isEditing ? 'Hủy sửa' : 'Sửa hồ sơ'}
              >
                <Pen className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSelectCustomer(null)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {isEditing ? (
              /* Edit Form */
              <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-teal-50 mx-auto flex items-center justify-center text-xl font-bold text-teal-600 border border-teal-100">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="text-sm font-medium text-teal-800 mt-2">Chỉnh sửa thông tin</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tên khách hàng</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nhóm khách</label>
                  <select
                    value={editForm.group}
                    onChange={(e) => setEditForm({ ...editForm, group: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Regular">Thường xuyên (Regular)</option>
                    <option value="New">Mới (New)</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2.5 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {' '}Lưu cập nhật
                </button>
              </div>
            ) : (
              /* Profile View */
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-gray-400 border-4 border-white shadow-sm">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedCustomer.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getGroupBadge(selectedCustomer.group)}`}>
                    {selectedCustomer.group}
                  </span>
                  {selectedCustomer.group === 'VIP' && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                </div>
                <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> SĐT
                    </div>
                    <div className="text-sm font-medium text-gray-900">{selectedCustomer.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Lần cuối
                    </div>
                    <div className="text-sm font-medium text-gray-900">{selectedCustomer.lastVisit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Chi tiêu
                    </div>
                    <div className="text-sm font-medium text-gray-900">{selectedCustomer.totalSpent}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <History className="w-3 h-3" /> Số lần đến
                    </div>
                    <div className="text-sm font-medium text-gray-900">{selectedCustomer.visitCount} lần</div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            {selectedCustomer.noShowRate >= 20 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-700 mb-1">Cảnh báo No-show cao</h4>
                  <p className="text-xs text-red-600 leading-relaxed">
                    Khách hàng này có tỷ lệ không đến (No-show) là <span className="font-bold">{selectedCustomer.noShowRate}%</span>.
                    Vui lòng xác nhận kỹ trước khi giữ bàn.
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                Sở thích & Ghi chú
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCustomer.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-100 flex items-center gap-1.5 group"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-red-600 transition-all focus:opacity-100 -mr-1"
                      title="Xóa tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {isAddingTag ? (
                  <form onSubmit={handleAddTag} className="flex items-center">
                    <input
                      autoFocus
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onBlur={() => { if (!newTag.trim()) setIsAddingTag(false); }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-32 shadow-sm"
                      placeholder="Nhập tag + Enter"
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 text-xs font-medium rounded-lg hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    + Thêm tag
                  </button>
                )}
              </div>
            </div>

            {/* History */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                Lịch sử đặt bàn
              </h4>
              <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                {selectedCustomer.history.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${item.status === 'completed' ? 'bg-green-500' : item.status === 'no-show' ? 'bg-red-500' : 'bg-gray-400'}`}
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.date}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.pax} Pax • {item.amount}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleCreateBooking}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              Tạo đặt bàn mới
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Mobile Detail Modal */}
      {isMobile && selectedCustomer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex flex-col animate-in slide-in-from-bottom duration-300"
          onClick={() => handleSelectCustomer(null)}
        >
          <div
            className="bg-white h-[90%] mt-auto rounded-t-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 sticky top-0">
              <h3 className="font-bold text-gray-800">Thông tin khách hàng</h3>
              <button
                onClick={() => handleSelectCustomer(null)}
                className="p-2 bg-white rounded-full shadow-sm border border-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-gray-400 border-4 border-white shadow-sm">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedCustomer.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getGroupBadge(selectedCustomer.group)}`}>
                    {selectedCustomer.group}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Số điện thoại</div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      {selectedCustomer.phone}
                      <a
                        href={`tel:${selectedCustomer.phone}`}
                        className="ml-auto w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center"
                      >
                        <PhoneCall className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Tổng chi tiêu</div>
                    <div className="font-bold text-gray-900">{selectedCustomer.totalSpent}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Lịch sử gần đây</h4>
                  <div className="space-y-3">
                    {selectedCustomer.history.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <div className="font-bold text-gray-900">{item.date}</div>
                          <div className="text-xs text-gray-500">
                            {item.pax} khách • {item.amount}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleCreateBooking}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200"
              >
                Đặt bàn mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center animate-in fade-in duration-200 p-4"
          onClick={() => setImportModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                Nhập dữ liệu khách hàng
              </h3>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setImportFile(null);
                  setPreviewRows([]);
                  setImportResult(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Step 1: Download template */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex sm:flex-row flex-col sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-blue-800 text-sm mb-1">1. Tải file mẫu (CSV)</h4>
                  <p className="text-xs text-blue-600">
                    Sử dụng file mẫu để đảm bảo định dạng đúng chuẩn (Hỗ trợ tiếng Việt).
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center gap-2 min-w-fit"
                >
                  <FileText className="w-4 h-4" /> Tải file mẫu
                </button>
              </div>

              {/* Step 2: Upload */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-2">2. Tải file lên</h4>
                <label className="border-2 border-dashed border-teal-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-all bg-gray-50/50">
                  <Upload className={`w-10 h-10 mb-3 ${importFile ? 'text-teal-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {importFile ? importFile.name : 'Nhấn vào đây để chọn file CSV từ máy tính'}
                  </span>
                  <span className="text-xs text-gray-500 mt-2">Chỉ hỗ trợ file .csv (Tối đa 5MB)</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {/* Import result */}
              {importResult ? (
                <div className={`p-4 rounded-xl border ${importResult.success > 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    {importResult.success > 0 ? (
                      <span className="w-5 h-5 text-green-600">✓</span>
                    ) : (
                      <CircleAlert className="w-5 h-5 text-orange-600" />
                    )}
                    Kết quả xử lý
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                      <div className="text-xs text-gray-500 mb-1">Đã thêm mới</div>
                      <div className="text-2xl font-black text-green-600">{importResult.success}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                      <div className="text-xs text-gray-500 mb-1">Bị trùng/Bỏ qua</div>
                      <div className="text-2xl font-black text-orange-600">{importResult.skipped}</div>
                    </div>
                  </div>
                </div>
              ) : previewRows.length > 0 ? (
                /* Step 3: Preview */
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center justify-between">
                    <span>3. Xem trước dữ liệu</span>
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-md border border-teal-100">
                      {previewRows.length} khách hợp lệ
                    </span>
                  </h4>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-48 overflow-y-auto shadow-inner">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 font-medium text-gray-500">Tên khách hàng</th>
                          <th className="px-4 py-3 font-medium text-gray-500">SĐT</th>
                          <th className="px-4 py-3 font-medium text-gray-500">Nhóm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-900 font-medium truncate max-w-[120px]">{row.name}</td>
                            <td className="px-4 py-2.5 text-gray-600 font-mono">{row.phone}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-xs border ${getGroupBadge(row.group)}`}>{row.group}</span>
                            </td>
                          </tr>
                        ))}
                        {previewRows.length > 10 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-center text-gray-500 text-xs italic bg-gray-50">
                              ... và {previewRows.length - 10} dòng khác
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setImportFile(null);
                  setPreviewRows([]);
                  setImportResult(null);
                }}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl text-sm font-bold transition-colors"
              >
                {importResult ? 'Đóng' : 'Hủy bỏ'}
              </button>
              {!importResult && previewRows.length > 0 && (
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-colors flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    `Bắt đầu Import (${previewRows.length})`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
