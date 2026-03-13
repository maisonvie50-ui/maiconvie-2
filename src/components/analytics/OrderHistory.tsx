import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Receipt, TrendingUp, Clock, Users, X, ChevronRight } from 'lucide-react';
import { orderService, OrderTicket } from '../../services/orderService';

export default function OrderHistory() {
    const [orders, setOrders] = useState<OrderTicket[]>([]);
    const [loading, setLoading] = useState(true);
    // Default to current month start and end
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [dateFrom, setDateFrom] = useState<string>(firstDay);
    const [dateTo, setDateTo] = useState<string>(lastDay);
    const [searchTable, setSearchTable] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderTicket | null>(null);

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

    const totalRevenue = orders.reduce((sum, order) => {
        return sum + order.items.reduce((iSum, item) => iSum + (item.price * item.quantity), 0);
    }, 0);

    const calculateOrderTotal = (order: OrderTicket) => {
        return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">

            {/* Filters & Stats */}
            <div className="p-3 md:p-6 shrink-0 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    {/* Stats Cards */}
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
                            <div className="text-base md:text-2xl font-bold text-gray-900">{orders.length}</div>
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
                                <input
                                    type="date"
                                    id="dateFrom"
                                    title="Ngày bắt đầu"
                                    className="w-full pl-8 md:pl-10 pr-2 py-1.5 md:py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1 flex-1">
                            <label htmlFor="dateTo" className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">Đến ngày</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                <input
                                    type="date"
                                    id="dateTo"
                                    title="Ngày kết thúc"
                                    className="w-full pl-8 md:pl-10 pr-2 py-1.5 md:py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="space-y-1 flex-1 md:min-w-[200px]">
                            <label htmlFor="searchTable" className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">Tìm theo bàn</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="searchTable"
                                    title="Bàn hoặc Booking ID"
                                    placeholder="Nhập tên bàn..."
                                    className="w-full pl-8 md:pl-10 pr-2 py-1.5 md:py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    value={searchTable}
                                    onChange={(e) => setSearchTable(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="px-4 md:px-6 py-1.5 md:py-2.5 bg-gray-900 text-white text-sm md:text-base rounded-lg font-medium hover:bg-gray-800 transition-colors h-[34px] md:h-[42px] min-w-[70px]">
                                Lọc
                            </button>
                        </div>
                    </div>
                </form>
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
                                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Tổng tiền</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm text-center">Trạng thái</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            Không có đơn hàng nào trong khoảng thời gian này.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{order.table || 'Mang đi'}</div>
                                                <div className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {order.orderTime.toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-4 text-right font-bold text-teal-600">
                                                {calculateOrderTotal(order).toLocaleString('vi-VN')}đ
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                                                    Đã thanh toán
                                                </span>
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
                            <div className="p-8 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                                Không có đơn hàng nào.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {orders.map(order => (
                                    <div
                                        key={order.id}
                                        className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm active:scale-[0.98] transition-transform"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{order.table || 'Mang đi'}</div>
                                                <div className="text-[11px] text-gray-400 font-mono mt-0.5">#{order.id.slice(0, 8)}</div>
                                            </div>
                                            <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-[10px] font-bold">
                                                ĐÃ THANH TOÁN
                                            </span>
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
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800">{selectedOrder.table || 'Mang đi'}</span>
                                <span className="text-sm font-medium text-gray-500">{selectedOrder.orderTime.toLocaleString('vi-VN')}</span>
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
