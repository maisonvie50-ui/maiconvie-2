/**
 * Email Template Service — tách riêng template khỏi logic gửi.
 * Mỗi loại email có hàm build riêng, dễ mở rộng thêm mẫu mới.
 */

import { Booking, BookingStatus } from '../types/booking';
import { EmailTemplate } from '../types/email';

const STATUS_LABELS: Record<string, string> = {
    new: 'New',
    pending: 'Pending confirmation',
    waiting_info: 'Waiting for information',
    confirmed: 'Confirmed',
    arrived: 'Arrived',
    seated: 'Seated',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No show',
    change_requested: 'Change requested',
};

const AREA_LABELS: Record<string, string> = {
    indoor: 'Indoor',
    outdoor: 'Outdoor',
    vip: 'VIP Room',
    rooftop: 'Rooftop',
};

export interface EmailTemplatesConfig {
    customerPendingBody?: string;
    customerConfirmBody?: string;
    customerConfirmGreeting?: string;
    customerConfirmFooter?: string;
    customerCancelBody?: string;
    internalNewTitle?: string;
    internalNewBody?: string;
    internalStatusChangeBody?: string;
}

export function parseTemplate(template: string, booking: Booking): string {
    if (!template) return '';
    return template
        .replace(/{{customerName}}/g, booking.customerName || 'Guest')
        .replace(/{{pax}}/g, String(booking.pax || 0))
        .replace(/{{time}}/g, booking.time || '')
        .replace(/{{date}}/g, formatDate(booking.bookingDate))
        .replace(/{{phone}}/g, booking.phone || '')
        .replace(/{{table}}/g, tableInfo(booking))
        .replace(/{{menus}}/g, formatMenus(booking))
        .replace(/{{area}}/g, booking.area ? (AREA_LABELS[booking.area] || booking.area) : '')
        .replace(/{{status}}/g, booking.status ? (STATUS_LABELS[booking.status] || booking.status) : '');
}

function parseStatusTemplate(template: string, booking: Booking, oldStatus: BookingStatus, newStatus: BookingStatus): string {
    const oldLabel = STATUS_LABELS[oldStatus] || oldStatus;
    const newLabel = STATUS_LABELS[newStatus] || newStatus;
    return parseTemplate(template, booking)
        .replace(/{{oldStatus}}/g, oldLabel)
        .replace(/{{newStatus}}/g, newLabel);
}

export function applyHtmlTemplate(template: string, booking: Booking): string {
    const text = parseTemplate(template, booking);
    return text.replace(/\n/g, '<br/>');
}

// ─── Helper ─────────────────────────────────────────────────────────
function formatDate(date?: string): string {
    if (!date) return '—';
    const parts = date.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
}

function formatMenus(booking: Booking): string {
    if (!booking.selectedMenus || booking.selectedMenus.length === 0) return 'Not selected';
    return booking.selectedMenus
        .map((m: any) => {
            const qty = m?.quantity || m?.qty || 1;
            const name = m?.name || m?.title || m;
            return `${qty}x ${name}`;
        })
        .join(', ');
}

function esc(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function tableInfo(booking: Booking): string {
    const name = booking.tableName || '';
    const area = booking.area ? (AREA_LABELS[booking.area] || booking.area) : '';
    return name ? `${name}${area ? ` (${area})` : ''}` : (area || 'Not assigned yet');
}

// ─── Brand CSS tokens ───────────────────────────────────────────────
const BRAND = {
    teal: '#0d9488',
    green: '#16a34a',
    amber: '#f59e0b',
    red: '#dc2626',
    bg: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
};

// ─── Shared HTML wrapper ────────────────────────────────────────────
function wrapHtml(title: string, accent: string, bodyContent: string): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:${BRAND.card};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 12px 40px rgba(15,23,42,.07);">
    <div style="background:${accent};color:#fff;padding:28px 32px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.8;">Maison Vie Restaurant</div>
        <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:700;">${esc(title)}</h1>
    </div>
    <div style="padding:28px 32px;">
        ${bodyContent}
        <p style="margin:24px 0 0;color:${BRAND.textMuted};font-size:11px;">This is an automated email from Maison Vie. Please do not reply to this email.</p>
    </div>
</div>
</body>
</html>`.trim();
}

function infoRow(label: string, value: string): string {
    return `
    <tr>
        <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;color:${BRAND.textSecondary};font-size:13px;width:140px;">${esc(label)}</td>
        <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;color:${BRAND.textPrimary};font-size:14px;font-weight:600;">${esc(value)}</td>
    </tr>`;
}

function bookingTable(booking: Booking): string {
    const rows = [
        infoRow('Guest name', booking.customerName || '—'),
        infoRow('Phone', booking.phone || '—'),
        infoRow('Email', booking.email || '—'),
        infoRow('Date', formatDate(booking.bookingDate)),
        infoRow('Time', booking.time || '—'),
        infoRow('Guests', `${booking.pax || 0} guests`),
        infoRow('Area', booking.area ? (AREA_LABELS[booking.area] || booking.area) : '—'),
        infoRow('Table', tableInfo(booking)),
        infoRow('Menu', formatMenus(booking)),
    ];
    if (booking.notes && booking.notes.length > 0) {
        rows.push(infoRow('Notes', booking.notes.join(', ')));
    }
    return `<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">${rows.join('')}</table>`;
}

// ─── Exported templates ─────────────────────────────────────────────

export const emailTemplateService = {

    /**
     * 1. Email nội bộ: Booking mới
     */
    buildNewBookingInternal(booking: Booking, config?: EmailTemplatesConfig): EmailTemplate {
        const customTitle = config?.internalNewTitle ? parseTemplate(config.internalNewTitle, booking) : '🔔 NEW BOOKING';
        const customBody = config?.internalNewBody
            ? parseTemplate(config.internalNewBody, booking)
            : [
                `Guest name: ${booking.customerName || '—'}`,
                `Phone: ${booking.phone || '—'}`,
                `Email: ${booking.email || '—'}`,
                `Date: ${formatDate(booking.bookingDate)}`,
                `Time: ${booking.time || '—'}`,
                `Guests: ${booking.pax || 0}`,
                `Table: ${tableInfo(booking)}`,
                `Menu: ${formatMenus(booking)}`,
            ].join('\n');
        const subject = `🔔 New booking: ${booking.customerName || 'Guest'} — ${booking.pax || 0} guests — ${booking.time || ''}`;
        const html = wrapHtml(customTitle, BRAND.teal, `<p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.textPrimary};white-space:pre-line;">${applyHtmlTemplate(customBody, booking)}</p>`);
        const text = [customTitle, '', customBody].join('\n');
        return { subject, html, text };
    },

    buildCustomerPending(booking: Booking, config?: EmailTemplatesConfig): EmailTemplate {
        const name = booking.customerName || 'Guest';
        const defaultBody = `[BOOKING REQUEST RECEIVED]\n\nDear ${name},\n\nWe have received your table reservation request.\nYour booking is currently pending confirmation and our team will confirm it as soon as possible.\n\nBooking details:\n- Date: ${formatDate(booking.bookingDate)}\n- Time: ${booking.time || ''}\n- Number of guests: ${booking.pax || 0}\n- Table: ${tableInfo(booking)}\n- Menu: ${formatMenus(booking)}\n\nIf you need urgent assistance, please contact Maison Vie.`;
        const bodyText = config?.customerPendingBody ? parseTemplate(config.customerPendingBody, booking) : defaultBody;
        const subject = `✨ Reservation request received — Maison Vie`;
        const html = wrapHtml('✅ RESERVATION REQUEST RECEIVED', BRAND.teal, `<p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.textPrimary};white-space:pre-line;">${applyHtmlTemplate(bodyText, booking)}</p>`);
        const text = bodyText;
        return { subject, html, text };
    },

    /**
     * 2. Email cho khách: Xác nhận đặt bàn
     */
    buildCustomerConfirmation(booking: Booking, config?: EmailTemplatesConfig): EmailTemplate {
        const name = booking.customerName || 'Guest';
        const subject = `✅ Reservation confirmed — Maison Vie`;

        const defaultBody = `[RESERVATION CONFIRMED]\n\nDear ${name},\n\nYour table reservation has been confirmed.\n\nBooking details:\n- Date: ${formatDate(booking.bookingDate)}\n- Time: ${booking.time || ''}\n- Number of guests: ${booking.pax || 0}\n- Table: ${tableInfo(booking)}\n- Menu: ${formatMenus(booking)}\n\nPlease arrive 15 minutes early.\nThank you for choosing Maison Vie.`;
        const bodyText = config?.customerConfirmBody
            ? parseTemplate(config.customerConfirmBody, booking)
            : defaultBody;

        const html = wrapHtml('✅ RESERVATION CONFIRMED', BRAND.green, `
            <p style="font-size:15px;color:${BRAND.textPrimary};line-height:1.7;margin:0;white-space:pre-line;">${applyHtmlTemplate(bodyText, booking)}</p>
        `);

        const text = bodyText;

        return { subject, html, text };
    },

    /**
     * 3. Email nội bộ: Đổi trạng thái
     */
    buildStatusChangeInternal(booking: Booking, oldStatus: BookingStatus, newStatus: BookingStatus, config?: EmailTemplatesConfig): EmailTemplate {
        const oldLabel = STATUS_LABELS[oldStatus] || oldStatus;
        const newLabel = STATUS_LABELS[newStatus] || newStatus;
        const subject = `📋 Booking update: ${booking.customerName || 'Guest'} — ${oldLabel} → ${newLabel}`;

        const defaultBody = `[BOOKING STATUS UPDATED]\n\nGuest name: ${booking.customerName || '—'}\nPrevious status: ${oldLabel}\nNew status: ${newLabel}\n\nBooking details:\n- Date: ${formatDate(booking.bookingDate)}\n- Time: ${booking.time || '—'}\n- Number of guests: ${booking.pax || 0}\n- Table: ${tableInfo(booking)}\n- Menu: ${formatMenus(booking)}`;
        const bodyText = config?.internalStatusChangeBody
            ? parseStatusTemplate(config.internalStatusChangeBody, booking, oldStatus, newStatus)
            : defaultBody;

        const html = wrapHtml(`📋 BOOKING UPDATE: ${oldLabel} → ${newLabel}`, BRAND.amber, `
            <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.textPrimary};white-space:pre-line;">${bodyText.replace(/\n/g, '<br/>')}</p>
        `);

        const text = bodyText;

        return { subject, html, text };
    },

    /**
     * 4. Email cho khách: Hủy booking
     */
    buildCustomerCancellation(booking: Booking, config?: EmailTemplatesConfig): EmailTemplate {
        const name = booking.customerName || 'Guest';
        const subject = `❌ Reservation cancelled — Maison Vie`;

        const defaultBody = `Dear ${name},\n\nWe are sorry to inform you that your table reservation has been cancelled.\n\nBooking details:\n- Date: ${formatDate(booking.bookingDate)}\n- Time: ${booking.time || ''}\n- Number of guests: ${booking.pax || 0}\n- Table: ${tableInfo(booking)}\n- Menu: ${formatMenus(booking)}`;
        const bodyText = config?.customerCancelBody ? parseTemplate(config.customerCancelBody, booking) : defaultBody;

        const html = wrapHtml('❌ RESERVATION CANCELLED', BRAND.red, `
            <p style="font-size:15px;color:${BRAND.textPrimary};line-height:1.7;margin:0 0 20px;white-space:pre-line;">${applyHtmlTemplate(bodyText, booking)}</p>
            ${bookingTable(booking)}
            <div style="margin-top:20px;padding:16px 18px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;">
                <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
                    If you would like to make a new reservation, please visit:<br/>
                    <a href="https://app.maisonvie.vn/dat-ban-online" style="color:#0d9488;font-weight:600;">app.maisonvie.vn/dat-ban-online</a>
                </p>
            </div>
        `);

        const text = [
            '❌ Reservation cancelled — Maison Vie',
            '',
            bodyText,
            '',
            `📅 Date: ${formatDate(booking.bookingDate)}`,
            `⏰ Time: ${booking.time || ''}`,
            `👥 Guests: ${booking.pax || 0}`,
            '',
            'If you would like to make a new reservation, please visit: https://app.maisonvie.vn/dat-ban-online',
        ].join('\n');

        return { subject, html, text };
    },
};
