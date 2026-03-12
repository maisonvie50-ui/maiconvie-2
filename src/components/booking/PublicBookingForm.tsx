import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Phone, User, CheckCircle, ArrowRight, UtensilsCrossed, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { menuService } from '../../services/menuService';
import { BookingStatus, MenuItem, SetMenu, TourMenu } from '../../types';

export default function PublicBookingForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<{
        customerType: 'retail' | 'tour';
        customerName: string;
        phone: string;
        date: string;
        time: string;
        pax: number;
        area: string;
        notes: string;
    }>({
        customerType: 'retail',
        customerName: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        pax: 2,
        area: 'indoor',
        notes: ''
    });

    const [selectedMenus, setSelectedMenus] = useState<any[]>([]);

    // State for menus
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [setMenus, setSetMenus] = useState<SetMenu[]>([]);
    const [tourMenus, setTourMenus] = useState<TourMenu[]>([]);
    const [isLoadingMenus, setIsLoadingMenus] = useState(false);

    // Tab state
    const [activeRetailTab, setActiveRetailTab] = useState<'alacarte' | 'set'>('alacarte');
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    const toggleMenuExpand = (id: string) => {
        setExpandedMenus(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    useEffect(() => {
        const fetchMenus = async () => {
            setIsLoadingMenus(true);
            try {
                const [alacarteRes, setRes, tourRes] = await Promise.all([
                    menuService.getMenuItems(),
                    menuService.getSetMenus(),
                    menuService.getTourMenus()
                ]);
                setMenuItems(alacarteRes.filter(item => item.inStock));
                setSetMenus(setRes.filter(s => s.status === 'available'));
                setTourMenus(tourRes.filter(t => t.status === 'available'));
            } catch (err) {
                console.error("Error fetching menus:", err);
            } finally {
                setIsLoadingMenus(false);
            }
        };
        fetchMenus();
    }, []);

    const handleQuantityChange = (item: any, type: 'alacarte' | 'set' | 'tour', delta: number) => {
        setSelectedMenus(prev => {
            const existing = prev.find(p => p.id === item.id);
            if (existing) {
                const newQuantity = existing.quantity + delta;
                if (newQuantity <= 0) {
                    return prev.filter(p => p.id !== item.id);
                }
                return prev.map(p => p.id === item.id ? { ...p, quantity: newQuantity } : p);
            } else if (delta > 0) {
                const price = type === 'tour' ? item.netPrice : item.price;
                return [...prev, {
                    id: item.id,
                    name: item.name,
                    price,
                    type,
                    quantity: delta
                }];
            }
            return prev;
        });
    };

    const getQuantity = (id: string) => {
        const found = selectedMenus.find(p => p.id === id);
        return found ? found.quantity : 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            // Create a new booking object
            const newBooking = {
                customerName: formData.customerName,
                phone: formData.phone,
                time: formData.time,
                pax: Number(formData.pax),
                status: 'new' as BookingStatus,
                area: formData.area as any,
                notes: formData.notes ? [formData.notes] : [],
                source: 'website' as const,
                customerType: formData.customerType,
                selectedMenus: selectedMenus
            };

            await bookingService.createBooking(newBooking);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('Đã xảy ra lỗi khi đặt bàn. Vui lòng thử lại sau hoặc liên hệ Hotline.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 text-gray-900">Đặt Bàn Thành Công!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Cảm ơn <strong>{formData.customerName}</strong> đã đặt bàn tại Maison Vie.<br />
                        Chúng tôi sẽ liên hệ qua số <strong>{formData.phone}</strong> để xác nhận trong ít phút tới.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>{new Date(formData.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{formData.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{formData.pax} người</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition duration-300"
                    >
                        Về Trang Chủ
                    </button>
                </div>
            </div>
        );
    }

    // Generate time slots
    const timeSlots = [];
    for (let i = 11; i <= 22; i++) {
        timeSlots.push(`${i}:00`);
        if (i !== 22) timeSlots.push(`${i}:30`);
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-center items-center sticky top-0 z-10 w-full">
                <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-7 h-7 text-teal-600" />
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">Maison Vie</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center p-4 md:p-8 w-full max-w-2xl mx-auto">
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-2 md:mt-8">

                    <div className="bg-teal-600 px-6 py-8 text-white text-center">
                        <h2 className="text-2xl md:text-3xl font-black mb-2">ĐẶT BÀN ONLINE</h2>
                        <p className="text-teal-100 text-sm md:text-base">Hoàn tất biểu mẫu dưới đây, chúng tôi sẽ liên hệ để xác nhận ngay.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-8 md:px-10 md:py-10 space-y-6">

                        {/* LOẠI KHÁCH HÀNG */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">Đối tượng Khách hàng</h3>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl border cursor-pointer transition-all ${formData.customerType === 'retail' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" className="hidden" name="customerType" value="retail" checked={formData.customerType === 'retail'} onChange={(e) => { handleChange(e); setSelectedMenus([]); }} />
                                    <span className={`font-semibold ${formData.customerType === 'retail' ? 'text-teal-700' : 'text-gray-600'}`}>Khách Lẻ</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl border cursor-pointer transition-all ${formData.customerType === 'tour' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" className="hidden" name="customerType" value="tour" checked={formData.customerType === 'tour'} onChange={(e) => { handleChange(e); setSelectedMenus([]); }} />
                                    <span className={`font-semibold ${formData.customerType === 'tour' ? 'text-teal-700' : 'text-gray-600'}`}>Khách Lữ Hành / Tour</span>
                                </label>
                            </div>
                        </div>

                        {/* THÔNG TIN CÁ NHÂN */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">Thông tin liên hệ</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User className="w-4 h-4 text-teal-600" />
                                        Họ và Tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        required
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 bg-gray-50/50 hover:bg-white"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-teal-600" />
                                        Số Điện Thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 bg-gray-50/50 hover:bg-white"
                                        placeholder="090 123 4567"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* THỜI GIAN & SỐ LƯỢNG */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">Thông tin Đặt Bàn</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-teal-600" />
                                        Ngày <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 bg-gray-50/50 hover:bg-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-teal-600" />
                                        Giờ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 bg-gray-50/50 hover:bg-white appearance-none"
                                    >
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-teal-600" />
                                        Số Khách <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="pax"
                                        value={formData.pax}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 bg-gray-50/50 hover:bg-white appearance-none"
                                    >
                                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>{num} {num === 20 && '+'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* CHỌN THỰC ĐƠN TRƯỚC */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
                                Chọn Thực đơn (Không bắt buộc)
                            </h3>

                            {formData.customerType === 'retail' && (
                                <div className="flex border-b border-gray-200 mb-4">
                                    <button type="button" onClick={() => setActiveRetailTab('alacarte')} className={`px-4 py-2 font-semibold text-sm ${activeRetailTab === 'alacarte' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>Gọi Món Lẻ</button>
                                    <button type="button" onClick={() => setActiveRetailTab('set')} className={`px-4 py-2 font-semibold text-sm ${activeRetailTab === 'set' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>Set Menu</button>
                                </div>
                            )}

                            <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {isLoadingMenus ? (
                                    <div className="text-center py-4 text-gray-500 text-sm">Đang tải thực đơn...</div>
                                ) : (
                                    <>
                                        {/* Render ALACARTE */}
                                        {formData.customerType === 'retail' && activeRetailTab === 'alacarte' && menuItems.map(item => (
                                            <div key={item.id} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                                    <p className="text-teal-600 font-medium text-sm">{item.price.toLocaleString()} ₫</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button type="button" onClick={() => handleQuantityChange(item, 'alacarte', -1)} className="w-8 h-8 flex justify-center items-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600" title="Giảm số lượng"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-4 text-center font-bold">{getQuantity(item.id)}</span>
                                                    <button type="button" onClick={() => handleQuantityChange(item, 'alacarte', 1)} className="w-8 h-8 flex justify-center items-center rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700" title="Tăng số lượng"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Render SET MENU */}
                                        {formData.customerType === 'retail' && activeRetailTab === 'set' && setMenus.map(set => {
                                            const isExpanded = expandedMenus.includes(set.id);
                                            return (
                                                <div key={set.id} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                    <div className="flex justify-between items-center">
                                                        <div
                                                            className="flex-1 cursor-pointer flex items-center gap-2"
                                                            onClick={() => toggleMenuExpand(set.id)}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-gray-800">{set.name}</h4>
                                                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                                </div>
                                                                <p className="text-teal-600 font-medium text-sm">{set.price.toLocaleString()} ₫ <span className="text-gray-400 font-normal">/khách</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button type="button" onClick={() => handleQuantityChange(set, 'set', -1)} className="w-8 h-8 flex justify-center items-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600" title="Giảm"><Minus className="w-4 h-4" /></button>
                                                            <span className="w-4 text-center font-bold">{getQuantity(set.id)}</span>
                                                            <button type="button" onClick={() => handleQuantityChange(set, 'set', 1)} className="w-8 h-8 flex justify-center items-center rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700" title="Tăng"><Plus className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                    {isExpanded && set.courses && set.courses.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100 text-sm space-y-2">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Chi tiết Set Menu</p>
                                                            {set.courses.map((course, idx) => (
                                                                <div key={idx} className="flex gap-2">
                                                                    <span className="font-medium text-gray-600 min-w-16">{course.name}:</span>
                                                                    <span className="text-gray-800 flex-1">
                                                                        {course.options.map(opt => `${opt.name}${opt.extraPrice ? ` (+${opt.extraPrice.toLocaleString()}₫)` : ''}`).join(' HOẶC ')}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Render TOUR MENU */}
                                        {formData.customerType === 'tour' && tourMenus.map(tour => {
                                            const isExpanded = expandedMenus.includes(tour.id);
                                            return (
                                                <div key={tour.id} className="bg-white border border-orange-100 p-3 rounded-xl shadow-sm">
                                                    <div className="flex justify-between items-center">
                                                        <div
                                                            className="flex-1 cursor-pointer flex items-center gap-2"
                                                            onClick={() => toggleMenuExpand(tour.id)}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-gray-800">{tour.name}</h4>
                                                                    <span className="text-[10px] uppercase font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Tour</span>
                                                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                                </div>
                                                                <p className="text-red-500 font-medium text-sm mt-1">Net: {tour.netPrice.toLocaleString()} ₫ <span className="text-gray-400 font-normal line-through text-xs ml-1">{tour.price.toLocaleString()} ₫</span></p>
                                                                {tour.focPolicy && <p className="text-xs text-gray-500 mt-1 opacity-80 italic">FOC: {tour.focPolicy}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button type="button" onClick={() => handleQuantityChange(tour, 'tour', -1)} className="w-8 h-8 flex justify-center items-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600" title="Giảm"><Minus className="w-4 h-4" /></button>
                                                            <span className="w-4 text-center font-bold">{getQuantity(tour.id)}</span>
                                                            <button type="button" onClick={() => handleQuantityChange(tour, 'tour', 1)} className="w-8 h-8 flex justify-center items-center rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700" title="Tăng"><Plus className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                    {isExpanded && tour.items && tour.items.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-orange-50 text-sm">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Các món trong thực đơn</p>
                                                            <ul className="space-y-1.5 list-disc list-inside px-2 text-gray-700">
                                                                {tour.items.map((item, idx) => (
                                                                    <li key={idx}>
                                                                        {item.qty && <span className="font-bold mr-1">{item.qty}x</span>}
                                                                        <span>{item.name}</span>
                                                                        {item.note && <span className="text-gray-400 italic text-xs ml-1">({item.note})</span>}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* YÊU CẦU THÊM */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">Yêu cầu khác (Tùy chọn)</h3>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Khu vực ưa thích</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {[
                                        { id: 'indoor', label: 'Trong nhà' },
                                        { id: 'outdoor', label: 'Ngoài trời' },
                                        { id: 'vip', label: 'Phòng VIP' },
                                        { id: 'rooftop', label: 'Rooftop' },
                                    ].map(area => (
                                        <button
                                            type="button"
                                            key={area.id}
                                            onClick={() => setFormData(prev => ({ ...prev, area: area.id }))}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${formData.area === area.id
                                                ? 'bg-teal-50 border-2 border-teal-500 text-teal-700'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {area.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <label className="text-sm font-semibold text-gray-700">Ghi chú (Dị ứng, kỷ niệm, v.v.)</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 bg-gray-50/50 hover:bg-white resize-none"
                                    placeholder="Ví dụ: Khách dị ứng tôm, đặt bàn tổ chức sinh nhật..."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 mt-6 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 transition-all ${isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98]'}`}
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Bàn'}
                            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-400 text-sm mt-8 pb-8 font-medium">
                    © 2026 Maison Vie. Bảo mật thông tin khách hàng.
                </p>
            </div>

        </div>
    );
}
