import React, { useState } from 'react';
import { Search, Phone, User, Clock, Users, CalendarIcon, Loader2, X, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking, BookingStatus } from '../../types';

const STATUS_MAP: Record<BookingStatus, { label: string; color: string }> = {
    new: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
    waiting_info: { label: 'Chờ thông tin', color: 'bg-orange-100 text-orange-700' },
    confirmed: { label: 'Đã xác nhận', color: 'bg-green-100 text-green-700' },
    arrived: { label: 'Đã đến', color: 'bg-teal-100 text-teal-700' },
    completed: { label: 'Hoàn tất', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-600' },
    no_show: { label: 'Không đến', color: 'bg-red-50 text-red-500' },
    change_requested: { label: 'Yêu cầu đổi', color: 'bg-purple-100 text-purple-700' },
};

export default function BookingLookup() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<(Booking & { createdAt?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setError('');
        setHasSearched(true);
        try {
            const data = await bookingService.searchBookingsByContact(query);
            setResults(data);
        } catch (err) {
            console.error(err);
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const formatDate = (timeStr?: string) => {
        if (!timeStr) return '';
        try {
            return new Date(timeStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return timeStr; }
    };

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tên, SĐT hoặc email..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 bg-gray-50/50 hover:bg-white text-sm"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title="Xóa"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !query.trim()}
                    className="px-5 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Tìm
                </button>
            </div>

            {/* Error */}
            {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Results */}
            {isLoading && (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && !error && (
                <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">Không tìm thấy đơn đặt bàn nào.</p>
                    <p className="text-gray-300 text-xs mt-1">Vui lòng kiểm tra lại tên, SĐT hoặc email.</p>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    <p className="text-xs text-gray-400 font-medium">Tìm thấy {results.length} kết quả</p>
                    {results.map(booking => {
                        const statusInfo = STATUS_MAP[booking.status] || { label: booking.status, color: 'bg-gray-100 text-gray-600' };
                        return (
                            <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-2.5">
                                {/* Header: name + status */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <User className="w-4 h-4 text-teal-600 shrink-0" />
                                        <span className="font-semibold text-gray-900 text-sm truncate">{booking.customerName || '—'}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>

                                {/* Details grid */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
                                    {booking.phone && (
                                        <div className="flex items-center gap-1.5 hover:text-teal-600 transition-colors">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{booking.phone}</span>
                                        </div>
                                    )}
                                    {booking.email && (
                                        <div className="flex items-center gap-1.5 hover:text-teal-600 transition-colors col-span-2">
                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="truncate">{booking.email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{booking.pax} khách</span>
                                    </div>
                                    {booking.time && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{booking.time}</span>
                                        </div>
                                    )}
                                    {booking.createdAt && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <span>Đặt: {formatDate(booking.createdAt)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Menus */}
                                {booking.selectedMenus && booking.selectedMenus.length > 0 && (
                                    <div className="pt-2 border-t border-gray-50">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Thực đơn đã chọn</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {booking.selectedMenus.map((menu: any, idx: number) => (
                                                <span key={idx} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                                    {menu.name} × {menu.quantity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
