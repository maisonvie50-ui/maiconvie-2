import React, { useState } from 'react';
import { Search, Phone, User, Clock, Users, Loader2, X, Mail, Calendar, AlertCircle, Edit3, Trash2, Save } from 'lucide-react';
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

type PublicLookupBooking = Booking & { createdAt?: string; changeRequestData?: any };

export default function BookingLookup() {
    const [query, setQuery] = useState('');
    const [phoneLast4, setPhoneLast4] = useState('');
    const [results, setResults] = useState<PublicLookupBooking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [menuEditId, setMenuEditId] = useState<string | null>(null);
    const [changeForm, setChangeForm] = useState({ date: '', time: '', pax: '', notes: '' });
    const [editableMenus, setEditableMenus] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!query.trim() || phoneLast4.length !== 4) return;
        setIsLoading(true);
        setError('');
        setHasSearched(true);
        try {
            const data = await bookingService.searchBookingSecure(query, phoneLast4);
            setResults(data as PublicLookupBooking[]);
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

    const handleCancel = async (booking: PublicLookupBooking) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn đặt bàn này không? Hành động này không thể hoàn tác.')) return;
        try {
            setIsLoading(true);
            await bookingService.cancelBookingByCustomer(booking);
            alert('Đã hủy đơn đặt bàn thành công.');
            handleSearch();
        } catch (err: any) {
            alert(err.message || 'Không thể hủy đơn đặt bàn lúc này.');
        } finally {
            setIsLoading(false);
        }
    };

    const startChangeRequest = (booking: PublicLookupBooking) => {
        setEditingId(booking.id);
        setMenuEditId(null);
        setChangeForm({
            date: booking.bookingDate || '',
            time: booking.time || '',
            pax: String(booking.pax || ''),
            notes: ''
        });
    };

    const submitChange = async (bookingId: string) => {
        if (!changeForm.date || !changeForm.time || !changeForm.pax) {
            alert('Vui lòng nhập đầy đủ ngày, giờ và số khách.');
            return;
        }
        try {
            setIsLoading(true);
            await bookingService.submitChangeRequest(bookingId, {
                requested_date: changeForm.date,
                requested_time: changeForm.time,
                requested_pax: parseInt(changeForm.pax, 10),
                requested_notes: changeForm.notes,
                requested_at: new Date().toISOString()
            });
            alert('Đã gửi yêu cầu. Nhà hàng sẽ xác nhận lại sớm nhất.');
            setEditingId(null);
            handleSearch();
        } catch (err) {
            console.error(err);
            alert('Lỗi khi gửi yêu cầu thay đổi.');
        } finally {
            setIsLoading(false);
        }
    };

    const startMenuEdit = (booking: PublicLookupBooking) => {
        setMenuEditId(booking.id);
        setEditingId(null);
        let parsed: any[] = [];
        try {
            if (typeof booking.selectedMenus === 'string') parsed = JSON.parse(booking.selectedMenus);
            else if (Array.isArray(booking.selectedMenus)) parsed = [...booking.selectedMenus];
        } catch { parsed = []; }
        setEditableMenus(parsed);
    };

    const updateMenuQty = (item: any, delta: number) => {
        setEditableMenus(prev => {
            const existing = prev.find(menu => menu.id === item.id);
            if (existing) {
                const quantity = existing.quantity + delta;
                if (quantity <= 0) return prev.filter(menu => menu.id !== item.id);
                return prev.map(menu => menu.id === item.id ? { ...menu, quantity } : menu);
            }
            if (delta > 0) return [...prev, { id: item.id, name: item.name, price: item.price || 0, quantity: delta }];
            return prev;
        });
    };

    const saveMenus = async (bookingId: string) => {
        try {
            setIsLoading(true);
            await bookingService.updateBookingMenus(bookingId, editableMenus);
            alert('Đã cập nhật thực đơn thành công.');
            setMenuEditId(null);
            handleSearch();
        } catch (err) {
            console.error(err);
            alert('Lỗi cập nhật thực đơn.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                            <Search className="w-2.5 h-2.5 text-teal-600" />
                        </div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tra cứu đơn đặt bàn</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1 min-w-0">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Email, SĐT hoặc mã booking"
                                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-gray-50/50"
                            />
                        </div>
                        <div className="relative w-28 shrink-0">
                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                            <input
                                type="text"
                                value={phoneLast4}
                                onChange={e => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                onKeyDown={handleKeyDown}
                                placeholder="4 số cuối SĐT"
                                maxLength={4}
                                className="w-full pl-8 pr-2 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 text-center tracking-wider font-semibold transition-all bg-gray-50/50 placeholder:tracking-normal placeholder:text-[11px] placeholder:font-normal"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || !query.trim() || phoneLast4.length !== 4}
                            className="px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            <span className="hidden sm:inline">Tìm</span>
                        </button>
                    </div>

                    {(query || phoneLast4) && (
                        <button
                            onClick={() => { setQuery(''); setPhoneLast4(''); setResults([]); setHasSearched(false); setError(''); }}
                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Xóa tìm kiếm
                        </button>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {isLoading && !results.length && (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                    <p className="text-xs text-gray-400">Đang tìm kiếm...</p>
                </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && !error && (
                <div className="text-center py-10 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm font-medium">Không tìm thấy đơn đặt bàn nào.</p>
                    <p className="text-gray-400 text-xs mt-1">Vui lòng kiểm tra email/SĐT/mã booking và 4 số cuối SĐT.</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                    <p className="text-xs text-gray-400 font-medium px-1">Tìm thấy {results.length} kết quả</p>
                    {results.map(booking => {
                        const statusInfo = STATUS_MAP[booking.status] || { label: booking.status, color: 'bg-gray-100 text-gray-600' };
                        const selectedMenus = Array.isArray(booking.selectedMenus) ? booking.selectedMenus : [];
                        return (
                            <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-teal-600 shrink-0" />
                                            <span className="font-bold text-gray-900 text-sm truncate">{booking.customerName || '—'}</span>
                                        </div>
                                        {booking.bookingCode && <p className="text-[11px] text-gray-400 mt-1">Mã: {booking.bookingCode}</p>}
                                    </div>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
                                    {booking.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /><span>{booking.phone}</span></div>}
                                    {booking.email && <div className="flex items-center gap-1.5 col-span-2"><Mail className="w-3.5 h-3.5 text-gray-400" /><span className="truncate">{booking.email}</span></div>}
                                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>{formatDate(booking.bookingDate)}</span></div>
                                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /><span>{booking.time}</span></div>
                                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" /><span>{booking.pax} khách</span></div>
                                </div>

                                {selectedMenus.length > 0 && (
                                    <div className="pt-2 border-t border-gray-50">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Thực đơn đã chọn</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedMenus.map((menu: any, idx: number) => (
                                                <span key={idx} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                                    {menu.name} × {menu.quantity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {booking.changeRequestData && (
                                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700">
                                        Yêu cầu thay đổi đang chờ nhà hàng xác nhận.
                                    </div>
                                )}

                                {editingId === booking.id && (
                                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                                        <div className="grid grid-cols-3 gap-2">
                                            <input type="date" value={changeForm.date} onChange={e => setChangeForm({ ...changeForm, date: e.target.value })} className="px-2 py-2 text-xs rounded-lg border border-gray-200" />
                                            <input type="time" value={changeForm.time} onChange={e => setChangeForm({ ...changeForm, time: e.target.value })} className="px-2 py-2 text-xs rounded-lg border border-gray-200" />
                                            <input type="number" min={1} value={changeForm.pax} onChange={e => setChangeForm({ ...changeForm, pax: e.target.value })} className="px-2 py-2 text-xs rounded-lg border border-gray-200" />
                                        </div>
                                        <textarea value={changeForm.notes} onChange={e => setChangeForm({ ...changeForm, notes: e.target.value })} placeholder="Ghi chú yêu cầu thay đổi" className="w-full px-2 py-2 text-xs rounded-lg border border-gray-200 resize-none" rows={2} />
                                        <div className="flex gap-2">
                                            <button onClick={() => submitChange(booking.id)} className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3 h-3" />Gửi yêu cầu</button>
                                            <button onClick={() => setEditingId(null)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold">Hủy</button>
                                        </div>
                                    </div>
                                )}

                                {menuEditId === booking.id && (
                                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                                        <p className="text-xs font-bold text-gray-500">Cập nhật thực đơn đã chọn</p>
                                        {editableMenus.length === 0 ? <p className="text-xs text-gray-400">Chưa có thực đơn.</p> : editableMenus.map(item => (
                                            <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                                                <span className="text-xs font-medium text-gray-700 truncate">{item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateMenuQty(item, -1)} className="w-6 h-6 rounded-full bg-gray-100 text-gray-600">-</button>
                                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateMenuQty(item, 1)} className="w-6 h-6 rounded-full bg-teal-100 text-teal-700">+</button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <button onClick={() => saveMenus(booking.id)} className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold">Lưu thực đơn</button>
                                            <button onClick={() => setMenuEditId(null)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold">Hủy</button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 border-t border-gray-50">
                                    <button onClick={() => startChangeRequest(booking)} className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Edit3 className="w-3.5 h-3.5" />Đổi lịch</button>
                                    <button onClick={() => startMenuEdit(booking)} className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold">Thực đơn</button>
                                    <button onClick={() => handleCancel(booking)} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />Hủy</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
