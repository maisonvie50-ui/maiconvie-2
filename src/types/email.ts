/**
 * Email types — dùng chung cho SMTP và email template system
 */

export type EmailEventType =
    | 'new_booking'          // Booking mới
    | 'booking_confirmed'    // Xác nhận booking
    | 'status_change'        // Đổi trạng thái
    | 'booking_cancelled'    // Hủy booking
    | 'booking_reminder';    // Nhắc lịch (tương lai)

export type EmailChannel = 'internal' | 'customer';

export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export interface SmtpSendRequest {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
}

export interface SmtpSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface SmtpTestResult {
    success: boolean;
    message: string;
    details?: string;
}
