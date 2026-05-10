import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

/**
 * POST /api/email/send-booking-notification
 *
 * Gửi email qua Gmail SMTP (Nodemailer).
 * Env vars: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, SMTP_FROM_EMAIL
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

    // Validate env
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, SMTP_FROM_EMAIL, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.warn('[email/send] SMTP not configured');
        return res.status(200).json({ success: false, error: 'SMTP chưa cấu hình (thiếu SMTP_HOST/USER/PASS)' });
    }

    try {
        const { to, subject, html, text } = req.body || {};

        if (!to || !subject) {
            return res.status(400).json({ success: false, error: 'Thiếu trường bắt buộc: to, subject' });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 465,
            secure: SMTP_SECURE !== 'false', // true for 465, false for 587
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const fromName = SMTP_FROM_NAME || 'Maison Vie';
        const fromEmail = SMTP_FROM_EMAIL || SMTP_USER;

        // Send
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html: html || undefined,
            text: text || undefined,
        });

        console.log('[email/send] Sent:', info.messageId);
        return res.status(200).json({
            success: true,
            messageId: info.messageId,
        });
    } catch (err: any) {
        console.error('[email/send] Error:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'SMTP send failed',
        });
    }
}
