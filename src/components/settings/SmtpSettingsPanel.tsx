import React, { useState, useEffect } from 'react';
import { Mail, Send, Check, Loader2, Server, ShieldCheck, FileText } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { emailNotificationService } from '../../services/emailNotificationService';

type TemplateKey = 'internalNew' | 'customerPending' | 'customerConfirm' | 'internalStatus' | 'customerCancel';

const DEFAULT_TEMPLATES: Record<TemplateKey, { label: string; desc: string; settingKey: string; defaultValue: string }> = {
    internalNew: {
        label: '📩 Booking mới — Gửi nội bộ',
        desc: 'Gửi cho quản lý/lễ tân khi có booking mới. (Luôn tiếng Việt)',
        settingKey: 'emailTemplateInternalNewBody',
        defaultValue: `[BOOKING MỚI]\n\nTên khách: {{customerName}}\nSố điện thoại: {{phone}}\nNgày: {{date}}\nGiờ: {{time}}\nSố khách: {{pax}}\nBàn: {{table}}\nThực đơn: {{menus}}\n\nVui lòng kiểm tra và xác nhận booking này.`,
    },
    customerPending: {
        label: '✨ Khách vừa đặt — Gửi khách',
        desc: 'Gửi khi khách vừa đặt bàn. Tự động chuyển ngôn ngữ theo khách (VI/EN).',
        settingKey: 'emailTemplateCustomerPendingBody',
        defaultValue: `[ĐÃ NHẬN YÊU CẦU ĐẶT BÀN]\n\nChào {{customerName}},\n\nChúng tôi đã nhận yêu cầu đặt bàn của bạn.\nĐơn đặt bàn đang chờ xác nhận, đội ngũ của chúng tôi sẽ xác nhận trong thời gian sớm nhất.\n\nChi tiết đặt bàn:\n- Ngày: {{date}}\n- Giờ: {{time}}\n- Số khách: {{pax}}\n- Bàn: {{table}}\n- Thực đơn: {{menus}}\n\nNếu bạn cần hỗ trợ gấp, vui lòng liên hệ Maison Vie.`,
    },
    customerConfirm: {
        label: '✅ Nhân viên chốt — Gửi khách',
        desc: 'Gửi cho khách khi nhân viên xác nhận booking. Tự động chuyển ngôn ngữ theo khách (VI/EN).',
        settingKey: 'emailTemplateCustomerConfirmBody',
        defaultValue: `[XÁC NHẬN ĐẶT BÀN]\n\nChào {{customerName}},\n\nĐặt bàn của bạn đã được xác nhận thành công.\n\nChi tiết đặt bàn:\n- Ngày: {{date}}\n- Giờ: {{time}}\n- Số khách: {{pax}}\n- Bàn: {{table}}\n- Thực đơn: {{menus}}\n\nVui lòng đến trước 15 phút.\nCảm ơn bạn đã chọn Maison Vie.`,
    },
    internalStatus: {
        label: '📋 Đổi trạng thái — Gửi nội bộ',
        desc: 'Gửi cho quản lý/lễ tân khi trạng thái booking thay đổi. (Luôn tiếng Việt)',
        settingKey: 'emailTemplateInternalStatusChangeBody',
        defaultValue: `[CẬP NHẬT TRẠNG THÁI]\n\nTên khách: {{customerName}}\nTrạng thái cũ: {{oldStatus}}\nTrạng thái mới: {{newStatus}}\n\nChi tiết đặt bàn:\n- Ngày: {{date}}\n- Giờ: {{time}}\n- Số khách: {{pax}}\n- Bàn: {{table}}\n- Thực đơn: {{menus}}`,
    },
    customerCancel: {
        label: '❌ Đã hủy — Gửi khách',
        desc: 'Gửi cho khách khi booking bị hủy. Tự động chuyển ngôn ngữ theo khách (VI/EN).',
        settingKey: 'emailTemplateCustomerCancelBody',
        defaultValue: `Chào {{customerName}},\n\nChúng tôi xin thông báo đặt bàn của bạn đã bị hủy.\n\nChi tiết đặt bàn:\n- Ngày: {{date}}\n- Giờ: {{time}}\n- Số khách: {{pax}}\n- Bàn: {{table}}\n- Thực đơn: {{menus}}\n\nNếu bạn muốn đặt bàn mới, vui lòng liên hệ chúng tôi.`,
    },
};

/**
 * SmtpSettingsPanel — cấu hình SMTP email trong admin.
 * Settings lưu trong Supabase: smtpEnabled, sendCustomerEmail, internalNotificationEmail.
 * Thông tin nhạy cảm (host, password) lưu trên Vercel env, không hiện ở đây.
 */
export default function SmtpSettingsPanel() {
    const [smtpEnabled, setSmtpEnabled] = useState(false);
    const [sendCustomerEmail, setSendCustomerEmail] = useState(false);
    const [internalEmail, setInternalEmail] = useState('');

    const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('internalNew');
    const [templateValues, setTemplateValues] = useState<Record<TemplateKey, string>>({
        internalNew: DEFAULT_TEMPLATES.internalNew.defaultValue,
        customerPending: DEFAULT_TEMPLATES.customerPending.defaultValue,
        customerConfirm: DEFAULT_TEMPLATES.customerConfirm.defaultValue,
        internalStatus: DEFAULT_TEMPLATES.internalStatus.defaultValue,
        customerCancel: DEFAULT_TEMPLATES.customerCancel.defaultValue,
    });

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
                setTemplateValues({
                    internalNew: s.emailTemplateInternalNewBody || DEFAULT_TEMPLATES.internalNew.defaultValue,
                    customerPending: s.emailTemplateCustomerPendingBody || DEFAULT_TEMPLATES.customerPending.defaultValue,
                    customerConfirm: s.emailTemplateCustomerConfirmBody || DEFAULT_TEMPLATES.customerConfirm.defaultValue,
                    internalStatus: s.emailTemplateInternalStatusChangeBody || DEFAULT_TEMPLATES.internalStatus.defaultValue,
                    customerCancel: s.emailTemplateCustomerCancelBody || DEFAULT_TEMPLATES.customerCancel.defaultValue,
                });
            }
            setLoaded(true);
        })();
    }, []);

    const saveTemplateSettings = async () => {
        await settingsService.updateAppSetting('emailTemplateInternalNewBody', templateValues.internalNew);
        await settingsService.updateAppSetting('emailTemplateCustomerPendingBody', templateValues.customerPending);
        await settingsService.updateAppSetting('emailTemplateCustomerConfirmBody', templateValues.customerConfirm);
        await settingsService.updateAppSetting('emailTemplateInternalStatusChangeBody', templateValues.internalStatus);
        await settingsService.updateAppSetting('emailTemplateCustomerCancelBody', templateValues.customerCancel);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setTestResult(null);
        try {
            await settingsService.updateAppSetting('smtpEnabled', smtpEnabled);
            await settingsService.updateAppSetting('sendCustomerEmail', sendCustomerEmail);
            await settingsService.updateAppSetting('internalNotificationEmail', internalEmail);
            await saveTemplateSettings();
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
        try {
            await settingsService.updateAppSetting('smtpEnabled', smtpEnabled);
            await settingsService.updateAppSetting('sendCustomerEmail', sendCustomerEmail);
            await settingsService.updateAppSetting('internalNotificationEmail', internalEmail);
            await saveTemplateSettings();
        } catch { /* ignore */ }

        const result = await emailNotificationService.testSmtp();
        setTestResult({
            success: result.success,
            message: result.success ? '✅ SMTP hoạt động!' : '❌ SMTP test thất bại',
            details: result.error || (result as any).message || undefined,
        });
        setTesting(false);
    };

    const handleTemplateChange = (value: string) => {
        setTemplateValues(prev => ({ ...prev, [selectedTemplate]: value }));
    };

    const resetSelectedTemplate = () => {
        setTemplateValues(prev => ({ ...prev, [selectedTemplate]: DEFAULT_TEMPLATES[selectedTemplate].defaultValue }));
    };

    const resetAllTemplates = () => {
        setTemplateValues({
            internalNew: DEFAULT_TEMPLATES.internalNew.defaultValue,
            customerPending: DEFAULT_TEMPLATES.customerPending.defaultValue,
            customerConfirm: DEFAULT_TEMPLATES.customerConfirm.defaultValue,
            internalStatus: DEFAULT_TEMPLATES.internalStatus.defaultValue,
            customerCancel: DEFAULT_TEMPLATES.customerCancel.defaultValue,
        });
    };

    if (!loaded) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
        );
    }

    const selectedMeta = DEFAULT_TEMPLATES[selectedTemplate];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-600" />Email SMTP tự động
            </h3>
            <p className="text-sm text-gray-500 mb-6">
                Gửi email trực tiếp qua SMTP khi có booking mới, xác nhận, đổi trạng thái hoặc hủy. Cấu hình SMTP nằm trên Vercel.
            </p>

            <div className="space-y-5">
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

                        <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/70 to-white p-5 space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Cấu hình mẫu nội dung email theo trạng thái</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed mt-1">
                                            Chọn loại email bên dưới, hệ thống sẽ hiện mẫu sẵn. Bạn chỉ sửa câu chữ cần thay đổi, giữ nguyên các biến trong dấu ngoặc.
                                        </p>
                                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                                            Nếu vẫn thấy mẫu tiếng Anh cũ, bấm “Khôi phục tất cả mẫu tiếng Việt” rồi bấm “Lưu cấu hình”.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetAllTemplates}
                                    className="w-full sm:w-auto text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-lg transition-colors"
                                >
                                    Khôi phục tất cả mẫu tiếng Việt
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(Object.keys(DEFAULT_TEMPLATES) as TemplateKey[]).map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedTemplate(key)}
                                        className={`text-left rounded-xl border p-4 transition-all ${selectedTemplate === key ? 'border-teal-400 bg-white shadow-md shadow-teal-100' : 'border-gray-200 bg-white/70 hover:border-teal-200 hover:bg-white'}`}
                                    >
                                        <div className="text-sm font-bold text-gray-800">{DEFAULT_TEMPLATES[key].label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{DEFAULT_TEMPLATES[key].desc}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800">Đang sửa: {selectedMeta.label}</label>
                                        <p className="text-xs text-gray-500">Các biến không nên đổi: {'{{customerName}}'}, {'{{phone}}'}, {'{{date}}'}, {'{{time}}'}, {'{{pax}}'}, {'{{table}}'}, {'{{menus}}'}, {'{{oldStatus}}'}, {'{{newStatus}}'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={resetSelectedTemplate}
                                        className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        Khôi phục mẫu gốc
                                    </button>
                                </div>

                                <textarea
                                    value={templateValues[selectedTemplate]}
                                    onChange={(e) => handleTemplateChange(e.target.value)}
                                    rows={14}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm leading-6 font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>💡 Lưu ý:</strong> Cấu hình SMTP (host, port, mật khẩu) được quản lý trên <strong>Vercel Environment Variables</strong> để đảm bảo bảo mật.
                                Liên hệ quản trị hệ thống nếu cần thay đổi thông tin SMTP.
                            </p>
                        </div>
                    </>
                )}
            </div>

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
