import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * POST /api/email/test-smtp
 *
 * Test kết nối SMTP. Đọc cấu hình từ Supabase settings.
 */

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getSmtpConfig(): Promise<Record<string, any> | null> {
    const { data, error } = await supabase.from('settings').select('*');
    if (error || !data) return null;
    const config: Record<string, any> = {};
    data.forEach((row: any) => { config[row.key] = row.value; });
    return config;
}

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

    try {
        const config = await getSmtpConfig();
        const smtpHost = config?.smtpHost || process.env.SMTP_HOST;
        const smtpPort = config?.smtpPort || process.env.SMTP_PORT || '465';
        const smtpSecure = config?.smtpSecure ?? process.env.SMTP_SECURE ?? 'true';
        const smtpUser = config?.smtpUser || process.env.SMTP_USER;
        const smtpPass = config?.smtpPass || process.env.SMTP_PASS;
        const fromName = config?.smtpFromName || process.env.SMTP_FROM_NAME || 'Maison Vie';
        const fromEmail = config?.smtpFromEmail || process.env.SMTP_FROM_EMAIL || smtpUser;
        const testTo = config?.internalNotificationEmail || process.env.INTERNAL_NOTIFICATION_EMAIL || smtpUser;

        if (!smtpHost || !smtpUser || !smtpPass) {
            return res.status(200).json({
                success: false,
                message: '❌ SMTP chưa cấu hình',
                details: 'Thiếu smtpHost, smtpUser hoặc smtpPass trong bảng settings.',
            });
        }

        const transporter = nodemailer.createTransport({
            host: String(smtpHost),
            port: Number(smtpPort),
            secure: String(smtpSecure) !== 'false',
            auth: { user: String(smtpUser), pass: String(smtpPass) },
        });

        // Verify connection
        await transporter.verify();

        const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        // Send test email
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: String(testTo),
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
                            <strong>SMTP Host:</strong> ${smtpHost}<br/>
                            <strong>Port:</strong> ${smtpPort}<br/>
                            <strong>From:</strong> ${fromEmail}<br/>
                            <strong>Thời gian:</strong> ${now}
                        </p>
                        <p style="margin-top:16px;color:#94a3b8;font-size:11px;">Email test tự động từ hệ thống Maison Vie.</p>
                    </div>
                </div>
            `.trim(),
            text: `✅ SMTP Test thành công — Maison Vie\nSMTP Host: ${smtpHost}\nPort: ${smtpPort}\nFrom: ${fromEmail}\nThời gian: ${now}`,
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
            details = 'Sai mật khẩu SMTP hoặc App Password. Kiểm tra smtpUser và smtpPass trong settings.';
        } else if (details.includes('ECONNREFUSED') || details.includes('ETIMEDOUT')) {
            details = 'Không kết nối được tới SMTP server. Kiểm tra smtpHost và smtpPort.';
        } else if (details.includes('self signed')) {
            details = 'Lỗi SSL certificate. Thử đổi smtpSecure thành false và smtpPort thành 587.';
        }

        return res.status(200).json({ success: false, message: '❌ SMTP test thất bại', details });
    }
}
