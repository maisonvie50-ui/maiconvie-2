import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Phone, User, CheckCircle, ArrowRight, UtensilsCrossed } from 'lucide-react';

export default function PublicBookingForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        pax: 2,
        area: 'indoor',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create a new booking object
        const newBooking = {
            id: `web-${Date.now().toString()}`,
            customerName: formData.customerName,
            phone: formData.phone,
            time: formData.time, // Simplification: ignoring date for the mock kanban
            pax: Number(formData.pax),
            status: 'new',
            area: formData.area,
            notes: formData.notes ? [formData.notes] : [],
            source: 'website'
        };

        // Save to localStorage so Kanban can pick it up
        const existingBookingsStr = localStorage.getItem('maison_vie_web_bookings');
        const existingBookings = existingBookingsStr ? JSON.parse(existingBookingsStr) : [];
        localStorage.setItem('maison_vie_web_bookings', JSON.stringify([...existingBookings, newBooking]));

        setIsSubmitted(true);
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
                            className="w-full py-4 mt-6 bg-teal-600 text-white rounded-xl font-black text-lg hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
                        >
                            Xác Nhận Đặt Bàn
                            <ArrowRight className="w-5 h-5" />
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
