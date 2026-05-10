import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * POST /api/email/send-booking-notification
 *
 * Gửi email qua SMTP. Đọc cấu hình SMTP từ Supabase settings table.
 * Chỉ cần SUPABASE_URL + SUPABASE_ANON_KEY trên Vercel (đã có sẵn).
 */

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/** Đọc SMTP config từ bảng settings */
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
        const { to, subject, html, text } = req.body || {};

        if (!to || !subject) {
            return res.status(400).json({ success: false, error: 'Thiếu trường bắt buộc: to, subject' });
        }

        // Đọc SMTP config từ database
        const config = await getSmtpConfig();
        const smtpHost = config?.smtpHost || process.env.SMTP_HOST;
        const smtpPort = config?.smtpPort || process.env.SMTP_PORT || '465';
        const smtpSecure = config?.smtpSecure ?? process.env.SMTP_SECURE ?? 'true';
        const smtpUser = config?.smtpUser || process.env.SMTP_USER;
        const smtpPass = config?.smtpPass || process.env.SMTP_PASS;
        const fromName = config?.smtpFromName || process.env.SMTP_FROM_NAME || 'Maison Vie';
        const fromEmail = config?.smtpFromEmail || process.env.SMTP_FROM_EMAIL || smtpUser;

        if (!smtpHost || !smtpUser || !smtpPass) {
            return res.status(200).json({ success: false, error: 'SMTP chưa cấu hình (thiếu smtpHost/smtpUser/smtpPass trong settings hoặc env)' });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: String(smtpHost),
            port: Number(smtpPort),
            secure: String(smtpSecure) !== 'false',
            auth: {
                user: String(smtpUser),
                pass: String(smtpPass),
            },
        });

        // Send
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html: html || undefined,
            text: text || undefined,
        });

        console.log('[email/send] Sent:', info.messageId);
        return res.status(200).json({ success: true, messageId: info.messageId });
    } catch (err: any) {
        console.error('[email/send] Error:', err);
        return res.status(500).json({ success: false, error: err.message || 'SMTP send failed' });
    }
}
