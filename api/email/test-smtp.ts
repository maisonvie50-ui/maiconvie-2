import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

/**
 * POST /api/email/test-smtp
 *
 * Test kết nối SMTP và gửi email test.
 * Gửi tới INTERNAL_NOTIFICATION_EMAIL hoặc SMTP_USER.
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

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, SMTP_FROM_EMAIL, SMTP_SECURE, INTERNAL_NOTIFICATION_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return res.status(200).json({
            success: false,
            message: '❌ SMTP chưa cấu hình',
            details: 'Thiếu SMTP_HOST, SMTP_USER hoặc SMTP_PASS trong Environment Variables.',
        });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 465,
            secure: SMTP_SECURE !== 'false',
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        // Verify connection
        await transporter.verify();

        const fromName = SMTP_FROM_NAME || 'Maison Vie';
        const fromEmail = SMTP_FROM_EMAIL || SMTP_USER;
        const testTo = INTERNAL_NOTIFICATION_EMAIL || SMTP_USER;

        const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        // Send test email
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: testTo,
            subject: `✅ Test SMTP thành công — Maison Vie (${now})`,
            html: `
                <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(15,23,42,.06);">
                    <div style="background:#0d9488;color:#fff;padding:24px 28px;">
                        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.8;">Maison Vie Restaurant</div>
                        <h1 style="margin:8px 0 0;font-size:20px;">✅ SMTP Test</h1>
                    </div>
                    <div style="padding:24px 28px;">
                        <p style="font-size:14px;color:#0f172a;line-height:1.7;">
                            Kết nối SMTP đã thành công!<br/>
                            Hệ thống sẵn sàng gửi email tự động.<br/><br/>
                            <strong>SMTP Host:</strong> ${SMTP_HOST}<br/>
                            <strong>Port:</strong> ${SMTP_PORT || '465'}<br/>
                            <strong>From:</strong> ${fromEmail}<br/>
                            <strong>Thời gian:</strong> ${now}
                        </p>
                        <p style="margin-top:16px;color:#94a3b8;font-size:11px;">Email test tự động từ hệ thống Maison Vie.</p>
                    </div>
                </div>
            `.trim(),
            text: `✅ SMTP Test thành công — Maison Vie\n\nSMTP Host: ${SMTP_HOST}\nPort: ${SMTP_PORT || '465'}\nFrom: ${fromEmail}\nThời gian: ${now}`,
        });

        return res.status(200).json({
            success: true,
            message: `✅ SMTP hoạt động! Email test đã gửi tới ${testTo}`,
            messageId: info.messageId,
        });
    } catch (err: any) {
        console.error('[email/test-smtp] Error:', err);

        let details = err.message || 'Unknown error';
        if (details.includes('Invalid login')) {
            details = 'Sai mật khẩu SMTP hoặc App Password. Kiểm tra lại SMTP_USER và SMTP_PASS.';
        } else if (details.includes('ECONNREFUSED') || details.includes('ETIMEDOUT')) {
            details = `Không kết nối được tới ${SMTP_HOST}:${SMTP_PORT || '465'}. Kiểm tra host/port.`;
        } else if (details.includes('self signed')) {
            details = 'Lỗi SSL certificate. Thử đổi SMTP_SECURE=false và SMTP_PORT=587.';
        }

        return res.status(200).json({
            success: false,
            message: '❌ SMTP test thất bại',
            details,
        });
    }
}
