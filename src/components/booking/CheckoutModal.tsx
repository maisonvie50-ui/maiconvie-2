import React, { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle, Clock, Utensils, IndianRupee, Users } from 'lucide-react';
import { orderService, OrderTicket } from '../../services/orderService';
import { bookingService } from '../../services/bookingService';
import { tableService } from '../../services/tableService';
import { Booking } from '../../types/booking';
import { Table } from '../../types/restaurant';

interface CheckoutModalProps {
    booking?: Booking;
    table?: Table;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CheckoutModal({ booking, table, onClose, onSuccess }: CheckoutModalProps) {
    const [orders, setOrders] = useState<OrderTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');

    useEffect(() => {
        let mounted = true;
        async function loadBill() {
            try {
                setLoading(true);
                let fetchedOrders: OrderTicket[] = [];

                if (booking) {
                    fetchedOrders = await orderService.getOrdersByBookingId(booking.id);
                } else if (table) {
                    // If we don't have the booking, fetch by table ID
                    fetchedOrders = await orderService.getOrdersByTableId(table.id);
                }

                if (mounted) {
                    setOrders(fetchedOrders);
                }
            } catch (err) {
                console.error('Error loading bill', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (booking || table) {
            loadBill();
        }
        return () => { mounted = false; };
    }, [booking?.id, table?.id]);

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            // 1. Complete all orders related to this bill
            for (const order of orders) {
                await orderService.completeOrder(order.id, paymentMethod);
            }

            // 2. Update booking status to completed
            const targetBookingId = booking?.id || (table as any)?.bookingId;
            if (targetBookingId) {
                await bookingService.updateBookingStatus(targetBookingId, 'completed');
            }

            // 3. Free up the table
            const targetTableId = booking?.tableId || table?.id;
            if (targetTableId) {
                await tableService.updateTableStatus(targetTableId, { status: 'empty', customerName: null, time: null } as any);
            }

            onSuccess();
        } catch (err) {
            console.error('Error during checkout', err);
            alert('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
        } finally {
            setProcessing(false);
        }
    };

    // Group items by category or just list them
    const allItems = orders.flatMap(o => o.items);
    const totalAmount = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-teal-600 text-white p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Thanh toán (Checkout)</h2>
                    </div>
                    <button onClick={onClose} title="Đóng" className="p-1 hover:bg-teal-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Guest Info */}
                <div className="bg-gray-50 border-b p-4 shrink-0">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800">
                            {booking ? booking.customerName : ((table as any)?.customerName || 'Khách vãng lai')}
                        </div>
                        <div className="text-teal-600 font-bold px-2 py-0.5 bg-teal-100 rounded text-sm">
                            {booking ? (booking.tableName || 'Chưa xếp bàn') : (table as any)?.name}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        {booking ? (
                            <>
                                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.time}</div>
                                <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {booking.pax} khách</div>
                            </>
                        ) : (
                            <>
                                {((table as any)?.time) && <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {(table as any).time}</div>}
                                {((table as any)?.pax || (table as any)?.capacity) && <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {(table as any).pax || (table as any).capacity} khách</div>}
                            </>
                        )}
                    </div>
                </div>

                {/* Bill Details */}
                <div className="p-4 flex-1 overflow-y-auto">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 border-b pb-2">
                        <Utensils className="w-4 h-4 text-gray-400" /> Chi tiết gọi món
                    </h3>

                    {loading ? (
                        <div className="flex justify-center p-8 text-teal-600">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                    ) : allItems.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 text-sm">
                            <p>Bàn này chưa gọi món nào trên hệ thống.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order, orderIdx) => (
                                <div key={order.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-xs text-gray-400 mb-2 pb-1 border-b border-gray-200">
                                        Lượt gọi {orderIdx + 1} - {order.orderTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="space-y-2">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex justify-between items-start text-sm">
                                                <div className="flex-1 pr-2">
                                                    <div className="font-medium text-gray-800">
                                                        {item.quantity}x {item.name}
                                                    </div>
                                                    {(item.notes && item.notes.length > 0) && (
                                                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">
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
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Total */}
                <div className="p-4 border-t bg-white shrink-0 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-bold text-lg">TỔNG CỘNG:</span>
                        <span className="text-2xl font-bold text-teal-600">
                            {totalAmount.toLocaleString('vi-VN')}đ
                        </span>
                    </div>

                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phương thức thanh toán</div>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'cash', label: '💵 TM' },
                                { value: 'transfer', label: '🏦 CK' },
                                { value: 'card', label: '💳 Thẻ' },
                            ].map(m => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setPaymentMethod(m.value)}
                                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border-2 whitespace-nowrap ${paymentMethod === m.value ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 py-3 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Đóng lại
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={processing}
                            className="flex-[2] py-3 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Xác nhận Thanh toán
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
