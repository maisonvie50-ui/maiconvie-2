import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Receipt, TrendingUp, Clock, Users, X, ChevronRight, Download, DollarSign, Building2, MapPin } from 'lucide-react';
import { orderService, OrderTicket } from '../../services/orderService';

const PAYMENT_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
    cash: { label: 'Tiền mặt', emoji: '💵', color: 'bg-green-100 text-green-700' },
    transfer: { label: 'Chuyển khoản', emoji: '🏦', color: 'bg-blue-100 text-blue-700' },
    card: { label: 'Thẻ', emoji: '💳', color: 'bg-purple-100 text-purple-700' },
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
    tour: { label: 'Tour', color: 'bg-orange-100 text-orange-700' },
    retail: { label: 'Retail', color: 'bg-sky-100 text-sky-700' },
    email: { label: 'Email', color: 'bg-violet-100 text-violet-700' },
    walk_in: { label: 'Vãng lai', color: 'bg-gray-100 text-gray-600' },
};

const FLOOR_LABELS: Record<number, string> = { 1: 'Tầng 1', 2: 'Tầng 2 (VIP)', 3: 'Tầng 3' };

export default function OrderHistory() {
    const [orders, setOrders] = useState<OrderTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [dateFrom, setDateFrom] = useState<string>(firstDay);
    const [dateTo, setDateTo] = useState<string>(lastDay);
    const [searchTable, setSearchTable] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderTicket | null>(null);
    const [floorFilter, setFloorFilter] = useState<number | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [dateFrom, dateTo]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getCompletedOrders({ dateFrom, dateTo, searchTable });
            setOrders(data);
        } catch (error) {
            console.error('Lỗi khi tải lịch sử:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrders();
    };

    // Filtered by floor
    const filteredOrders = floorFilter ? orders.filter(o => o.floor === floorFilter) : orders;

    const totalRevenue = filteredOrders.reduce((sum, order) =>
        sum + order.items.reduce((iSum, item) => iSum + (item.price * item.quantity), 0), 0);

    const averagePerOrder = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;

    const calculateOrderTotal = (order: OrderTicket) =>
        order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // CSV export
    const handleExportCSV = () => {
        const header = 'Mã đơn,Bàn,Tầng,Khách hàng,SĐT,Nguồn,Phương thức TT,Thời gian,Tổng tiền,Số món';
        const rows = filteredOrders.map(o => {
            const total = calculateOrderTotal(o);
            const floorName = o.floor ? FLOOR_LABELS[o.floor] || `Tầng ${o.floor}` : '';
            const source = o.source ? (SOURCE_LABELS[o.source]?.label || o.source) : '';
            const payment = o.paymentMethod ? (PAYMENT_LABELS[o.paymentMethod]?.label || o.paymentMethod) : '';
            return [
                o.id.slice(0, 8),
                `"${o.table || 'Mang đi'}"`,
                `"${floorName}"`,
                `"${o.customerName || ''}"`,
                o.customerPhone || '',
                `"${source}"`,
                `"${payment}"`,
                o.orderTime.toLocaleString('vi-VN'),
                total,
                o.items.length,
            ].join(',');
        });
        const csv = '\uFEFF' + [header, ...rows].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doanh-thu_${dateFrom}_${dateTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getPaymentBadge = (method?: string) => {
        if (!method) return <span className="text-xs text-gray-400">—</span>;
        const m = PAYMENT_LABELS[method] || { label: method, emoji: '💰', color: 'bg-gray-100 text-gray-600' };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.color}`}>{m.emoji} {m.label}</span>;
    };

    const getSourceBadge = (source?: string) => {
        if (!source) return <span className="text-xs text-gray-400">—</span>;
        const s = SOURCE_LABELS[source] || { label: source, color: 'bg-gray-100 text-gray-600' };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.color}`}>{s.label}</span>;
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">

            {/* Stats & Filters */}
            <div className="p-3 md:p-6 shrink-0 space-y-4">
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs md:text-sm font-medium text-gray-500 truncate">Tổng doanh thu</div>
                            <div className="text-base md:text-2xl font-bold text-gray-900 truncate" title={`${totalRevenue.toLocaleString('vi-VN')}đ`}>
                                {totalRevenue > 1000000 ? `${(totalRevenue / 1000000).toFixed(1)}Tr` : `${totalRevenue.toLocaleString('vi-VN')}đ`}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Receipt className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <div className="text-xs md:text-sm font-medium text-gray-500">Tổng số đơn</div>
                            <div className="text-base md:text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs md:text-sm font-medium text-gray-500 truncate">TB/đơn</div>
                            <div className="text-base md:text-2xl font-bold text-gray-900 truncate" title={`${averagePerOrder.toLocaleString('vi-VN')}đ`}>
                                {averagePerOrder > 1000000 ? `${(averagePerOrder / 1000000).toFixed(1)}Tr` : `${averagePerOrder.toLocaleString('vi-VN')}đ`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={handleSearch} className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-stretch md:items-end">
                    <div className="flex gap-3 w-full">
                        <div className="space-y-1 flex-1">
                            <label htmlFor="dateFrom" className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">Từ ngày</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                <input type="date" id="dateFrom" title="Ngày bắt đầu" className="w-full pl-8 md:pl-10 pr-2 py-1.5 md:py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1 flex-1">
                            <label htmlFor="dateTo" className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">Đến ngày</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                <input type="date" id="dateTo" title="Ngày kết thúc" className="w-full pl-8 md:pl-10 pr-2 py-1.5 md:py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="space-y-1 flex-1 md:min-w-[160px]">
                            <label htmlFor="searchTable" className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">Tìm theo bàn</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                <input type="text" id="searchTable" title="Bàn hoặc Booking ID" placeholder="Nhập tên bàn..." className="w-full pl-8 md:pl-10 pr-2 py-1.5 md:py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={searchTable} onChange={(e) => setSearchTable(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="px-4 md:px-5 py-1.5 md:py-2.5 bg-gray-900 text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors h-[34px] md:h-[42px]">
                                Lọc
                            </button>
                            <button type="button" onClick={handleExportCSV} disabled={filteredOrders.length === 0} title="Xuất CSV" className="px-3 py-1.5 md:py-2.5 bg-teal-600 text-white text-sm rounded-lg font-medium hover:bg-teal-700 transition-colors h-[34px] md:h-[42px] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                                <Download className="w-4 h-4" />
                                <span className="hidden md:inline">CSV</span>
                            </button>
                        </div>
                    </div>
                </form>

                {/* Floor Filter */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setFloorFilter(null)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!floorFilter ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                        Tất cả tầng
                    </button>
                    {[1, 2, 3].map(f => (
                        <button key={f} onClick={() => setFloorFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${floorFilter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                            {FLOOR_LABELS[f]}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 px-0 md:px-6 pb-0 md:pb-6 overflow-hidden flex flex-col">
                <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm border-transparent md:border-gray-100 md:border flex-1 overflow-hidden flex flex-col">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Mã Đơn / Bàn</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Thời gian</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm text-center">Nguồn</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm text-center">Thanh toán</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Tổng tiền</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center"><div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div></td></tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Không có đơn hàng nào trong khoảng thời gian này.</td></tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{order.table || 'Mang đi'}</div>
                                                {order.customerName && (
                                                    <div className="text-xs text-teal-700 font-medium mt-0.5">
                                                        {order.customerName} {order.customerPhone && `- ${order.customerPhone}`}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">#{order.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {order.orderTime.toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-4 text-center">{getSourceBadge(order.source)}</td>
                                            <td className="p-4 text-center">{getPaymentBadge(order.paymentMethod)}</td>
                                            <td className="p-4 text-right font-bold text-teal-600">
                                                {calculateOrderTotal(order).toLocaleString('vi-VN')}đ
                                            </td>
                                            <td className="p-4 text-right">
                                                <button title="Xem chi tiết" className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden overflow-y-auto flex-1 px-3 pt-1 pb-24">
                        {loading ? (
                            <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">Không có đơn hàng nào.</div>
                        ) : (
                            <div className="space-y-2.5">
                                {filteredOrders.map(order => (
                                    <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm active:scale-[0.98] transition-transform" onClick={() => setSelectedOrder(order)}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{order.table || 'Mang đi'}</div>
                                                {order.customerName && (
                                                    <div className="text-xs text-teal-700 font-medium mt-0.5">
                                                        {order.customerName}
                                                    </div>
                                                )}
                                                <div className="text-[11px] text-gray-400 font-mono mt-0.5">#{order.id.slice(0, 8)}</div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {getPaymentBadge(order.paymentMethod)}
                                                {getSourceBadge(order.source)}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {order.orderTime.toLocaleString('vi-VN')}
                                            </div>
                                            <div className="font-bold text-teal-600 text-base">
                                                {calculateOrderTotal(order).toLocaleString('vi-VN')}đ
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Detail */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-lg font-bold">Chi tiết Hoá đơn</h2>
                                <p className="text-gray-400 text-xs font-mono">#{selectedOrder.id}</p>
                            </div>
                            <button title="Đóng" onClick={() => setSelectedOrder(null)} className="p-3 md:p-2 -mr-1 md:mr-0 hover:bg-gray-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-300" />
                            </button>
                        </div>
                        <div className="p-4 border-b bg-gray-50 shrink-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-gray-800 block">{selectedOrder.table || 'Mang đi'}</span>
                                    {selectedOrder.customerName && (
                                        <span className="text-sm font-medium text-teal-700 block mt-1">
                                            Khách: {selectedOrder.customerName} {selectedOrder.customerPhone && `- ${selectedOrder.customerPhone}`}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{selectedOrder.orderTime.toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {getPaymentBadge(selectedOrder.paymentMethod)}
                                {getSourceBadge(selectedOrder.source)}
                                {selectedOrder.floor && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                                        📍 {FLOOR_LABELS[selectedOrder.floor] || `Tầng ${selectedOrder.floor}`}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            <div className="space-y-4">
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-start text-sm">
                                        <div className="flex-1 pr-4">
                                            <div className="font-medium text-gray-800">
                                                {item.quantity}x {item.name}
                                            </div>
                                            {(item.notes && item.notes.length > 0) && (
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {item.notes.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-semibold text-gray-600 whitespace-nowrap">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 shrink-0">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-bold">TỔNG CỘNG:</span>
                                <span className="text-xl font-bold text-teal-600">
                                    {calculateOrderTotal(selectedOrder).toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
