import { Booking, BookingStatus } from '../types/booking';
import { settingsService } from './settingsService';
import { emailNotificationService } from './emailNotificationService';

const BATCH_CONFIRMATION_DELAY_MS = 10_000;
type ConfirmationBatch = {
    bookings: Booking[];
    timer: ReturnType<typeof setTimeout>;
    oldStatus?: BookingStatus;
    newStatus?: BookingStatus;
};
const confirmationBatches = new Map<string, ConfirmationBatch>();

function normalizeEmail(email?: string): string {
    return String(email || '').trim().toLowerCase();
}

function getBookingBatchKey(booking: Booking): string {
    const email = normalizeEmail(booking.email);
    const seriesKey = String(booking.confirmationSeriesKey || '').trim().toLowerCase();
    if (email && seriesKey) return `${email}__series:${seriesKey}`;
    return email || `booking:${booking.id}`;
}

export interface BookingNotificationPayload {
    type: 'new_booking' | 'status_change' | 'booking_confirmed';
    booking: Booking;
    oldStatus?: BookingStatus;
    newStatus?: BookingStatus;
    timestamp: string;
    /** Tin nhắn xác nhận đã format sẵn — dùng để gửi trực tiếp cho khách qua SMS/Zalo/Email */
    confirmationMessage?: string;
    /** Subject dựng sẵn cho Make/Zapier/n8n/email automation */
    email_subject?: string;
    /** Nội dung HTML dựng sẵn cho webhook automation */
    email_html?: string;
    /** Nội dung text dựng sẵn cho webhook automation */
    email_text?: string;
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
            const smtpEnabled = settings?.smtpEnabled;

            if (!webhookEnabled && !emailEnabled && !smtpEnabled) return;

            const payload: BookingNotificationPayload = {
                type: 'new_booking',
                booking,
                timestamp: new Date().toISOString(),
            };

            if (webhookEnabled && webhookUrl) {
                const webhookPayload = this._withEmailTemplates(payload);
                this._sendWebhook(webhookUrl, webhookPayload).catch(err =>
                    console.warn('[BookingNotify] Webhook failed:', err.message)
                );
            }

            if (emailEnabled && notificationEmail) {
                this._sendEmailNotification(notificationEmail, payload).catch(err =>
                    console.warn('[BookingNotify] Email failed:', err.message)
                );
            }

            // Fire-and-forget: gửi email SMTP tự động (song song với webhook)
            emailNotificationService.handleBookingEvent('new_booking', booking).catch(err =>
                console.warn('[BookingNotify] SMTP email failed:', err)
            );
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
            const smtpEnabled = settings?.smtpEnabled;

            if (!webhookEnabled && !emailEnabled && !smtpEnabled) return;

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

            const useSmtpCustomerFlow = !!settings?.smtpEnabled && !!settings?.sendCustomerEmail;
            const legacyPayload: BookingNotificationPayload = isConfirmation && useSmtpCustomerFlow
                ? {
                    type: 'status_change',
                    booking,
                    oldStatus,
                    newStatus,
                    timestamp: payload.timestamp,
                }
                : payload;

            if (webhookEnabled && webhookUrl) {
                const webhookPayload = this._withEmailTemplates(legacyPayload);
                this._sendWebhook(webhookUrl, webhookPayload).catch(err =>
                    console.warn('[BookingNotify] Webhook failed:', err.message)
                );
            }

            if (emailEnabled && notificationEmail) {
                this._sendEmailNotification(notificationEmail, legacyPayload).catch(err =>
                    console.warn('[BookingNotify] Email failed:', err.message)
                );
            }

            // Fire-and-forget: gửi email SMTP tự động (song song với webhook)
            if (isConfirmation) {
                this._queueCustomerConfirmation(booking, oldStatus, newStatus);
            } else {
                emailNotificationService.handleBookingEvent(
                    'status_change',
                    booking,
                    oldStatus,
                    newStatus
                ).catch(err =>
                    console.warn('[BookingNotify] SMTP email failed:', err)
                );
            }
        } catch (err) {
            console.warn('[BookingNotify] notifyStatusChange failed:', err);
        }
    },

    _queueCustomerConfirmation(booking: Booking, oldStatus?: BookingStatus, newStatus?: BookingStatus): void {
        const key = getBookingBatchKey(booking);
        const existing = confirmationBatches.get(key);

        if (existing) {
            clearTimeout(existing.timer);
            const alreadyQueued = existing.bookings.some(item => item.id === booking.id);
            const bookings = alreadyQueued
                ? existing.bookings.map(item => item.id === booking.id ? booking : item)
                : [...existing.bookings, booking];

            const timer = setTimeout(() => {
                this._flushCustomerConfirmationBatch(key).catch(err =>
                    console.warn('[BookingNotify] Batch confirmation flush failed:', err)
                );
            }, BATCH_CONFIRMATION_DELAY_MS);

            confirmationBatches.set(key, { bookings, timer, oldStatus, newStatus });
            return;
        }

        const timer = setTimeout(() => {
            this._flushCustomerConfirmationBatch(key).catch(err =>
                console.warn('[BookingNotify] Batch confirmation flush failed:', err)
            );
        }, BATCH_CONFIRMATION_DELAY_MS);

        confirmationBatches.set(key, { bookings: [booking], timer, oldStatus, newStatus });
    },

    async _flushCustomerConfirmationBatch(key: string): Promise<void> {
        const batch = confirmationBatches.get(key);
        if (!batch) return;
        confirmationBatches.delete(key);

        const settings = await settingsService.getAppSettings();
        const uniqueBookings = Array.from(
            new Map(batch.bookings.map(booking => [booking.id, booking])).values()
        );

        if (uniqueBookings.length > 1) {
            await emailNotificationService.sendBatchConfirmation(uniqueBookings, settings);
            if (batch.oldStatus && batch.newStatus) {
                await Promise.all(uniqueBookings.map(booking =>
                    emailNotificationService.notifyStatusChangeInternal(
                        booking,
                        batch.oldStatus as BookingStatus,
                        batch.newStatus as BookingStatus,
                        settings
                    )
                ));
            }
            return;
        }

        const single = uniqueBookings[0];
        if (single) {
            await emailNotificationService.handleBookingEvent(
                'booking_confirmed',
                single,
                batch.oldStatus,
                batch.newStatus
            );
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
                    const testPayload: BookingNotificationPayload = this._withEmailTemplates({
                        type: 'new_booking',
                        booking: testBooking,
                        timestamp: new Date().toISOString(),
                    });
                    await this._sendWebhook(wUrl, testPayload);
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
     * Build thêm các template email/text vào payload webhook — khôi phục từ dist-backup.
     * Nếu template lỗi, vẫn trả payload gốc để không làm gián đoạn webhook.
     */
    _withEmailTemplates(payload: BookingNotificationPayload): BookingNotificationPayload {
        try {
            return {
                ...payload,
                email_subject: this._buildEmailSubject(payload),
                email_html: this._buildNotificationEmailHtml(payload),
                email_text: this._buildNotificationEmailText(payload),
            };
        } catch (err) {
            console.warn('[BookingNotify] Email template build failed:', err);
            return payload;
        }
    },

    _formatBookingDate(date?: string): string {
        if (!date) return '';
        const parts = date.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
    },

    _formatSelectedMenus(booking: Booking): string {
        if (!booking.selectedMenus || booking.selectedMenus.length === 0) return 'Chưa chọn';
        return booking.selectedMenus
            .map((menu: any) => {
                const quantity = menu?.quantity || menu?.qty || 1;
                const name = menu?.name || menu?.title || menu;
                return `${quantity}x ${name}`;
            })
            .join(', ');
    },

    _escapeHtml(value: unknown): string {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    _buildEmailSubject(payload: BookingNotificationPayload): string {
        const booking = payload.booking;
        const name = booking.customerName || 'Khách';
        const pax = booking.pax || 0;
        const time = booking.time || '';

        if (payload.type === 'new_booking') {
            return `🔔 Booking mới: ${name} — ${pax} khách — ${time}`;
        }
        if (payload.type === 'booking_confirmed') {
            return `✅ Đã xác nhận: ${name} — ${pax} khách — ${time}`;
        }

        const oldStatus = payload.oldStatus ? (STATUS_LABELS[payload.oldStatus] || payload.oldStatus) : '';
        const newStatus = payload.newStatus ? (STATUS_LABELS[payload.newStatus] || payload.newStatus) : '';
        return `📋 ${name}: ${oldStatus} → ${newStatus}`;
    },

    _buildNotificationEmailText(payload: BookingNotificationPayload): string {
        const booking = payload.booking;
        const isNew = payload.type === 'new_booking';
        const isConfirmed = payload.type === 'booking_confirmed';
        const oldStatus = payload.oldStatus ? (STATUS_LABELS[payload.oldStatus] || payload.oldStatus) : '';
        const newStatus = payload.newStatus ? (STATUS_LABELS[payload.newStatus] || payload.newStatus) : '';
        const dateStr = this._formatBookingDate(booking.bookingDate);
        const menuStr = this._formatSelectedMenus(booking);
        const areaStr = booking.area ? (AREA_LABELS[booking.area] || booking.area) : '—';

        const lines = [
            isNew ? '🔔 BOOKING MỚI — Maison Vie' : isConfirmed ? '✅ ĐÃ XÁC NHẬN — Maison Vie' : `📋 CẬP NHẬT: ${oldStatus} → ${newStatus}`,
            '',
            `Khách hàng: ${booking.customerName || '—'}`,
            `Số điện thoại: ${booking.phone || '—'}`,
            `Email: ${booking.email || '—'}`,
            `Ngày: ${dateStr || '—'}`,
            `Giờ: ${booking.time || '—'}`,
            `Số khách: ${booking.pax || 0} khách`,
            `Khu vực: ${areaStr}`,
            `Bàn: ${booking.tableName || '—'}`,
            `Nguồn: ${booking.source || '—'}`,
            `Menu: ${menuStr}`,
        ];

        if (booking.notes && booking.notes.length > 0) {
            lines.push(`Ghi chú: ${booking.notes.join(', ')}`);
        }
        if (payload.confirmationMessage) {
            lines.push('', 'Tin nhắn xác nhận:', payload.confirmationMessage);
        }

        return lines.join('\n');
    },

    _buildNotificationEmailHtml(payload: BookingNotificationPayload): string {
        const booking = payload.booking;
        const isNew = payload.type === 'new_booking';
        const isConfirmed = payload.type === 'booking_confirmed';
        const oldStatus = payload.oldStatus ? (STATUS_LABELS[payload.oldStatus] || payload.oldStatus) : '';
        const newStatus = payload.newStatus ? (STATUS_LABELS[payload.newStatus] || payload.newStatus) : '';
        const title = isNew ? '🔔 BOOKING MỚI' : isConfirmed ? '✅ ĐÃ XÁC NHẬN' : `📋 CẬP NHẬT: ${oldStatus} → ${newStatus}`;
        const accent = isConfirmed ? '#16a34a' : isNew ? '#0d9488' : '#f59e0b';
        const dateStr = this._formatBookingDate(booking.bookingDate) || '—';
        const menuStr = this._formatSelectedMenus(booking);
        const areaStr = booking.area ? (AREA_LABELS[booking.area] || booking.area) : '—';
        const noteStr = booking.notes && booking.notes.length > 0 ? booking.notes.join(', ') : '—';
        const rows = [
            ['Khách hàng', booking.customerName || '—'],
            ['Số điện thoại', booking.phone || '—'],
            ['Email', booking.email || '—'],
            ['Ngày', dateStr],
            ['Giờ', booking.time || '—'],
            ['Số khách', `${booking.pax || 0} khách`],
            ['Khu vực', areaStr],
            ['Bàn', booking.tableName || '—'],
            ['Nguồn', booking.source || '—'],
            ['Menu', menuStr],
            ['Ghi chú', noteStr],
        ];

        const detailRows = rows.map(([label, value]) => `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;width:150px;">${this._escapeHtml(label)}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;font-weight:700;">${this._escapeHtml(value)}</td>
            </tr>
        `).join('');

        const confirmationBlock = payload.confirmationMessage ? `
            <div style="margin-top:18px;padding:14px 16px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;white-space:pre-line;color:#334155;font-size:14px;line-height:1.65;">
                ${this._escapeHtml(payload.confirmationMessage)}
            </div>
        ` : '';

        return `
            <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
                <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 45px rgba(15,23,42,.08);">
                    <div style="background:${accent};color:white;padding:24px 28px;">
                        <div style="font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;opacity:.86;">Maison Vie Restaurant</div>
                        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;">${this._escapeHtml(title)}</h1>
                    </div>
                    <div style="padding:24px 28px;">
                        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #edf2f7;border-radius:14px;overflow:hidden;">${detailRows}</table>
                        ${confirmationBlock}
                        <p style="margin-top:18px;color:#94a3b8;font-size:12px;">Webhook tự động từ hệ thống Maison Vie.</p>
                    </div>
                </div>
            </div>
        `;
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
