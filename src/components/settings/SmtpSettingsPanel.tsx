import React, { useState, useEffect } from 'react';
import { Mail, Send, Check, Loader2, Server, ShieldCheck } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { emailNotificationService } from '../../services/emailNotificationService';

/**
 * SmtpSettingsPanel — cấu hình SMTP email trong admin.
 * Settings lưu trong Supabase: smtpEnabled, sendCustomerEmail, internalNotificationEmail.
 * Thông tin nhạy cảm (host, password) lưu trên Vercel env, không hiện ở đây.
 */
export default function SmtpSettingsPanel() {
    const [smtpEnabled, setSmtpEnabled] = useState(false);
    const [sendCustomerEmail, setSendCustomerEmail] = useState(false);
    const [internalEmail, setInternalEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const s = await settingsService.getAppSettings();
            if (s) {
                setSmtpEnabled(!!s.smtpEnabled);
                setSendCustomerEmail(!!s.sendCustomerEmail);
                setInternalEmail(s.internalNotificationEmail || '');
            }
            setLoaded(true);
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setTestResult(null);
        try {
            await settingsService.updateAppSetting('smtpEnabled', smtpEnabled);
            await settingsService.updateAppSetting('sendCustomerEmail', sendCustomerEmail);
            await settingsService.updateAppSetting('internalNotificationEmail', internalEmail);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save SMTP settings failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleTestSmtp = async () => {
        setTesting(true);
        setTestResult(null);
        // Auto-save before test
        try {
            await settingsService.updateAppSetting('smtpEnabled', smtpEnabled);
            await settingsService.updateAppSetting('sendCustomerEmail', sendCustomerEmail);
            await settingsService.updateAppSetting('internalNotificationEmail', internalEmail);
        } catch { /* ignore */ }

        const result = await emailNotificationService.testSmtp();
        setTestResult({
            success: result.success,
            message: result.success ? '✅ SMTP hoạt động!' : '❌ SMTP test thất bại',
            details: result.error || (result as any).message || undefined,
        });
        setTesting(false);
    };

    if (!loaded) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-600" />Email SMTP tự động
            </h3>
            <p className="text-sm text-gray-500 mb-6">
                Gửi email trực tiếp qua SMTP khi có booking mới, xác nhận, hoặc hủy. Cấu hình SMTP (host, password) nằm trên Vercel.
            </p>

            <div className="space-y-5">
                {/* Toggle SMTP */}
                <div className={`rounded-xl border p-5 transition-colors ${smtpEnabled ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${smtpEnabled ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Server className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Bật SMTP Email</h4>
                                <p className="text-xs text-gray-500">Gửi email tự động qua Gmail SMTP</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setSmtpEnabled(!smtpEnabled)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${smtpEnabled ? 'bg-teal-500' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${smtpEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </div>
                </div>

                {smtpEnabled && (
                    <>
                        {/* Internal email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Email nhận thông báo nội bộ</label>
                            <input
                                type="email"
                                value={internalEmail}
                                onChange={(e) => setInternalEmail(e.target.value)}
                                placeholder="info@maisonvie.vn"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                            />
                            <p className="text-xs text-gray-400">Email quản lý/lễ tân nhận thông báo booking mới, thay đổi trạng thái.</p>
                        </div>

                        {/* Send to customer toggle */}
                        <div className={`rounded-xl border p-5 transition-colors ${sendCustomerEmail ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sendCustomerEmail ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Gửi email cho khách</h4>
                                        <p className="text-xs text-gray-500">Tự động gửi email xác nhận / hủy tới khách hàng</p>
                                    </div>
                                </div>
                                <div
                                    onClick={() => setSendCustomerEmail(!sendCustomerEmail)}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${sendCustomerEmail ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${sendCustomerEmail ? 'translate-x-6' : ''}`} />
                                </div>
                            </div>
                        </div>

                        {/* SMTP info note */}
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>💡 Lưu ý:</strong> Cấu hình SMTP (host, port, mật khẩu) được quản lý trên <strong>Vercel Environment Variables</strong> để đảm bảo bảo mật.
                                Liên hệ quản trị hệ thống nếu cần thay đổi thông tin SMTP.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu cấu hình SMTP'}
                </button>

                {smtpEnabled && (
                    <button
                        onClick={handleTestSmtp}
                        disabled={testing}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:border-teal-400 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {testing ? 'Đang test SMTP...' : 'Gửi email test'}
                    </button>
                )}
            </div>

            {testResult && (
                <div className={`mt-4 p-4 rounded-lg text-sm whitespace-pre-line ${testResult.success ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                    <div className="font-semibold mb-1">{testResult.message}</div>
                    {testResult.details && <div className="text-xs opacity-80">{testResult.details}</div>}
                </div>
            )}
        </div>
    );
}
