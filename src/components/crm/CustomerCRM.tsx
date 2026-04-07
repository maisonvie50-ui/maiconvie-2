import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { customerService, Customer } from '../../services/customerService';
import {
  Search,
  Filter,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  Calendar,
  Star,
  History,
  Tag,
  ChevronRight,
  PhoneCall,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function CustomerCRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // States for CSV Import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{success: number, errors: string[]} | null>(null);

  const navigate = useNavigate();

  const handleCreateBooking = () => {
    if (!selectedCustomer) return;
    navigate(`/dat-ban?action=new&name=${encodeURIComponent(selectedCustomer.name)}&phone=${encodeURIComponent(selectedCustomer.phone)}`);
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

  const handleDownloadTemplate = () => {
    const headers = ["Tên khách hàng", "Số điện thoại", "Email", "Nhóm khách", "(Bắt buộc) Nhập tên", "(Bắt buộc) Nhập SĐT", "(Tùy chọn) Nhập Email", "(Tùy chọn) VIP/Regular/New"];
    const rows = [
      headers,
      ["Nguyễn Văn A", "0901234567", "nguyenvana@email.com", "VIP"],
      ["Trần Thị B", "0987654321", "", "New"]
    ];
    
    // Add BOM for Excel UTF-8 reading
    const csvContent = "\uFEFF" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "maison_vie_customers_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    setIsImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        // Skip first line (headers)
        const lines = text.split(/\r\n|\n/).slice(1).filter(line => line.trim().length > 0);
        
        const parsedData = lines.map(line => {
          const cols = line.split(',');
          // Cleanup phone number
          const name = cols[0]?.trim() || '';
          let phone = cols[1]?.trim() || '';
          phone = phone.replace(/[^0-9]/g, '');
          const email = cols[2]?.trim() || '';
          const group = cols[3]?.trim() || 'New';
          return { name, phone, email, customer_group: group };
        }).filter(item => item.name && item.phone && item.phone.length >= 8);

        if (parsedData.length === 0) {
          setImportResult({ success: 0, errors: ["Không tìm thấy dữ liệu hợp lệ trong file"] });
          setIsImporting(false);
          return;
        }

        const result = await customerService.importCustomers(parsedData);
        setImportResult(result);
      } catch (err: any) {
        setImportResult({ success: 0, errors: [err.message] });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

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

  const renderMobileView = () => (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm khách hàng..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsImportModalOpen(true)} className="p-2.5 bg-gray-100 text-teal-600 rounded-xl border border-gray-200 active:bg-gray-200 shadow-sm" title="Nhập dữ liệu">
              <Upload className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl border border-gray-200 active:bg-gray-200 shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => setSelectedCustomer(customer)}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 flex items-center gap-4"
          >
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white shadow-sm flex-shrink-0 ${customer.group === 'VIP' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
              }`}>
              {customer.name.charAt(0)}
            </div>

            {/* Info */}
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

            {/* Action */}
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

  const renderDesktopView = () => (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      {/* Main List Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-64"
              />
            </div>
            <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-lg border border-teal-200 transition-colors font-bold text-sm shadow-sm">
              <Upload className="w-4 h-4" /> Nhập dữ liệu
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200">
              <Filter className="w-4 h-4" />
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
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
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
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${customer.noShowRate >= 50 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                          }`}>
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
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Hồ sơ khách hàng</h3>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Profile Info */}
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

            {/* Warning Section */}
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
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-100"
                  >
                    {tag}
                  </span>
                ))}
                <button className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 text-xs font-medium rounded-lg hover:border-gray-400 hover:text-gray-500 transition-colors">
                  + Thêm tag
                </button>
              </div>
            </div>

            {/* History Timeline */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                Lịch sử đặt bàn
              </h4>
              <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                {selectedCustomer.history.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'no-show' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.date}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.pax} Pax • {item.amount}</div>
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

          {/* Drawer Footer */}
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
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-white h-[90%] mt-auto rounded-t-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 sticky top-0">
              <h3 className="font-bold text-gray-800">Thông tin khách hàng</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
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
                      <a href={`tel:${selectedCustomer.phone}`} className="ml-auto w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
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
                          <div className="text-xs text-gray-500">{item.pax} khách • {item.amount}</div>
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
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsImportModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800">Nhập dữ liệu khách hàng</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-2">1. Tải mẫu về</h4>
                <div className="flex items-center gap-4 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <div className="flex-1 text-sm text-gray-600">
                    Sử dụng file excel mẫu để nhập danh sách khách hàng. <br/>
                    Bảo đảm định dạng đúng chuẩn (Hỗ trợ tiếng Việt).
                  </div>
                  <button onClick={handleDownloadTemplate} className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2 min-w-fit">
                    <Download className="w-4 h-4" /> Tải file mẫu
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-2">2. Tải file lên</h4>
                <label className="border-2 border-dashed border-teal-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-all bg-gray-50/50 relative">
                  <Upload className={`w-10 h-10 mb-3 ${importFile ? "text-teal-500" : "text-gray-400"}`} />
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {importFile ? importFile.name : "Nhấn vào đây để chọn file CSV từ máy tính"}
                  </span>
                  <span className="text-xs text-gray-500 mt-2">Chỉ hỗ trợ file .csv (Tối đa 5MB)</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                  {isImporting && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center backdrop-blur-sm z-10 transition-all">
                      <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </label>
              </div>

              {importResult && (
                <div className={`p-4 rounded-xl border ${importResult.success > 0 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    {importResult.success > 0 ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-orange-600" />}
                    Kết quả xử lý
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col items-center shadow-sm">
                      <span className="text-3xl font-black text-green-600">{importResult.success}</span>
                      <span className="text-xs text-gray-500 font-medium">Thành công</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col items-center shadow-sm">
                      <span className="text-3xl font-black text-red-500">{importResult.errors.length}</span>
                      <span className="text-xs text-gray-500 font-medium">Lỗi / Trùng lặp</span>
                    </div>
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <div className="mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar border border-red-100 rounded-lg bg-white">
                      <table className="w-full text-xs text-left">
                        <tbody>
                          {importResult.errors.map((err, idx) => (
                            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                              <td className="px-3 py-2 text-red-600 break-words font-medium">{err}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Modal Actions */}
            {(importFile || importResult) && (
               <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button onClick={() => { setImportFile(null); setImportResult(null); setIsImportModalOpen(false); }} className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors">
                     Đóng
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
