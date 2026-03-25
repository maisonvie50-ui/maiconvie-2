import { Booking, BookingStatus } from '../types/booking';
import { settingsService } from './settingsService';

export interface BookingNotificationPayload {
    type: 'new_booking' | 'status_change' | 'booking_confirmed';
    booking: Booking;
    oldStatus?: BookingStatus;
    newStatus?: BookingStatus;
    timestamp: string;
    /** Tin nhắn xác nhận đã format sẵn — dùng để gửi trực tiếp cho khách qua SMS/Zalo/Email */
    confirmationMessage?: string;
}

const STATUS_LABELS: Record<string, string> = {
    new: 'Mới',
    pending: 'Cần xử lý',
    waiting_info: 'Chờ thông tin',
    confirmed: 'Đã xác nhận',
    arrived: 'Đã đến',
    seated: 'Đã ngồi',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    no_show: 'Không đến',
    change_requested: 'Yêu cầu đổi',
};

const AREA_LABELS: Record<string, string> = {
    indoor: 'Trong nhà',
    outdoor: 'Ngoài trời',
    vip: 'Phòng VIP',
    rooftop: 'Sân thượng',
};

export const bookingNotifyService = {
    /**
     * Gửi thông báo khi có booking mới
     * Fire-and-forget: không block UI nếu thất bại
     */
    async notifyNewBooking(booking: Booking): Promise<void> {
        try {
            const settings = await settingsService.getAppSettings();
            const webhookEnabled = settings?.webhookEnabled;
            const webhookUrl = settings?.webhookUrl;
            const emailEnabled = settings?.emailEnabled;
            const notificationEmail = settings?.notificationEmail;

            if (!webhookEnabled && !emailEnabled) return;

            const payload: BookingNotificationPayload = {
                type: 'new_booking',
                booking,
                timestamp: new Date().toISOString(),
            };

            if (webhookEnabled && webhookUrl) {
                this._sendWebhook(webhookUrl, payload).catch(err =>
                    console.warn('[BookingNotify] Webhook failed:', err.message)
                );
            }

            if (emailEnabled && notificationEmail) {
                this._sendEmailNotification(notificationEmail, payload).catch(err =>
                    console.warn('[BookingNotify] Email failed:', err.message)
                );
            }
        } catch (err) {
            console.warn('[BookingNotify] notifyNewBooking failed:', err);
        }
    },

    /**
     * Gửi thông báo khi status thay đổi
     */
    async notifyStatusChange(booking: Booking, oldStatus: BookingStatus, newStatus: BookingStatus): Promise<void> {
        try {
            const settings = await settingsService.getAppSettings();
            const webhookEnabled = settings?.webhookEnabled;
            const webhookUrl = settings?.webhookUrl;
            const emailEnabled = settings?.emailEnabled;
            const notificationEmail = settings?.notificationEmail;

            if (!webhookEnabled && !emailEnabled) return;

            // Nếu chuyển sang confirmed → gửi webhook xác nhận đặc biệt
            const isConfirmation = newStatus === 'confirmed';

            const payload: BookingNotificationPayload = {
                type: isConfirmation ? 'booking_confirmed' : 'status_change',
                booking,
                oldStatus,
                newStatus,
                timestamp: new Date().toISOString(),
            };

            // Thêm tin nhắn xác nhận đã format sẵn
            if (isConfirmation) {
                payload.confirmationMessage = this._buildConfirmationMessage(booking);
            }

            if (webhookEnabled && webhookUrl) {
                this._sendWebhook(webhookUrl, payload).catch(err =>
                    console.warn('[BookingNotify] Webhook failed:', err.message)
                );
            }

            if (emailEnabled && notificationEmail) {
                this._sendEmailNotification(notificationEmail, payload).catch(err =>
                    console.warn('[BookingNotify] Email failed:', err.message)
                );
            }
        } catch (err) {
            console.warn('[BookingNotify] notifyStatusChange failed:', err);
        }
    },

    /**
     * Tạo nội dung tin nhắn xác nhận đặt bàn — dùng để gửi trực tiếp cho khách
     */
    _buildConfirmationMessage(booking: Booking): string {
        const name = booking.customerName || 'Quý Khách';
        // Format date DD/MM/YYYY
        let dateStr = '';
        if (booking.bookingDate) {
            const parts = booking.bookingDate.split('-'); // YYYY-MM-DD
            dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : booking.bookingDate;
        }
        const timeStr = booking.time || '';
        const pax = booking.pax || 0;
        const tableName = booking.tableName || '';
        const area = booking.area ? (AREA_LABELS[booking.area] || booking.area) : '';
        const tableInfo = tableName ? `${tableName}${area ? ` (${area})` : ''}` : (area || 'Chưa xếp bàn');

        // Menu info
        let menuStr = '';
        if (booking.selectedMenus && booking.selectedMenus.length > 0) {
            menuStr = booking.selectedMenus
                .map((m: any) => m.name || m.title || m)
                .join(', ');
        }

        // Notes
        const notesStr = (booking.notes && booking.notes.length > 0)
            ? booking.notes.join('\n')
            : '';

        const lines: string[] = [
            `✅ Đặt bàn đã được XÁC NHẬN — Maison Vie`,
            ``,
            `Chào ${name},`,
            ``,
            `Đặt bàn của bạn đã được xác nhận thành công! 🎉`,
            ``,
            `📅 Ngày: ${dateStr}`,
            `⏰ Giờ: ${timeStr}`,
            `👥 Số khách: ${pax} người`,
            `🪑 Bàn: ${tableInfo}`,
        ];

        if (menuStr) {
            lines.push(`🍽️ Menu: ${menuStr}`);
        }

        if (notesStr) {
            lines.push(`📌 Ghi chú: ${notesStr}`);
        }

        lines.push(
            ``,
            `Vui lòng đến trước 15 phút.`,
            `Nếu thay đổi, xin báo trước ít nhất 2 tiếng.`,
            ``,
            `Rất mong được phục vụ bạn! 🙏`,
        );

        return lines.join('\n');
    },

    /**
     * Gửi test notification
     */
    async sendTestNotification(configOverride?: {
        webhookEnabled: boolean;
        webhookUrl: string;
        emailEnabled: boolean;
        notificationEmail: string;
    }): Promise<{ success: boolean; message: string }> {
        try {
            // Use override config (from UI) if provided, otherwise read from DB
            const settings = configOverride || await settingsService.getAppSettings();
            const wEnabled = !!settings?.webhookEnabled;
            const wUrl = settings?.webhookUrl || '';
            const eEnabled = !!settings?.emailEnabled;
            const eEmail = settings?.notificationEmail || '';

            const results: string[] = [];

            const testBooking = {
                id: 'test-' + Date.now(),
                customerName: 'Khách Test',
                phone: '0901234567',
                email: 'test@example.com',
                pax: 4,
                bookingDate: new Date().toISOString().split('T')[0],
                time: '18:00',
                status: 'new' as BookingStatus,
                source: 'web',
                customerType: 'retail',
                notes: [],
                selectedMenus: [],
            };

            if (wEnabled && wUrl) {
                try {
                    await this._sendWebhook(wUrl, {
                        type: 'new_booking',
                        booking: testBooking,
                        timestamp: new Date().toISOString(),
                    });
                    results.push('✅ Webhook: Gửi thành công');
                } catch (err: any) {
                    results.push(`❌ Webhook: ${err.message}`);
                }
            } else {
                results.push('⏭️ Webhook: Đã tắt hoặc chưa cấu hình URL');
            }

            if (eEnabled && eEmail) {
                try {
                    await this._sendEmailNotification(eEmail, {
                        type: 'new_booking',
                        booking: testBooking,
                        timestamp: new Date().toISOString(),
                    });
                    results.push('✅ Email: Gửi thành công');
                } catch (err: any) {
                    results.push(`❌ Email: ${err.message}`);
                }
            } else {
                results.push('⏭️ Email: Đã tắt hoặc chưa cấu hình');
            }

            return { success: true, message: results.join('\n') };
        } catch (err: any) {
            return { success: false, message: `Lỗi: ${err.message}` };
        }
    },

    /**
     * Gửi POST request tới webhook URL
     */
    async _sendWebhook(url: string, payload: BookingNotificationPayload): Promise<void> {
        // Try normal fetch first; if CORS blocks it, retry with no-cors
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error(`Webhook HTTP ${res.status}: ${res.statusText}`);
            }
        } catch (err: any) {
            // CORS error or network error — retry with no-cors (opaque response, but data IS sent)
            if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
                await fetch(url, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                // no-cors returns opaque response (status 0), can't verify success
                // but request WILL be sent — Make/Zapier/Slack will receive it
                return;
            }
            throw err;
        }
    },

    /**
     * Gửi email notification qua serverless function
     */
    async _sendEmailNotification(email: string, payload: BookingNotificationPayload): Promise<void> {
        const statusLabel = payload.type === 'status_change' && payload.newStatus
            ? STATUS_LABELS[payload.newStatus] || payload.newStatus
            : '';
        const oldStatusLabel = payload.oldStatus ? (STATUS_LABELS[payload.oldStatus] || payload.oldStatus) : '';

        const res = await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                type: payload.type,
                booking: payload.booking,
                statusLabel,
                oldStatusLabel,
            }),
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => 'Unknown error');
            throw new Error(`Email API ${res.status}: ${errBody}`);
        }
    },
};
