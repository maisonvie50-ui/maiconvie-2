import React, { useState, useEffect } from 'react';
import { Bell, Send, Globe, Mail, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { bookingNotifyService } from '../../services/bookingNotifyService';

export default function NotificationSettings() {
    const [webhookEnabled, setWebhookEnabled] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [notificationEmail, setNotificationEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const s = await settingsService.getAppSettings();
            if (s) {
                setWebhookEnabled(!!s.webhookEnabled);
                setWebhookUrl(s.webhookUrl || '');
                setEmailEnabled(!!s.emailEnabled);
                setNotificationEmail(s.notificationEmail || '');
            }
            setLoaded(true);
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setTestResult(null);
        try {
            await settingsService.updateAppSetting('webhookEnabled', webhookEnabled);
            await settingsService.updateAppSetting('webhookUrl', webhookUrl);
            await settingsService.updateAppSetting('emailEnabled', emailEnabled);
            await settingsService.updateAppSetting('notificationEmail', notificationEmail);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save notification settings failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        // Auto-save settings to DB first
        try {
            await settingsService.updateAppSetting('webhookEnabled', webhookEnabled);
            await settingsService.updateAppSetting('webhookUrl', webhookUrl);
            await settingsService.updateAppSetting('emailEnabled', emailEnabled);
            await settingsService.updateAppSetting('notificationEmail', notificationEmail);
        } catch (err) {
            console.error('Auto-save before test failed:', err);
        }
        // Pass UI state directly — no DB round-trip needed
        const result = await bookingNotifyService.sendTestNotification({
            webhookEnabled,
            webhookUrl,
            emailEnabled,
            notificationEmail,
        });
        setTestResult(result);
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
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />Cấu hình Thông báo Booking
            </h3>
            <p className="text-sm text-gray-500 mb-6">
                Nhận thông báo tự động khi có đặt bàn mới hoặc thay đổi trạng thái booking.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Webhook Card */}
                <div className={`rounded-xl border p-6 transition-colors ${webhookEnabled ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${webhookEnabled ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Webhook (HTTP POST)</h4>
                                <p className="text-xs text-gray-500">Gửi dữ liệu booking tới URL bên ngoài</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setWebhookEnabled(!webhookEnabled)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${webhookEnabled ? 'bg-teal-500' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${webhookEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </div>

                    {webhookEnabled && (
                        <div className="space-y-3 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://hooks.slack.com/... hoặc Make / Zapier webhook"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                            />
                            <p className="text-xs text-gray-400">Hệ thống gửi POST với JSON body chứa thông tin booking.</p>
                        </div>
                    )}
                </div>

                {/* Email Card */}
                <div className={`rounded-xl border p-6 transition-colors ${emailEnabled ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${emailEnabled ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Email thông báo</h4>
                                <p className="text-xs text-gray-500">Gửi email khi có booking mới</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setEmailEnabled(!emailEnabled)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${emailEnabled ? 'bg-teal-500' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${emailEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </div>

                    {emailEnabled && (
                        <div className="space-y-3 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Địa chỉ email nhận</label>
                            <input
                                type="email"
                                value={notificationEmail}
                                onChange={(e) => setNotificationEmail(e.target.value)}
                                placeholder="manager@maison-vie.com"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                            />
                            <div className="flex items-start gap-2 p-3 bg-orange-50 text-orange-700 text-xs rounded-lg border border-orange-100">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>Email gửi qua Supabase Edge Function (cần cấu hình RESEND_API_KEY trong Supabase Secrets).</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu cấu hình thông báo'}
                </button>

                <button
                    onClick={handleTest}
                    disabled={testing || (!webhookEnabled && !emailEnabled)}
                    className="flex items-center gap-2 bg-white border border-gray-300 hover:border-teal-400 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {testing ? 'Đang gửi test...' : 'Gửi thông báo test'}
                </button>
            </div>

            {testResult && (
                <div className={`mt-4 p-4 rounded-lg text-sm whitespace-pre-line ${testResult.success ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                    {testResult.message}
                </div>
            )}
        </div>
    );
}
