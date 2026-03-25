import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/notify
 *
 * Gửi email thông báo booking qua Resend API.
 * Env vars cần thiết: RESEND_API_KEY
 * Nếu không có RESEND_API_KEY, endpoint sẽ trả 200 + skipped (fail-safe).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        console.warn('[notify] RESEND_API_KEY not set — skipping email');
        return res.status(200).json({ skipped: true, reason: 'RESEND_API_KEY not configured' });
    }

    try {
        const { to, type, booking, statusLabel, oldStatusLabel } = req.body || {};

        if (!to || !booking) {
            return res.status(400).json({ error: 'Missing required fields: to, booking' });
        }

        // Build email content
        const isNewBooking = type === 'new_booking';
        const subject = isNewBooking
            ? `🔔 Booking mới: ${booking.customerName} — ${booking.pax} khách`
            : `📋 Cập nhật booking: ${booking.customerName} — ${oldStatusLabel} → ${statusLabel}`;

        const html = buildEmailHtml({ type, booking, statusLabel, oldStatusLabel });

        // Send via Resend API
        const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'Maison Vie <noreply@maisonvie.com>',
                to: [to],
                subject,
                html,
            }),
        });

        if (!resendRes.ok) {
            const errBody = await resendRes.text();
            console.error('[notify] Resend API error:', errBody);
            return res.status(502).json({ error: 'Email service error', details: errBody });
        }

        const data = await resendRes.json();
        return res.status(200).json({ success: true, emailId: data.id });
    } catch (err: any) {
        console.error('[notify] Error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
}

function buildEmailHtml(params: {
    type: string;
    booking: any;
    statusLabel?: string;
    oldStatusLabel?: string;
}): string {
    const { type, booking, statusLabel, oldStatusLabel } = params;
    const isNewBooking = type === 'new_booking';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 520px; margin: 24px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: ${isNewBooking ? '#059669' : '#2563eb'}; color: #fff; padding: 20px 24px; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 600; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 24px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .info-label { color: #666; font-size: 13px; }
    .info-value { color: #111; font-size: 14px; font-weight: 500; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-new { background: #dcfce7; color: #166534; }
    .status-change { background: #dbeafe; color: #1e40af; }
    .footer { padding: 16px 24px; background: #fafafa; text-align: center; font-size: 11px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isNewBooking ? '🔔 Booking Mới' : '📋 Cập Nhật Trạng Thái'}</h1>
      <p>${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
    </div>
    <div class="body">
      <div class="info-row">
        <span class="info-label">Khách hàng</span>
        <span class="info-value">${booking.customerName || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Điện thoại</span>
        <span class="info-value">${booking.phone || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Số khách</span>
        <span class="info-value">${booking.pax || '—'} người</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ngày</span>
        <span class="info-value">${booking.bookingDate || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Giờ</span>
        <span class="info-value">${booking.time || '—'}</span>
      </div>
      ${booking.area ? `<div class="info-row"><span class="info-label">Khu vực</span><span class="info-value">${booking.area}</span></div>` : ''}
      ${booking.source ? `<div class="info-row"><span class="info-label">Nguồn</span><span class="info-value">${booking.source}</span></div>` : ''}
      ${!isNewBooking ? `
      <div class="info-row">
        <span class="info-label">Trạng thái</span>
        <span class="info-value">
          <span class="status-badge status-change">${oldStatusLabel} → ${statusLabel}</span>
        </span>
      </div>` : `
      <div class="info-row">
        <span class="info-label">Trạng thái</span>
        <span class="info-value">
          <span class="status-badge status-new">Mới</span>
        </span>
      </div>`}
    </div>
    <div class="footer">
      Maison Vie — Hệ thống quản lý nhà hàng
    </div>
  </div>
</body>
</html>
    `.trim();
}
