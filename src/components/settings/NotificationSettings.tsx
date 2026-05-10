import React, { useState, useEffect } from 'react';
import { Bell, Send, Globe, Check, Loader2 } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { bookingNotifyService } from '../../services/bookingNotifyService';
import SmtpSettingsPanel from './SmtpSettingsPanel';

export default function NotificationSettings() {
    const [webhookEnabled, setWebhookEnabled] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
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
        } catch (err) {
            console.error('Auto-save before test failed:', err);
        }
        const result = await bookingNotifyService.sendTestNotification({ webhookEnabled, webhookUrl, emailEnabled: false, notificationEmail: '' });
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
        <>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />Cấu hình Webhook
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Nhận thông báo tự động khi có đặt bàn mới hoặc thay đổi trạng thái booking.
            </p>

            <div className="space-y-6">
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => setWebhookEnabled(!webhookEnabled)}
                        className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border text-left transition-all active:bg-gray-50 ${webhookEnabled ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200 bg-gray-50/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${webhookEnabled ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">Bật Webhook (POST)</div>
                                <div className="text-xs text-gray-500 mt-0.5">Gửi dữ liệu booking ra ngoài</div>
                            </div>
                        </div>
                        <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${webhookEnabled ? 'bg-teal-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${webhookEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>

                    {webhookEnabled && (
                        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                            <label className="block text-sm font-bold text-gray-800 mb-2">Webhook URL</label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://hooks.slack.com/... hoặc Make/Zapier"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-2">Hệ thống gửi POST với JSON body chứa thông tin booking.</p>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-3 z-20 sm:static bg-white/95 backdrop-blur-md sm:bg-transparent border border-gray-200 sm:border-none rounded-2xl sm:rounded-none p-3 sm:p-0 shadow-lg sm:shadow-none sm:pt-6 sm:mt-6 sm:border-t sm:border-gray-100 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-3.5 rounded-xl font-bold shadow-md shadow-teal-100 transition-all active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        {saving ? 'Đang lưu...' : saved ? 'Đã lưu cấu hình' : 'Lưu cấu hình Webhook'}
                    </button>

                    <button
                        onClick={handleTest}
                        disabled={testing || !webhookEnabled}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-teal-400 hover:text-teal-700 disabled:opacity-50 text-gray-700 px-6 py-3.5 rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
                    >
                        {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        {testing ? 'Đang gửi...' : 'Gửi test'}
                    </button>
                </div>

                {testResult && (
                    <div className={`p-4 rounded-xl text-sm ${testResult.success ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                        {testResult.message}
                    </div>
                )}
            </div>
        </div>

        {/* SMTP Email Section */}
        <div className="mt-6">
            <SmtpSettingsPanel />
        </div>
        </>
    );
}
