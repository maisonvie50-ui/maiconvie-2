/**
 * Email Template Service — tách riêng template khỏi logic gửi.
 * Mỗi loại email có hàm build riêng, dễ mở rộng thêm mẫu mới.
 */

import { Booking, BookingStatus } from '../types/booking';
import { EmailTemplate } from '../types/email';

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

// ─── Helper ─────────────────────────────────────────────────────────
function formatDate(date?: string): string {
    if (!date) return '—';
    const parts = date.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
}

function formatMenus(booking: Booking): string {
    if (!booking.selectedMenus || booking.selectedMenus.length === 0) return 'Chưa chọn';
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
    return name ? `${name}${area ? ` (${area})` : ''}` : (area || 'Chưa xếp bàn');
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
        <p style="margin:24px 0 0;color:${BRAND.textMuted};font-size:11px;">Email tự động từ hệ thống Maison Vie — Vui lòng không trả lời email này.</p>
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
        infoRow('Khách hàng', booking.customerName || '—'),
        infoRow('Số điện thoại', booking.phone || '—'),
        infoRow('Email', booking.email || '—'),
        infoRow('Ngày', formatDate(booking.bookingDate)),
        infoRow('Giờ', booking.time || '—'),
        infoRow('Số khách', `${booking.pax || 0} khách`),
        infoRow('Khu vực', booking.area ? (AREA_LABELS[booking.area] || booking.area) : '—'),
        infoRow('Bàn', tableInfo(booking)),
        infoRow('Menu', formatMenus(booking)),
    ];
    if (booking.notes && booking.notes.length > 0) {
        rows.push(infoRow('Ghi chú', booking.notes.join(', ')));
    }
    return `<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">${rows.join('')}</table>`;
}

// ─── Exported templates ─────────────────────────────────────────────

export const emailTemplateService = {

    /**
     * 1. Email nội bộ: Booking mới
     */
    buildNewBookingInternal(booking: Booking): EmailTemplate {
        const subject = `🔔 Booking mới: ${booking.customerName || 'Khách'} — ${booking.pax || 0} khách — ${booking.time || ''}`;
        const html = wrapHtml('🔔 BOOKING MỚI', BRAND.teal, bookingTable(booking));
        const text = [
            '🔔 BOOKING MỚI — Maison Vie',
            '',
            `Khách hàng: ${booking.customerName || '—'}`,
            `SĐT: ${booking.phone || '—'}`,
            `Email: ${booking.email || '—'}`,
            `Ngày: ${formatDate(booking.bookingDate)}`,
            `Giờ: ${booking.time || '—'}`,
            `Số khách: ${booking.pax || 0}`,
            `Bàn: ${tableInfo(booking)}`,
            `Menu: ${formatMenus(booking)}`,
        ].join('\n');
        return { subject, html, text };
    },

    /**
     * 2. Email cho khách: Xác nhận đặt bàn
     */
    buildCustomerConfirmation(booking: Booking): EmailTemplate {
        const name = booking.customerName || 'Quý Khách';
        const subject = `✅ Xác nhận đặt bàn — Maison Vie`;

        const greeting = `
            <p style="font-size:15px;color:${BRAND.textPrimary};line-height:1.7;margin:0 0 20px;">
                Chào <strong>${esc(name)}</strong>,<br/>
                Đặt bàn của bạn đã được xác nhận thành công! 🎉
            </p>
        `;

        const footer = `
            <div style="margin-top:20px;padding:16px 18px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
                <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;">
                    📌 Vui lòng đến trước <strong>15 phút</strong>.<br/>
                    Nếu thay đổi, xin báo trước ít nhất <strong>2 tiếng</strong>.<br/>
                    Rất mong được phục vụ bạn! 🙏
                </p>
            </div>
        `;

        const html = wrapHtml('✅ ĐẶT BÀN ĐÃ XÁC NHẬN', BRAND.green, greeting + bookingTable(booking) + footer);

        const text = [
            '✅ Đặt bàn đã được XÁC NHẬN — Maison Vie',
            '',
            `Chào ${name},`,
            'Đặt bàn của bạn đã được xác nhận thành công! 🎉',
            '',
            `📅 Ngày: ${formatDate(booking.bookingDate)}`,
            `⏰ Giờ: ${booking.time || ''}`,
            `👥 Số khách: ${booking.pax || 0} người`,
            `🪑 Bàn: ${tableInfo(booking)}`,
            `🍽️ Menu: ${formatMenus(booking)}`,
            '',
            'Vui lòng đến trước 15 phút.',
            'Nếu thay đổi, xin báo trước ít nhất 2 tiếng.',
            '',
            'Rất mong được phục vụ bạn! 🙏',
        ].join('\n');

        return { subject, html, text };
    },

    /**
     * 3. Email nội bộ: Đổi trạng thái
     */
    buildStatusChangeInternal(booking: Booking, oldStatus: BookingStatus, newStatus: BookingStatus): EmailTemplate {
        const oldLabel = STATUS_LABELS[oldStatus] || oldStatus;
        const newLabel = STATUS_LABELS[newStatus] || newStatus;
        const subject = `📋 ${booking.customerName || 'Khách'}: ${oldLabel} → ${newLabel}`;

        const statusBlock = `
            <div style="margin:0 0 20px;padding:14px 18px;background:#fef3c7;border-radius:12px;border:1px solid #fde68a;">
                <p style="margin:0;font-size:14px;color:#92400e;">
                    Trạng thái: <strong>${esc(oldLabel)}</strong> → <strong>${esc(newLabel)}</strong>
                </p>
            </div>
        `;

        const html = wrapHtml(`📋 CẬP NHẬT: ${oldLabel} → ${newLabel}`, BRAND.amber, statusBlock + bookingTable(booking));

        const text = [
            `📋 CẬP NHẬT — Maison Vie`,
            `Trạng thái: ${oldLabel} → ${newLabel}`,
            '',
            `Khách hàng: ${booking.customerName || '—'}`,
            `SĐT: ${booking.phone || '—'}`,
            `Ngày: ${formatDate(booking.bookingDate)}`,
            `Giờ: ${booking.time || '—'}`,
            `Số khách: ${booking.pax || 0}`,
        ].join('\n');

        return { subject, html, text };
    },

    /**
     * 4. Email cho khách: Hủy booking
     */
    buildCustomerCancellation(booking: Booking): EmailTemplate {
        const name = booking.customerName || 'Quý Khách';
        const subject = `❌ Thông báo hủy đặt bàn — Maison Vie`;

        const body = `
            <p style="font-size:15px;color:${BRAND.textPrimary};line-height:1.7;margin:0 0 20px;">
                Chào <strong>${esc(name)}</strong>,<br/>
                Rất tiếc, đặt bàn của bạn đã bị hủy.
            </p>
            ${bookingTable(booking)}
            <div style="margin-top:20px;padding:16px 18px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;">
                <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
                    Nếu bạn muốn đặt lại, vui lòng truy cập:<br/>
                    <a href="https://app.maisonvie.vn/dat-ban-online" style="color:#0d9488;font-weight:600;">app.maisonvie.vn/dat-ban-online</a>
                </p>
            </div>
        `;

        const html = wrapHtml('❌ ĐẶT BÀN ĐÃ HỦY', BRAND.red, body);

        const text = [
            '❌ Đặt bàn đã bị hủy — Maison Vie',
            '',
            `Chào ${name},`,
            'Rất tiếc, đặt bàn của bạn đã bị hủy.',
            '',
            `📅 Ngày: ${formatDate(booking.bookingDate)}`,
            `⏰ Giờ: ${booking.time || ''}`,
            `👥 Số khách: ${booking.pax || 0} người`,
            '',
            'Nếu bạn muốn đặt lại, vui lòng truy cập: https://app.maisonvie.vn/dat-ban-online',
        ].join('\n');

        return { subject, html, text };
    },
};
