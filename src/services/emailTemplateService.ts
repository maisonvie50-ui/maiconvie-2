/**
 * Email Template Service — tách riêng template khỏi logic gửi.
 * Hỗ trợ song ngữ (vi / en) cho email khách hàng.
 * Email nội bộ luôn tiếng Việt.
 */

import { Booking, BookingStatus } from '../types/booking';
import { EmailTemplate } from '../types/email';

// ─── i18n labels ────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, Record<string, string>> = {
    vi: {
        new: 'Mới',
        pending: 'Chờ xác nhận',
        waiting_info: 'Chờ thông tin',
        confirmed: 'Đã xác nhận',
        arrived: 'Đã đến',
        seated: 'Đã ngồi',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        no_show: 'Không đến',
        change_requested: 'Yêu cầu đổi',
    },
    en: {
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
    },
};

const AREA_LABELS: Record<string, Record<string, string>> = {
    vi: { indoor: 'Trong nhà', outdoor: 'Ngoài trời', vip: 'Phòng VIP', rooftop: 'Sân thượng' },
    en: { indoor: 'Indoor', outdoor: 'Outdoor', vip: 'VIP Room', rooftop: 'Rooftop' },
};

const LABELS: Record<string, Record<string, string>> = {
    vi: {
        guestName: 'Tên khách',
        phone: 'Số điện thoại',
        email: 'Email',
        date: 'Ngày',
        time: 'Giờ',
        guests: 'Số khách',
        area: 'Khu vực',
        table: 'Bàn',
        menu: 'Thực đơn',
        notes: 'Ghi chú',
        notSelected: 'Chưa chọn',
        notAssigned: 'Chưa xếp bàn',
        guestUnit: 'khách',
        autoEmail: 'Đây là email tự động từ Maison Vie. Vui lòng không trả lời email này.',
        newBookingLink: 'Nếu bạn muốn đặt bàn mới, vui lòng truy cập:',
    },
    en: {
        guestName: 'Guest name',
        phone: 'Phone',
        email: 'Email',
        date: 'Date',
        time: 'Time',
        guests: 'Guests',
        area: 'Area',
        table: 'Table',
        menu: 'Menu',
        notes: 'Notes',
        notSelected: 'Not selected',
        notAssigned: 'Not assigned yet',
        guestUnit: 'guests',
        autoEmail: 'This is an automated email from Maison Vie. Please do not reply to this email.',
        newBookingLink: 'If you would like to make a new reservation, please visit:',
    },
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

function normalizeTemplateNewlines(value: string): string {
    return value.replace(/\\n/g, '\n');
}

function getLang(booking: Booking): 'vi' | 'en' {
    return booking.lang === 'en' ? 'en' : 'vi';
}

export function parseTemplate(template: string, booking: Booking, lang?: 'vi' | 'en'): string {
    if (!template) return '';
    const l = lang || getLang(booking);
    const statusLabels = STATUS_LABELS[l] || STATUS_LABELS.en;
    const areaLabels = AREA_LABELS[l] || AREA_LABELS.en;
    return normalizeTemplateNewlines(template)
        .replace(/{{customerName}}/g, booking.customerName || (l === 'vi' ? 'Quý Khách' : 'Guest'))
        .replace(/{{pax}}/g, String(booking.pax || 0))
        .replace(/{{time}}/g, booking.time || '')
        .replace(/{{date}}/g, formatDate(booking.bookingDate))
        .replace(/{{phone}}/g, booking.phone || '')
        .replace(/{{table}}/g, tableInfo(booking, l))
        .replace(/{{menus}}/g, formatMenus(booking, l))
        .replace(/{{area}}/g, booking.area ? (areaLabels[booking.area] || booking.area) : '')
        .replace(/{{status}}/g, booking.status ? (statusLabels[booking.status] || booking.status) : '');
}

function parseStatusTemplate(template: string, booking: Booking, oldStatus: BookingStatus, newStatus: BookingStatus, lang?: 'vi' | 'en'): string {
    const l = lang || getLang(booking);
    const statusLabels = STATUS_LABELS[l] || STATUS_LABELS.en;
    const oldLabel = statusLabels[oldStatus] || oldStatus;
    const newLabel = statusLabels[newStatus] || newStatus;
    return parseTemplate(template, booking, l)
        .replace(/{{oldStatus}}/g, oldLabel)
        .replace(/{{newStatus}}/g, newLabel);
}

export function applyHtmlTemplate(template: string, booking: Booking, lang?: 'vi' | 'en'): string {
    const text = parseTemplate(template, booking, lang);
    return text.replace(/\n/g, '<br/>');
}

// ─── Helper ─────────────────────────────────────────────────────────
function formatDate(date?: string): string {
    if (!date) return '—';
    const parts = date.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
}

function formatMenus(booking: Booking, lang: 'vi' | 'en' = 'vi'): string {
    if (!booking.selectedMenus || booking.selectedMenus.length === 0) return LABELS[lang].notSelected;
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

function tableInfo(booking: Booking, lang: 'vi' | 'en' = 'vi'): string {
    const name = booking.tableName || '';
    const areaLabels = AREA_LABELS[lang] || AREA_LABELS.en;
    const area = booking.area ? (areaLabels[booking.area] || booking.area) : '';
    return name ? `${name}${area ? ` (${area})` : ''}` : (area || LABELS[lang].notAssigned);
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
function wrapHtml(title: string, accent: string, bodyContent: string, lang: 'vi' | 'en' = 'vi'): string {
    return `
<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:${BRAND.card};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 12px 40px rgba(15,23,42,.07);">
    <div style="background:${accent};color:#fff;padding:28px 32px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.8;">Maison Vie Restaurant</div>
        <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:700;">${esc(title)}</h1>
    </div>
    <div style="padding:28px 32px;">
        ${bodyContent}
        <p style="margin:24px 0 0;color:${BRAND.textMuted};font-size:11px;">${LABELS[lang].autoEmail}</p>
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

function bookingTable(booking: Booking, lang: 'vi' | 'en' = 'vi'): string {
    const l = LABELS[lang];
    const areaLabels = AREA_LABELS[lang] || AREA_LABELS.en;
    const rows = [
        infoRow(l.guestName, booking.customerName || '—'),
        infoRow(l.phone, booking.phone || '—'),
        infoRow(l.email, booking.email || '—'),
        infoRow(l.date, formatDate(booking.bookingDate)),
        infoRow(l.time, booking.time || '—'),
        infoRow(l.guests, `${booking.pax || 0} ${l.guestUnit}`),
        infoRow(l.area, booking.area ? (areaLabels[booking.area] || booking.area) : '—'),
        infoRow(l.table, tableInfo(booking, lang)),
        infoRow(l.menu, formatMenus(booking, lang)),
    ];
    if (booking.notes && booking.notes.length > 0) {
        rows.push(infoRow(l.notes, booking.notes.join(', ')));
    }
    return `<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">${rows.join('')}</table>`;
}

// ─── Default templates per language ─────────────────────────────────
const CUSTOMER_PENDING: Record<string, (b: Booking) => string> = {
    vi: (b) => {
        const name = b.customerName || 'Quý Khách';
        return `[ĐÃ NHẬN YÊU CẦU ĐẶT BÀN]\n\nChào ${name},\n\nChúng tôi đã nhận yêu cầu đặt bàn của bạn.\nĐơn đặt bàn đang chờ xác nhận, đội ngũ của chúng tôi sẽ xác nhận trong thời gian sớm nhất.\n\nChi tiết đặt bàn:\n- Ngày: ${formatDate(b.bookingDate)}\n- Giờ: ${b.time || ''}\n- Số khách: ${b.pax || 0}\n- Bàn: ${tableInfo(b, 'vi')}\n- Thực đơn: ${formatMenus(b, 'vi')}\n\nNếu bạn cần hỗ trợ gấp, vui lòng liên hệ Maison Vie.`;
    },
    en: (b) => {
        const name = b.customerName || 'Guest';
        return `[BOOKING REQUEST RECEIVED]\n\nDear ${name},\n\nWe have received your table reservation request.\nYour booking is currently pending confirmation and our team will confirm it as soon as possible.\n\nBooking details:\n- Date: ${formatDate(b.bookingDate)}\n- Time: ${b.time || ''}\n- Number of guests: ${b.pax || 0}\n- Table: ${tableInfo(b, 'en')}\n- Menu: ${formatMenus(b, 'en')}\n\nIf you need urgent assistance, please contact Maison Vie.`;
    },
};

const CUSTOMER_CONFIRM: Record<string, (b: Booking) => string> = {
    vi: (b) => {
        const name = b.customerName || 'Quý Khách';
        return `[XÁC NHẬN ĐẶT BÀN]\n\nChào ${name},\n\nĐặt bàn của bạn đã được xác nhận thành công.\n\nChi tiết đặt bàn:\n- Ngày: ${formatDate(b.bookingDate)}\n- Giờ: ${b.time || ''}\n- Số khách: ${b.pax || 0}\n- Bàn: ${tableInfo(b, 'vi')}\n- Thực đơn: ${formatMenus(b, 'vi')}\n\nVui lòng đến trước 15 phút.\nCảm ơn bạn đã chọn Maison Vie.`;
    },
    en: (b) => {
        const name = b.customerName || 'Guest';
        return `[RESERVATION CONFIRMED]\n\nDear ${name},\n\nYour table reservation has been confirmed.\n\nBooking details:\n- Date: ${formatDate(b.bookingDate)}\n- Time: ${b.time || ''}\n- Number of guests: ${b.pax || 0}\n- Table: ${tableInfo(b, 'en')}\n- Menu: ${formatMenus(b, 'en')}\n\nPlease arrive 15 minutes early.\nThank you for choosing Maison Vie.`;
    },
};

const CUSTOMER_CANCEL: Record<string, (b: Booking) => string> = {
    vi: (b) => {
        const name = b.customerName || 'Quý Khách';
        return `Chào ${name},\n\nChúng tôi xin thông báo đặt bàn của bạn đã bị hủy.\n\nChi tiết đặt bàn:\n- Ngày: ${formatDate(b.bookingDate)}\n- Giờ: ${b.time || ''}\n- Số khách: ${b.pax || 0}\n- Bàn: ${tableInfo(b, 'vi')}\n- Thực đơn: ${formatMenus(b, 'vi')}`;
    },
    en: (b) => {
        const name = b.customerName || 'Guest';
        return `Dear ${name},\n\nWe are sorry to inform you that your table reservation has been cancelled.\n\nBooking details:\n- Date: ${formatDate(b.bookingDate)}\n- Time: ${b.time || ''}\n- Number of guests: ${b.pax || 0}\n- Table: ${tableInfo(b, 'en')}\n- Menu: ${formatMenus(b, 'en')}`;
    },
};

const SUBJECT: Record<string, Record<string, string>> = {
    vi: {
        pending: '✨ Đã nhận yêu cầu đặt bàn — Maison Vie',
        confirmed: '✅ Xác nhận đặt bàn — Maison Vie',
        cancelled: '❌ Hủy đặt bàn — Maison Vie',
        pendingTitle: '✅ ĐÃ NHẬN YÊU CẦU ĐẶT BÀN',
        confirmedTitle: '✅ XÁC NHẬN ĐẶT BÀN',
        cancelledTitle: '❌ HỦY ĐẶT BÀN',
    },
    en: {
        pending: '✨ Reservation request received — Maison Vie',
        confirmed: '✅ Reservation confirmed — Maison Vie',
        cancelled: '❌ Reservation cancelled — Maison Vie',
        pendingTitle: '✅ RESERVATION REQUEST RECEIVED',
        confirmedTitle: '✅ RESERVATION CONFIRMED',
        cancelledTitle: '❌ RESERVATION CANCELLED',
    },
};

// ─── Exported templates ─────────────────────────────────────────────

export const emailTemplateService = {

    /**
     * 1. Email nội bộ: Booking mới — LUÔN TIẾNG VIỆT
     */
    buildNewBookingInternal(booking: Booking, config?: EmailTemplatesConfig): EmailTemplate {
        const customTitle = config?.internalNewTitle ? parseTemplate(config.internalNewTitle, booking, 'vi') : '🔔 BOOKING MỚI';
        const customBody = config?.internalNewBody
            ? parseTemplate(config.internalNewBody, booking, 'vi')
            : [
                `Tên khách: ${booking.customerName || '—'}`,
                `Số điện thoại: ${booking.phone || '—'}`,
                `Email: ${booking.email || '—'}`,
                `Ngày: ${formatDate(booking.bookingDate)}`,
                `Giờ: ${booking.time || '—'}`,
                `Số khách: ${booking.pax || 0}`,
                `Bàn: ${tableInfo(booking, 'vi')}`,
                `Thực đơn: ${formatMenus(booking, 'vi')}`,
            ].join('\n');
        const subject = `🔔 Booking mới: ${booking.customerName || 'Khách'} — ${booking.pax || 0} khách — ${booking.time || ''}`;
        const html = wrapHtml(customTitle, BRAND.teal, `<p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.textPrimary};white-space:pre-line;">${applyHtmlTemplate(customBody, booking, 'vi')}</p>`, 'vi');
        const text = [customTitle, '', customBody].join('\n');
        return { subject, html, text };
    },

    /**
     * 1b. Email cho khách: Đã nhận yêu cầu — THEO NGÔN NGỮ KHÁCH
     */
    buildCustomerPending(booking: Booking, config?: EmailTemplatesConfig): EmailTemplate {
        const lang = getLang(booking);
        const bodyText = config?.customerPendingBody
            ? parseTemplate(config.customerPendingBody, booking, lang)
            : CUSTOMER_PENDING[lang](booking);
        const subject = SUBJECT[lang].pending;
        const html = wrapHtml(SUBJECT[lang].pendingTitle, BRAND.teal, `<p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.textPrimary};white-space:pre-line;">${applyHtmlTemplate(bodyText, booking, lang)}</p>`, lang);
        const text = bodyText;
        return { subject, html, text };
    },

    /**
     * 2. Email cho khách: Xác nhận đặt bàn — THEO NGÔN NGỮ KHÁCH
     */
    buildCustomerConfirmation(booking: Booking, config?: EmailTemplatesConfig): EmailTemplate {
        const lang = getLang(booking);
        let subject = SUBJECT[lang].confirmed;
        const code = booking.bookingCode || booking.customerName;
        if (booking.customerType === 'tour' && code && code !== 'Khách lẻ') {
            subject += ` - ${code}`;
        }

        const bodyText = config?.customerConfirmBody
            ? parseTemplate(config.customerConfirmBody, booking, lang)
            : CUSTOMER_CONFIRM[lang](booking);

        const html = wrapHtml(SUBJECT[lang].confirmedTitle, BRAND.green, `
            <p style="font-size:15px;color:${BRAND.textPrimary};line-height:1.7;margin:0;white-space:pre-line;">${applyHtmlTemplate(bodyText, booking, lang)}</p>
        `, lang);

        const text = bodyText;

        return { subject, html, text };
    },

    /**
     * 3. Email nội bộ: Đổi trạng thái — LUÔN TIẾNG VIỆT
     */
    buildStatusChangeInternal(booking: Booking, oldStatus: BookingStatus, newStatus: BookingStatus, config?: EmailTemplatesConfig): EmailTemplate {
        const statusLabels = STATUS_LABELS.vi;
        const oldLabel = statusLabels[oldStatus] || oldStatus;
        const newLabel = statusLabels[newStatus] || newStatus;
        const subject = `📋 Cập nhật booking: ${booking.customerName || 'Khách'} — ${oldLabel} → ${newLabel}`;

        const defaultBody = `[CẬP NHẬT TRẠNG THÁI]\n\nTên khách: ${booking.customerName || '—'}\nTrạng thái cũ: ${oldLabel}\nTrạng thái mới: ${newLabel}\n\nChi tiết đặt bàn:\n- Ngày: ${formatDate(booking.bookingDate)}\n- Giờ: ${booking.time || '—'}\n- Số khách: ${booking.pax || 0}\n- Bàn: ${tableInfo(booking, 'vi')}\n- Thực đơn: ${formatMenus(booking, 'vi')}`;
        const bodyText = config?.internalStatusChangeBody
            ? parseStatusTemplate(config.internalStatusChangeBody, booking, oldStatus, newStatus, 'vi')
            : defaultBody;

        const html = wrapHtml(`📋 CẬP NHẬT: ${oldLabel} → ${newLabel}`, BRAND.amber, `
            <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.textPrimary};white-space:pre-line;">${bodyText.replace(/\n/g, '<br/>')}</p>
        `, 'vi');

        const text = bodyText;

        return { subject, html, text };
    },

    /**
     * 4. Email cho khách: Hủy booking — THEO NGÔN NGỮ KHÁCH
     */
    buildCustomerCancellation(booking: Booking, config?: EmailTemplatesConfig): EmailTemplate {
        const lang = getLang(booking);
        const subject = SUBJECT[lang].cancelled;
        const l = LABELS[lang];

        const bodyText = config?.customerCancelBody
            ? parseTemplate(config.customerCancelBody, booking, lang)
            : CUSTOMER_CANCEL[lang](booking);

        const html = wrapHtml(SUBJECT[lang].cancelledTitle, BRAND.red, `
            <p style="font-size:15px;color:${BRAND.textPrimary};line-height:1.7;margin:0 0 20px;white-space:pre-line;">${applyHtmlTemplate(bodyText, booking, lang)}</p>
            ${bookingTable(booking, lang)}
            <div style="margin-top:20px;padding:16px 18px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;">
                <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
                    ${l.newBookingLink}<br/>
                    <a href="https://app.maisonvie.vn/dat-ban-online" style="color:#0d9488;font-weight:600;">app.maisonvie.vn/dat-ban-online</a>
                </p>
            </div>
        `, lang);

        const text = [
            SUBJECT[lang].cancelledTitle,
            '',
            bodyText,
            '',
            `📅 ${l.date}: ${formatDate(booking.bookingDate)}`,
            `⏰ ${l.time}: ${booking.time || ''}`,
            `👥 ${l.guests}: ${booking.pax || 0}`,
            '',
            `${l.newBookingLink} https://app.maisonvie.vn/dat-ban-online`,
        ].join('\n');

        return { subject, html, text };
    },

    /**
     * 5. Email cho đối tác/khách: Xác nhận nhiều booking cùng lúc
     */
    buildBatchConfirmation(bookings: Booking[], options?: { unavailableBookings?: Booking[]; lang?: 'vi' | 'en' }): EmailTemplate {
        const first = bookings[0] || (options?.unavailableBookings || [])[0];
        const lang = options?.lang || (first ? getLang(first) : 'vi');
        const isVi = lang === 'vi';
        const unavailable = options?.unavailableBookings || [];

        const sortByDate = (list: Booking[]) => [...list].sort((a, b) => {
            const dateCompare = (a.bookingDate || '').localeCompare(b.bookingDate || '');
            if (dateCompare !== 0) return dateCompare;
            return (a.time || '').localeCompare(b.time || '');
        });

        const confirmedSorted = sortByDate(bookings);
        const unavailableSorted = sortByDate(unavailable);

        const totalConfirmed = confirmedSorted.length;
        const totalUnavailable = unavailableSorted.length;
        const totalAll = totalConfirmed + totalUnavailable;

        const subject = isVi
            ? `✅ Xác nhận ${totalConfirmed} đặt bàn${totalUnavailable > 0 ? ` (${totalUnavailable} hết bàn)` : ''} — Maison Vie`
            : `✅ ${totalConfirmed} reservations confirmed${totalUnavailable > 0 ? ` (${totalUnavailable} unavailable)` : ''} — Maison Vie`;
        const title = isVi
            ? `✅ XÁC NHẬN ĐẶT BÀN`
            : `✅ RESERVATIONS UPDATE`;

        const buildTableRows = (list: Booking[], startIndex: number) => list.map((booking, i) => `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${BRAND.textSecondary};font-size:13px;">${startIndex + i + 1}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${BRAND.textPrimary};font-size:13px;font-weight:700;">${esc(booking.bookingCode || booking.customerName || '—')}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${BRAND.textPrimary};font-size:13px;">${esc(formatDate(booking.bookingDate))}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${BRAND.textPrimary};font-size:13px;font-weight:700;">${esc(booking.time || '—')}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${BRAND.textPrimary};font-size:13px;">${esc(String(booking.pax || 0))}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${BRAND.textPrimary};font-size:13px;">${esc(tableInfo(booking, lang))}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:${BRAND.textPrimary};font-size:13px;">${esc(formatMenus(booking, lang))}</td>
            </tr>
        `).join('');

        const tableHeaders = `
            <thead>
                <tr style="background:#f8fafc;">
                    <th style="padding:10px 12px;text-align:left;color:${BRAND.textSecondary};font-size:12px;">#</th>
                    <th style="padding:10px 12px;text-align:left;color:${BRAND.textSecondary};font-size:12px;">Code</th>
                    <th style="padding:10px 12px;text-align:left;color:${BRAND.textSecondary};font-size:12px;">${isVi ? 'Ngày' : 'Date'}</th>
                    <th style="padding:10px 12px;text-align:left;color:${BRAND.textSecondary};font-size:12px;">${isVi ? 'Giờ' : 'Time'}</th>
                    <th style="padding:10px 12px;text-align:left;color:${BRAND.textSecondary};font-size:12px;">Pax</th>
                    <th style="padding:10px 12px;text-align:left;color:${BRAND.textSecondary};font-size:12px;">${isVi ? 'Bàn' : 'Table'}</th>
                    <th style="padding:10px 12px;text-align:left;color:${BRAND.textSecondary};font-size:12px;">Menu</th>
                </tr>
            </thead>`;

        const partnerName = first?.customerName || (isVi ? 'Quý đối tác' : 'Partner');
        const intro = isVi
            ? `Chào ${partnerName},<br/><br/>Maison Vie xin gửi xác nhận đặt bàn cho các đoàn dưới đây.`
            : `Dear ${partnerName},<br/><br/>Maison Vie would like to confirm the reservations listed below.`;

        // Confirmed section
        let confirmedSection = '';
        if (totalConfirmed > 0) {
            const sectionTitle = isVi
                ? `✅ Các đoàn đã xác nhận (${totalConfirmed})`
                : `✅ Confirmed groups (${totalConfirmed})`;
            confirmedSection = `
                <h3 style="margin:20px 0 10px;font-size:15px;color:${BRAND.green};">${sectionTitle}</h3>
                <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
                    ${tableHeaders}
                    <tbody>${buildTableRows(confirmedSorted, 0)}</tbody>
                </table>`;
        }

        // Unavailable section
        let unavailableSection = '';
        if (totalUnavailable > 0) {
            const sectionTitle = isVi
                ? `🚫 Các đoàn hiện chưa thể nhận do hết bàn (${totalUnavailable})`
                : `🚫 Groups currently unavailable due to full capacity (${totalUnavailable})`;
            const noteText = isVi
                ? 'Chúng tôi rất tiếc vì hiện không đủ bàn cho các đoàn trên. Xin vui lòng liên hệ để sắp xếp lại.'
                : 'We regret that we are currently unable to accommodate the groups above. Please contact us to rearrange.';
            unavailableSection = `
                <h3 style="margin:24px 0 10px;font-size:15px;color:${BRAND.red};">${sectionTitle}</h3>
                <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #fecaca;border-radius:12px;overflow:hidden;">
                    ${tableHeaders}
                    <tbody>${buildTableRows(unavailableSorted, totalConfirmed)}</tbody>
                </table>
                <div style="margin-top:10px;padding:12px 16px;background:#fef2f2;border-radius:10px;border:1px solid #fecaca;">
                    <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">${noteText}</p>
                </div>`;
        }

        const footerText = isVi
            ? 'Vui lòng kiểm tra lại danh sách đoàn. Nếu có thay đổi/hủy đoàn, vui lòng phản hồi để Maison Vie cập nhật.'
            : 'Please review the list above. If there are any changes or cancellations, kindly reply so Maison Vie can update accordingly.';

        const html = wrapHtml(title, totalUnavailable > 0 ? BRAND.amber : BRAND.green, `
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${BRAND.textPrimary};">${intro}</p>
            ${confirmedSection}
            ${unavailableSection}
            <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:${BRAND.textSecondary};">
                ${footerText}
            </p>
        `, lang);

        // Plain text version
        const buildTextRows = (list: Booking[], startIndex: number) => list.map((booking, i) =>
            `${startIndex + i + 1}. ${booking.bookingCode || booking.customerName || '—'} | ${formatDate(booking.bookingDate)} ${booking.time || '—'} | ${booking.pax || 0} pax | ${tableInfo(booking, lang)} | ${formatMenus(booking, lang)}`
        );

        const textLines = [
            title,
            '',
            isVi ? 'Maison Vie xin gửi xác nhận đặt bàn:' : 'Maison Vie reservation confirmation:',
            '',
        ];

        if (totalConfirmed > 0) {
            textLines.push(isVi ? `--- ĐÃ XÁC NHẬN (${totalConfirmed}) ---` : `--- CONFIRMED (${totalConfirmed}) ---`);
            textLines.push(...buildTextRows(confirmedSorted, 0));
            textLines.push('');
        }

        if (totalUnavailable > 0) {
            textLines.push(isVi ? `--- HẾT BÀN (${totalUnavailable}) ---` : `--- FULL CAPACITY (${totalUnavailable}) ---`);
            textLines.push(...buildTextRows(unavailableSorted, totalConfirmed));
            textLines.push('');
        }

        textLines.push(footerText);

        const text = textLines.join('\n');

        return { subject, html, text };
    },
};
