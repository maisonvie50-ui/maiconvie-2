/**
 * Email Notification Service — điều phối gửi email SMTP.
 *
 * Nhận event booking → quyết định gửi email nào → gọi API backend.
 * Tách riêng khỏi webhook để hai hệ thống hoạt động song song.
 */

import { Booking, BookingStatus } from '../types/booking';
import { SmtpSendResult } from '../types/email';
import { emailTemplateService } from './emailTemplateService';
import { settingsService } from './settingsService';

export const emailNotificationService = {

    /**
     * Gửi email nội bộ khi có booking mới
     */
    async notifyNewBookingInternal(booking: Booking, settings?: any): Promise<void> {
        try {
            const s = settings || await settingsService.getAppSettings();
            if (!s?.smtpEnabled) return;

            const internalEmail = s?.internalNotificationEmail || s?.notificationEmail;
            if (!internalEmail) return;

            const config = {
                internalNewTitle: s?.emailTemplateInternalNewTitle,
                internalNewBody: s?.emailTemplateInternalNewBody,
            };

            const template = emailTemplateService.buildNewBookingInternal(booking, config);
            await this._sendViaApi({
                to: internalEmail,
                ...template,
            });
        } catch (err) {
            console.warn('[EmailNotify] notifyNewBookingInternal failed:', err);
        }
    },

    async sendCustomerPending(booking: Booking, settings?: any): Promise<void> {
        try {
            const s = settings || await settingsService.getAppSettings();
            if (!s?.smtpEnabled) return;
            if (!s?.sendCustomerEmail) return;

            const customerEmail = booking.email;
            if (!customerEmail) {
                console.warn('[EmailNotify] No customer email, skipping pending notice');
                return;
            }

            const config = {
                customerPendingBody: s?.emailTemplateCustomerPendingBody,
            };

            const template = emailTemplateService.buildCustomerPending(booking, config);
            await this._sendViaApi({
                to: customerEmail,
                ...template,
            });
        } catch (err) {
            console.warn('[EmailNotify] sendCustomerPending failed:', err);
        }
    },

    /**
     * Gửi email xác nhận cho khách khi booking confirmed
     */
    async sendCustomerConfirmation(booking: Booking, settings?: any): Promise<void> {
        try {
            const s = settings || await settingsService.getAppSettings();
            if (!s?.smtpEnabled) return;
            if (!s?.sendCustomerEmail) return;

            const customerEmail = booking.email;
            if (!customerEmail) {
                console.warn('[EmailNotify] No customer email, skipping confirmation');
                return;
            }

            const config = {
                customerConfirmBody: s?.emailTemplateCustomerConfirmBody,
                customerConfirmGreeting: s?.emailTemplateCustomerConfirmGreeting,
                customerConfirmFooter: s?.emailTemplateCustomerConfirmFooter,
            };

            const template = emailTemplateService.buildCustomerConfirmation(booking, config);
            await this._sendViaApi({
                to: customerEmail,
                ...template,
            });
        } catch (err) {
            console.warn('[EmailNotify] sendCustomerConfirmation failed:', err);
        }
    },

    /**
     * Gửi email hủy cho khách
     */
    async sendCustomerCancellation(booking: Booking, settings?: any): Promise<void> {
        try {
            const s = settings || await settingsService.getAppSettings();
            if (!s?.smtpEnabled) return;
            if (!s?.sendCustomerEmail) return;

            const customerEmail = booking.email;
            if (!customerEmail) return;

            const config = {
                customerCancelBody: s?.emailTemplateCustomerCancelBody,
            };

            const template = emailTemplateService.buildCustomerCancellation(booking, config);
            await this._sendViaApi({
                to: customerEmail,
                ...template,
            });
        } catch (err) {
            console.warn('[EmailNotify] sendCustomerCancellation failed:', err);
        }
    },

    /**
     * Gửi email nội bộ khi đổi trạng thái
     */
    async notifyStatusChangeInternal(booking: Booking, oldStatus: BookingStatus, newStatus: BookingStatus, settings?: any): Promise<void> {
        try {
            const s = settings || await settingsService.getAppSettings();
            if (!s?.smtpEnabled) return;

            const internalEmail = s?.internalNotificationEmail || s?.notificationEmail;
            if (!internalEmail) return;

            const config = {
                internalStatusChangeBody: s?.emailTemplateInternalStatusChangeBody,
            };

            const template = emailTemplateService.buildStatusChangeInternal(booking, oldStatus, newStatus, config);
            await this._sendViaApi({
                to: internalEmail,
                ...template,
            });
        } catch (err) {
            console.warn('[EmailNotify] notifyStatusChangeInternal failed:', err);
        }
    },

    /**
     * Xử lý tổng hợp: nhận event → gọi đúng email
     */
    async handleBookingEvent(
        type: 'new_booking' | 'status_change' | 'booking_confirmed',
        booking: Booking,
        oldStatus?: BookingStatus,
        newStatus?: BookingStatus
    ): Promise<void> {
        try {
            // Load settings ONCE and pass down to avoid duplicate fetches / RLS issues
            const settings = await settingsService.getAppSettings();
            console.log('[EmailNotify] handleBookingEvent', type, 'smtpEnabled=', settings?.smtpEnabled, 'sendCustomerEmail=', settings?.sendCustomerEmail, 'email=', booking.email);

            if (type === 'new_booking') {
                // Gửi email nội bộ cho quản lý
                await this.notifyNewBookingInternal(booking, settings);
                // Gửi email cho khách báo đã nhận yêu cầu
                await this.sendCustomerPending(booking, settings);
            }

            if (type === 'booking_confirmed') {
                // Gửi email xác nhận cho khách
                await this.sendCustomerConfirmation(booking, settings);
                // Gửi email nội bộ thông báo trạng thái đã xác nhận
                if (oldStatus && newStatus) {
                    await this.notifyStatusChangeInternal(booking, oldStatus, newStatus, settings);
                }
            }

            if (type === 'status_change' && oldStatus && newStatus) {
                // Gửi email nội bộ khi đổi trạng thái
                await this.notifyStatusChangeInternal(booking, oldStatus, newStatus, settings);

                // Nếu hủy → gửi email cho khách
                if (newStatus === 'cancelled') {
                    await this.sendCustomerCancellation(booking, settings);
                }
            }
        } catch (err) {
            console.warn('[EmailNotify] handleBookingEvent failed:', err);
        }
    },

    /**
     * Test SMTP — gọi API test endpoint
     */
    async testSmtp(): Promise<SmtpSendResult> {
        try {
            const res = await fetch('/api/email/test-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            return data;
        } catch (err: any) {
            return { success: false, error: `Lỗi kết nối: ${err.message}` };
        }
    },

    /**
     * Gửi email qua API backend (Vercel serverless)
     */
    async _sendViaApi(payload: {
        to: string | string[];
        subject: string;
        html: string;
        text?: string;
    }): Promise<SmtpSendResult> {
        const res = await fetch('/api/email/send-booking-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => 'Unknown error');
            throw new Error(`Email API ${res.status}: ${errBody}`);
        }

        return await res.json();
    },
};
